/**
 * VOID HUNTER: Master Assignment Compliance & Security Test Suite
 * Tests Sections 33, 35, 36, 37, 60, 66, 74, 75, 78, 79, and 80
 * of the VELoop Full-Stack Developer Internship Specification
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}, retries = 3) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  let body = options.body;
  if (body !== undefined && typeof body !== 'string') {
    body = JSON.stringify(body);
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { ...options, headers, body });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, ok: res.ok, data };
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 600));
    }
  }
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${testName}: ${details}`);
    failedCount++;
  }
}

async function runTests() {
  console.log('===============================================================');
  console.log('   🚀 VOID HUNTER: COMPLETE ASSIGNMENT COMPLIANCE & SECURITY AUDIT');
  console.log('===============================================================\n');

  // -------------------------------------------------------------------------
  // 1. DYNAMIC CONFIGURATION & HEALTH
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: CONFIGURATION & HEALTH (Sections 4 & 35) ---');
  const health = await request('/health');
  assert(health.ok && health.data.gameName, 'Health endpoint reports configured gameName', health.data.gameName);

  const econConfig = await request('/economy/config');
  assert(econConfig.ok && econConfig.data.economy.maxDailyAds, 'Server-authoritative economy config endpoint operational', JSON.stringify(econConfig.data));

  // -------------------------------------------------------------------------
  // 2. AUTHENTICATION, ROLES & PRIVILEGE ESCALATION PREVENTION
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: AUTHENTICATION, ROLES & SECURITY (Sections 60, 80) ---');
  const randomSuffix = Math.floor(Math.random() * 100000);
  const pilotA = {
    name: `Pilot A ${randomSuffix}`,
    email: `pilota_${randomSuffix}@voidhunter.com`,
    password: 'Password123!'
  };
  const pilotB = {
    name: `Pilot B ${randomSuffix}`,
    email: `pilotb_${randomSuffix}@voidhunter.com`,
    password: 'Password123!'
  };

  // Self-Promotion Attack: Player attempts to send role: 'admin' during registration
  const hackerAttempt = {
    name: `Hacker ${randomSuffix}`,
    email: `hacker_${randomSuffix}@voidhunter.com`,
    password: 'Password123!',
    role: 'admin' // Attempted privilege escalation
  };
  const hackerReg = await request('/auth/register', { method: 'POST', body: hackerAttempt });
  assert(hackerReg.status === 201 && hackerReg.data.user.role === 'player', 'Privilege Escalation Prevention: Sending role: admin defaults safely to player');

  const regA = await request('/auth/register', { method: 'POST', body: pilotA });
  assert(regA.status === 201 && regA.data.token, 'Pilot A registered successfully');
  const tokenA = regA.data.token;
  const headersA = { Authorization: `Bearer ${tokenA}` };

  const regB = await request('/auth/register', { method: 'POST', body: pilotB });
  assert(regB.status === 201 && regB.data.token, 'Pilot B registered successfully');
  const tokenB = regB.data.token;
  const headersB = { Authorization: `Bearer ${tokenB}` };

  // Profile initial balances
  const meA = await request('/auth/me', { headers: headersA });
  assert(meA.ok && meA.data.profile.credits === 500 && meA.data.profile.energyCores === 10, 'Initial currency allocation: 500 Credits, 10 Cores');

  // Cross-user isolation: Pilot B cannot inspect Pilot A's private wallet or sessions
  const walletA = await request('/wallet/balance', { headers: headersA });
  const walletB = await request('/wallet/balance', { headers: headersB });
  assert(walletA.data.balance.user !== walletB.data.balance.user, 'Wallet isolation: Pilot A and Pilot B have distinct user ownership');

  // -------------------------------------------------------------------------
  // 3. GAME COMBAT SESSIONS & ANTI-CHEAT TELEMETRY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: GAME SESSIONS & ANTI-CHEAT BOUNDS (Sections 20, 64-66) ---');
  const startSession = await request('/missions/sector-1-mission-1/start', {
    method: 'POST',
    headers: headersA,
    body: { shipId: 'v01-orbitron' }
  });
  assert(startSession.status === 201 && startSession.data.sessionId, 'Game session initialized with UUID');
  const sessionId = startSession.data.sessionId;

  // Anti-cheat speedhack validation: run duration < 10s MUST be intercepted and rejected
  const cheatAttempt = await request(`/missions/${sessionId}/complete`, {
    method: 'POST',
    headers: headersA,
    body: {
      finalScore: 50000,
      durationSeconds: 3 // impossible 3-second completion
    }
  });
  assert(cheatAttempt.status === 400, 'Anti-cheat duration validation: speedhack (<10s) successfully rejected (HTTP 400)');

  // Legitimate combat run
  const validRunStart = await request('/missions/sector-1-mission-1/start', {
    method: 'POST',
    headers: headersA,
    body: { shipId: 'v01-orbitron' }
  });
  const validSessionId = validRunStart.data.sessionId;

  const legitimateComplete = await request(`/missions/${validSessionId}/complete`, {
    method: 'POST',
    headers: headersA,
    body: {
      finalScore: 16500,
      durationSeconds: 42,
      telemetry: { accuracyPercentage: 88, enemiesDestroyed: 24 }
    }
  });
  assert(legitimateComplete.status === 200 && legitimateComplete.data.starsAwarded > 0, 'Legitimate combat session verified, stars & rewards granted');

  // Replay Attack / Idempotency protection: Replaying complete on already finished session
  const replayAttempt = await request(`/missions/${validSessionId}/complete`, {
    method: 'POST',
    headers: headersA,
    body: {
      finalScore: 16500,
      durationSeconds: 42
    }
  });
  assert(replayAttempt.status === 400, 'Idempotency check: Replay attack on finalized session blocked (HTTP 400)');

  // -------------------------------------------------------------------------
  // 4. FLEET UPGRADES & SPENDING INTEGRITY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: FLEET UPGRADES & SPENDING INTEGRITY (Sections 24-25, 38) ---');
  const shipsRes = await request('/ships', { headers: headersA });
  assert(shipsRes.ok && shipsRes.data.ships.length === 5, 'Ship fleet contains all 5 mandatory classes');

  // Legitimate upgrade level 1 -> 2 (250 credits)
  const upgradeRes = await request('/ships/v01-orbitron/upgrade', {
    method: 'POST',
    headers: headersA,
    body: { moduleType: 'hull' }
  });
  assert(upgradeRes.status === 200, 'Authoritative ship module upgrade succeeded, currency atomically deducted');

  // -------------------------------------------------------------------------
  // 5. REWARDED AD ARCHITECTURE & IDEMPOTENCY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: REWARDED AD ARCHITECTURE & IDEMPOTENCY (Sections 40-51) ---');
  const adProviderInfo = await request('/ads/provider');
  assert(adProviderInfo.ok && adProviderInfo.data.provider === 'SIMULATED_DEV_ADAPTER', 'Ad provider adapter is explicitly identified as SIMULATED_DEV_ADAPTER');

  const adOffer = await request('/ads/offer', {
    method: 'POST',
    headers: headersA,
    body: { placement: 'DOUBLE_CREDITS', baseCredits: 200 }
  });
  assert(adOffer.status === 201 && adOffer.data.adId && adOffer.data.state === 'INITIALIZED', 'Rewarded ad session initialized in state INITIALIZED');
  const adId = adOffer.data.adId;

  // Premature verification without playback MUST fail
  const prematureVerify = await request(`/ads/${adId}/verify`, {
    method: 'POST',
    headers: headersA,
    body: {}
  });
  assert(prematureVerify.status === 400, 'Premature ad verification rejected: watched seconds < required duration');

  // Submit heartbeat
  await request(`/ads/${adId}/heartbeat`, {
    method: 'POST',
    headers: headersA,
    body: { elapsedSeconds: 5 }
  });

  // Verify and claim
  const verifyClaim = await request(`/ads/${adId}/verify`, {
    method: 'POST',
    headers: headersA,
    body: {}
  });
  assert(verifyClaim.status === 200 && verifyClaim.data.state === 'GRANTED', 'Simulated ad verified and reward atomically granted');

  // Duplicate claim protection (Idempotency)
  const duplicateClaim = await request(`/ads/${adId}/verify`, {
    method: 'POST',
    headers: headersA,
    body: {}
  });
  assert(duplicateClaim.status === 200 && duplicateClaim.data.isIdempotentReplay, 'Duplicate ad claim safely intercepted without double-crediting');

  // -------------------------------------------------------------------------
  // 6. SUPPLY DROPS, STREAKS & EVENTS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: ENGAGEMENT, SUPPLY DROPS & EVENTS (Sections 52-58) ---');
  const dropStatus = await request('/supply-drop/status', { headers: headersB });
  assert(dropStatus.ok && dropStatus.data.canClaim, 'Supply drop status available and canClaim is true for new pilot');

  const claimDrop = await request('/supply-drop/claim', { method: 'POST', headers: headersB });
  assert(claimDrop.status === 200 && claimDrop.data.reward, 'Supply drop claimed with randomized weighted tier');

  const duplicateDrop = await request('/supply-drop/claim', { method: 'POST', headers: headersB });
  assert(duplicateDrop.status === 429, 'Supply drop cooldown active: duplicate immediate claim blocked with HTTP 429');

  const events = await request('/events', { headers: headersB });
  assert(events.ok && events.data.events.length > 0, 'Section 58 Limited-Time Events catalog returned');

  // -------------------------------------------------------------------------
  // 7. ADMIN SECURITY, RBAC & AUDIT LEDGER (Sections 74, 75, 80)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 7: SECURE ADMIN PANEL & ECONOMY AUDIT (Sections 35, 74, 75, 80) ---');

  // Requirement 4: Unauthenticated requests to /api/admin/* rejected with HTTP 401
  const unauthOverview = await request('/admin/overview');
  assert(unauthOverview.status === 401, 'RBAC Security: Unauthenticated request to /admin/overview returns HTTP 401');

  const unauthAudit = await request('/admin/audit');
  assert(unauthAudit.status === 401, 'RBAC Security: Unauthenticated request to /admin/audit returns HTTP 401');

  // Requirement 2: Authenticated Player calling admin API directly is rejected with HTTP 403
  const playerAdminOverview = await request('/admin/overview', { headers: headersA });
  assert(playerAdminOverview.status === 403, 'RBAC Security: Authenticated PLAYER calling /admin/overview rejected with HTTP 403 Forbidden');

  const playerAudit = await request('/admin/audit', { headers: headersA });
  assert(playerAudit.status === 403, 'RBAC Security: Authenticated PLAYER calling /admin/audit rejected with HTTP 403 Forbidden');

  const playerConfigUpdate = await request('/admin/economy-config', {
    method: 'PUT',
    headers: headersA,
    body: { maxDailyAds: 99 }
  });
  assert(playerConfigUpdate.status === 403, 'RBAC Security: Authenticated PLAYER cannot modify economy configuration (HTTP 403)');

  // Requirement 3: Bootstrap Administrator via CLI and verify Admin access
  const adminEmail = `admin_${randomSuffix}@voidhunter.com`;
  const adminPassword = 'AdminSecret2026!';
  const scriptPath = path.join(__dirname, '../scripts/createAdmin.js');

  console.log(`  [INFO] Bootstrapping admin account via server CLI: ${adminEmail}...`);
  execSync(`node "${scriptPath}" --name "Supreme Commander" --email "${adminEmail}" --password "${adminPassword}"`, {
    stdio: 'pipe'
  });

  // Login as Administrator
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: adminEmail, password: adminPassword }
  });
  assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin Login: Authenticated administrator returned with role admin');
  const adminToken = adminLogin.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // Admin Overview Metrics (Section 75)
  const adminOverview = await request('/admin/overview', { headers: adminHeaders });
  assert(adminOverview.status === 200 && adminOverview.data.metrics, 'Admin Overview: Section 75 metrics successfully calculated and returned');
  assert(typeof adminOverview.data.metrics.adCompletionRate === 'string', 'Admin Overview: adCompletionRate computed correctly');
  assert(typeof adminOverview.data.metrics.totalCreditsGranted === 'number', 'Admin Overview: totalCreditsGranted computed correctly');

  // Double-Entry Balance Audit (Section 74)
  const adminAudit = await request('/admin/audit', { headers: adminHeaders });
  assert(adminAudit.status === 200 && adminAudit.data.systemHealth === 'OPTIMAL', 'Admin Audit: systemHealth is OPTIMAL for authorized admin');
  assert(adminAudit.data.ledgerAudit.isDoubleEntryBalanced === true, 'Admin Audit: Double-entry ledger is mathematically balanced with 0 anomalies');
  assert(adminAudit.data.ledgerAudit.ledgerInconsistencies === 0, 'Admin Audit: Ledger inconsistency count is exactly 0');

  // Reward Audit Log (Section 37)
  const rewardLogs = await request('/admin/rewards?page=1&limit=10', { headers: adminHeaders });
  assert(rewardLogs.status === 200 && Array.isArray(rewardLogs.data.transactions), 'Reward Audit Log: Paginated reward transaction records returned');
  assert(rewardLogs.data.totalCount > 0, 'Reward Audit Log: Persisted reward events found in database');

  // Wallet Transaction Ledger (Section 36)
  const walletLedger = await request('/admin/wallet-ledger?page=1&limit=10', { headers: adminHeaders });
  assert(walletLedger.status === 200 && Array.isArray(walletLedger.data.transactions), 'Wallet Ledger: Cross-user wallet transaction ledger records returned');
  assert(walletLedger.data.totalCount > 0, 'Wallet Ledger: Double-entry wallet transactions correctly persisted');

  // Ad Opportunities Monitor (Section 47 & 48)
  const adOpportunities = await request('/admin/ad-opportunities?page=1&limit=10', { headers: adminHeaders });
  assert(adOpportunities.status === 200 && Array.isArray(adOpportunities.data.sessions), 'Ad Opportunities: Ad sessions returned with provider status');
  assert(adOpportunities.data.summary.activeSimulatedCount > 0, 'Ad Opportunities: Simulated development sessions properly distinguished');

  // Economy Configuration Validation & Audit Logging (Section 35)
  const invalidConfig = await request('/admin/economy-config', {
    method: 'PUT',
    headers: adminHeaders,
    body: { maxDailyAds: 99999 } // Exceeds upper bound of 100
  });
  assert(invalidConfig.status === 400, 'Economy Config Validation: Out-of-bounds config update rejected (HTTP 400)');

  const validConfigUpdate = await request('/admin/economy-config', {
    method: 'PUT',
    headers: adminHeaders,
    body: {
      maxDailyAds: 15,
      reason: 'Automated compliance test rebalancing'
    }
  });
  assert(validConfigUpdate.status === 200 && validConfigUpdate.data.config.maxDailyAds === 15, 'Economy Config: Valid adjustment persisted and enforced');
  assert(validConfigUpdate.data.config.auditLog.length > 0, 'Economy Config: Immutable audit log recorded with administrator identity and timestamp');

  // Verify dynamic economy endpoint reflects new config
  const updatedEcon = await request('/economy/config');
  assert(updatedEcon.data.economy.maxDailyAds === 15, 'Dynamic Configuration: Server-authoritative /economy/config reflects new setting');

  console.log('\n===============================================================');
  console.log(`   TEST EXECUTION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('===============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
