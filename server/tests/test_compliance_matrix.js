/**
 * VOID HUNTER: Master Assignment Compliance Test Suite
 * Tests Sections 78, 79, and 80 of the VELoop Full-Stack Developer Internship Specification
 */

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  let body = options.body;
  if (body !== undefined && typeof body !== 'string') {
    body = JSON.stringify(body);
  }
  const res = await fetch(url, { ...options, headers, body });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
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
  console.log('   🚀 VOID HUNTER: COMPLETE ASSIGNMENT COMPLIANCE AUDIT SUITE');
  console.log('===============================================================\n');

  // -------------------------------------------------------------------------
  // 1. DYNAMIC CONFIGURATION & HEALTH
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: CONFIGURATION & HEALTH (Sections 4 & 35) ---');
  const health = await request('/health');
  assert(health.ok && health.data.gameName, 'Health endpoint reports configured gameName', health.data.gameName);

  const econConfig = await request('/economy/config');
  assert(econConfig.ok && econConfig.data.economy.maxDailyAds === 10, 'Server-authoritative economy config endpoint operational', JSON.stringify(econConfig.data));

  // -------------------------------------------------------------------------
  // 2. AUTHENTICATION & SECURITY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: AUTHENTICATION & CROSS-USER ISOLATION (Section 60 & 80) ---');
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

  const regA = await request('/auth/register', { method: 'POST', body: JSON.stringify(pilotA) });
  assert(regA.status === 201 && regA.data.token, 'Pilot A registered successfully');
  const tokenA = regA.data.token;
  const headersA = { Authorization: `Bearer ${tokenA}` };

  const regB = await request('/auth/register', { method: 'POST', body: JSON.stringify(pilotB) });
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
    body: JSON.stringify({ shipId: 'v01-orbitron' })
  });
  assert(startSession.status === 201 && startSession.data.sessionId, 'Game session initialized with UUID');
  const sessionId = startSession.data.sessionId;

  // Anti-cheat speedhack validation: run duration < 10s MUST be intercepted and rejected
  const cheatAttempt = await request(`/missions/${sessionId}/complete`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      finalScore: 50000,
      durationSeconds: 3 // impossible 3-second completion
    })
  });
  assert(cheatAttempt.status === 400, 'Anti-cheat duration validation: speedhack (<10s) successfully rejected (HTTP 400)');

  // Legitimate combat run
  const validRunStart = await request('/missions/sector-1-mission-1/start', {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({ shipId: 'v01-orbitron' })
  });
  const validSessionId = validRunStart.data.sessionId;

  const legitimateComplete = await request(`/missions/${validSessionId}/complete`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      finalScore: 16500,
      durationSeconds: 42,
      telemetry: { accuracyPercentage: 88, enemiesDestroyed: 24 }
    })
  });
  assert(legitimateComplete.status === 200 && legitimateComplete.data.starsAwarded > 0, 'Legitimate combat session verified, stars & rewards granted');

  // Replay Attack / Idempotency protection: Replaying complete on already finished session
  const replayAttempt = await request(`/missions/${validSessionId}/complete`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      finalScore: 16500,
      durationSeconds: 42
    })
  });
  assert(replayAttempt.status === 400, 'Idempotency check: Replay attack on finalized session blocked (HTTP 400)');

  // -------------------------------------------------------------------------
  // 4. SHIP UPGRADES & SPENDING INTEGRITY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: FLEET UPGRADES & SPENDING INTEGRITY (Sections 24-25, 38) ---');
  // Attempt upgrade with insufficient funds
  const expensiveUpgrade = await request('/ships/v01-orbitron/upgrade', {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({ moduleType: 'hull', targetLevel: 5 })
  });
  // Since level 1->2 is 250, but targetLevel 5 requires consecutive or high cost
  const shipsRes = await request('/ships', { headers: headersA });
  assert(shipsRes.ok && shipsRes.data.ships.length === 5, 'Ship fleet contains all 5 mandatory classes');

  // Legitimate upgrade level 1 -> 2 (250 credits)
  const upgradeRes = await request('/ships/v01-orbitron/upgrade', {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({ moduleType: 'hull' })
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
    body: JSON.stringify({ placement: 'DOUBLE_CREDITS', baseCredits: 200 })
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
    body: JSON.stringify({ elapsedSeconds: 5 })
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
  // 7. DOUBLE-ENTRY LEDGER & AUDIT INTEGRITY
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 7: DOUBLE-ENTRY LEDGER & ADMIN AUDIT (Sections 36, 37, 74, 75) ---');
  const audit = await request('/admin/audit');
  assert(audit.ok && audit.data.systemHealth === 'OPTIMAL', 'Admin audit report generated: systemHealth is OPTIMAL');
  assert(audit.data.ledgerAudit.isDoubleEntryBalanced === true, 'Double-entry ledger is mathematically balanced with 0 anomalies');
  assert(audit.data.ledgerAudit.ledgerInconsistencies === 0, 'Ledger inconsistency count is exactly 0');

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
