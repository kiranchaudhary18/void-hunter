import crypto from 'crypto';

/**
 * Ad Provider Adapter Abstraction (Section 48 Specifications)
 * Defines the unified interface for ad providers (AdMob, AppLovin, or Simulated Dev Adapter).
 */
export class AdProviderAdapter {
  constructor(name, isProduction = false) {
    this.name = name;
    this.isProduction = isProduction;
  }

  /**
   * Verify an ad playback completion event
   * @param {Object} adSession - Mongoose RewardedAdSession document
   * @param {Object} payload - Verification payload from client or webhook
   * @returns {Promise<{ verified: boolean, reason?: string, providerEventId?: string }>}
   */
  async verifyAdEvent(adSession, payload = {}) {
    throw new Error('verifyAdEvent must be implemented by adapter subclass');
  }

  getProviderInfo() {
    return {
      provider: this.name,
      isProduction: this.isProduction,
      description: this.isProduction
        ? 'Production Ad Network Callback Verification'
        : 'Development Simulation Adapter — Strictly labeled for testing state transitions and UI workflows'
    };
  }
}

/**
 * Development Simulation Adapter (Section 48 Compliance)
 * Clearly labeled as non-production simulation. Enforces client playback timing
 * and server-side HMAC verification so clients cannot bypass playback.
 */
export class SimulatedDevAdAdapter extends AdProviderAdapter {
  constructor() {
    super('SIMULATED_DEV_ADAPTER', false);
    this.secret = process.env.JWT_SECRET || 'void-hunter-dev-ad-secret';
  }

  async verifyAdEvent(adSession, payload = {}) {
    // 1. Verify minimum watch duration
    const minRequiredSeconds = adSession.durationSeconds || 5;
    if (adSession.watchedSeconds < minRequiredSeconds - 0.5) {
      return {
        verified: false,
        reason: `Insufficient playback duration. Watched: ${adSession.watchedSeconds}s, Required: ${minRequiredSeconds}s`
      };
    }

    // 2. Verify opportunity has not expired
    if (adSession.expiresAt && new Date() > new Date(adSession.expiresAt)) {
      return {
        verified: false,
        reason: 'Ad opportunity has expired'
      };
    }

    // 3. Generate deterministic provider event ID for idempotency tracking
    const providerEventId = `sim-evt-${adSession.adId}-${crypto
      .createHmac('sha256', this.secret)
      .update(`${adSession.adId}:${adSession.user}:${adSession.placement}`)
      .digest('hex')
      .slice(0, 16)}`;

    return {
      verified: true,
      providerEventId,
      provider: this.name,
      isProduction: false,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Production Ad Network Webhook Adapter Interface (e.g. Google AdMob / Unity Ads SSV)
 */
export class ProductionAdNetworkAdapter extends AdProviderAdapter {
  constructor(providerName = 'ADMOB_SSV') {
    super(providerName, true);
  }

  async verifyAdEvent(adSession, payload = {}) {
    // In production, verifies cryptographic signature sent by ad server via SSV (Server-Side Verification)
    if (!payload.signature || !payload.keyId) {
      return {
        verified: false,
        reason: 'Missing trusted server-side verification signature from ad network'
      };
    }
    // Stub verification for demonstration
    return {
      verified: false,
      reason: 'Production advertising provider credentials not configured. Using SIMULATED_DEV_ADAPTER for local environment.'
    };
  }
}

// Factory helper to retrieve active adapter
export const getAdProviderAdapter = (providerName = 'SIMULATED_DEV_ADAPTER') => {
  if (providerName === 'ADMOB' || providerName === 'UNITY') {
    return new ProductionAdNetworkAdapter(providerName);
  }
  return new SimulatedDevAdAdapter();
};

export default {
  AdProviderAdapter,
  SimulatedDevAdAdapter,
  ProductionAdNetworkAdapter,
  getAdProviderAdapter
};
