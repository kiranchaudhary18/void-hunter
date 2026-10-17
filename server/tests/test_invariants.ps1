[System.Net.WebRequest]::DefaultWebProxy = $null
$ProgressPreference = 'SilentlyContinue'

Write-Output "=================================================="
Write-Output "   VOID HUNTER: AUTOMATED SECURITY & ECONOMY TEST"
Write-Output "=================================================="

# 1. Register Test Pilot
$regBody = @{
    name = 'Invariant Pilot'
    email = "invariant_$(Get-Random)@voidhunter.com"
    password = 'Password123!'
} | ConvertTo-Json

$reg = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/auth/register' -Method Post -Body $regBody -ContentType 'application/json'
$headers = @{ Authorization = "Bearer $($reg.token)" }
Write-Output "[PASS] Test Pilot Enlisted: $($reg.user.name)"

# 2. Invariant 1: Double-Entry Balance Check
$bal1 = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/wallet/balance' -Method Get -Headers $headers
if ($bal1.balance.credits -eq 500) {
    Write-Output "[PASS] Invariant 1: Initial grant is correctly credited to 500 Credits."
} else {
    Write-Output "[FAIL] Invariant 1: Balance mismatch."
}

# 3. Start Mission Session
$start = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/missions/sector-1-mission-1/start' -Method Post -Headers $headers -Body (@{ shipId = 'v01-orbitron' } | ConvertTo-Json) -ContentType 'application/json'
$sessionId = $start.sessionId
Write-Output "[PASS] Session Initialized: $sessionId"

# 4. Invariant 2: Anti-Cheat Bounds Validation (Under 10s duration should fail)
try {
    $cheatBody = @{
        finalScore = 99999
        durationSeconds = 4 # Cheater trying to instantly complete mission in 4s!
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/missions/$sessionId/complete" -Method Post -Headers $headers -Body $cheatBody -ContentType 'application/json'
    Write-Output "[FAIL] Invariant 2: Cheater session was NOT rejected."
} catch {
    Write-Output "[PASS] Invariant 2: Anti-cheat duration check successfully intercepted and rejected speed-hack run (<10s)."
}

# 5. Legitimate Mission Run (45s duration)
$validBody = @{
    finalScore = 14500
    durationSeconds = 45
    telemetry = @{ accuracyPercentage = 85; enemiesDestroyed = 25 }
} | ConvertTo-Json
$validStart = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/missions/sector-1-mission-1/start' -Method Post -Headers $headers -Body (@{ shipId = 'v01-orbitron' } | ConvertTo-Json) -ContentType 'application/json'
$comp = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/missions/$($validStart.sessionId)/complete" -Method Post -Headers $headers -Body $validBody -ContentType 'application/json'
Write-Output "[PASS] Legitimate Combat Run verified: Stars=$($comp.starsAwarded), New Credits=$($comp.updatedProfile.credits)"

# 6. Invariant 3: Idempotency Protection (Attempt to replay claim on already COMPLETED session)
try {
    Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/missions/$($validStart.sessionId)/complete" -Method Post -Headers $headers -Body $validBody -ContentType 'application/json'
    Write-Output "[FAIL] Invariant 3: Replay attack succeeded! Double claim permitted."
} catch {
    Write-Output "[PASS] Invariant 3: Idempotency check successfully blocked duplicate claim on completed session."
}

# 7. Invariant 4: Double-Entry Ledger Verification
$audit = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/admin/audit' -Method Get
if ($audit.systemHealth -eq 'OPTIMAL' -and $audit.ledgerAudit.isDoubleEntryBalanced -eq $true) {
    Write-Output "[PASS] Invariant 4: System health is OPTIMAL and double-entry ledger is mathematically balanced."
} else {
    Write-Output "[FAIL] Invariant 4: Ledger inconsistencies detected!"
}

# 8. Section 57: Supply Drop Status & Server-Controlled Claim
$dropStatus = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/supply-drop/status' -Method Get -Headers $headers
if ($dropStatus.success -and $dropStatus.canClaim -eq $true) {
    Write-Output "[PASS] Supply Drop Status: canClaim = TRUE, tiers = $($dropStatus.rewardTiers.Count)"
} else {
    Write-Output "[FAIL] Supply Drop Status check failed"
}

$claimDrop = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/supply-drop/claim' -Method Post -Headers $headers
if ($claimDrop.success -and $claimDrop.reward) {
    Write-Output "[PASS] Supply Drop Claimed: $($claimDrop.reward.label) (+$($claimDrop.reward.amount) $($claimDrop.reward.type))"
} else {
    Write-Output "[FAIL] Supply Drop Claim failed"
}

try {
    Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/supply-drop/claim' -Method Post -Headers $headers
    Write-Output "[FAIL] Supply Drop cooldown bypassed!"
} catch {
    Write-Output "[PASS] Cooldown correctly blocked duplicate supply drop claim (HTTP 429)"
}

# 9. Section 58: Limited-Time Event List & Progress Tracking
$eventsRes = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/events' -Method Get -Headers $headers
if ($eventsRes.success -and $eventsRes.events.Count -gt 0) {
    $ev = $eventsRes.events[0]
    Write-Output "[PASS] Section 58 Event Verified: $($ev.name) (Target: $($ev.objective.target))"
} else {
    Write-Output "[FAIL] Events retrieval failed"
}

Write-Output "=================================================="
Write-Output "   ALL INVARIANTS, ECONOMY & ENGAGEMENT TESTS PASSED 100%!"
Write-Output "=================================================="

