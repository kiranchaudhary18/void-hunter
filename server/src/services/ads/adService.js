import rewardedAdService from './rewardedAdService.js';
import { getAdProviderAdapter, SimulatedDevAdAdapter, ProductionAdNetworkAdapter } from './adProviderAdapter.js';

/**
 * Unified Ad Service Gateway (Section 48 Specifications)
 */
export const adService = {
  createOpportunity: (userId, placement, options) => rewardedAdService.createOpportunity(userId, placement, options),
  recordHeartbeat: (adId, userId, elapsedSeconds) => rewardedAdService.recordHeartbeat(adId, userId, elapsedSeconds),
  verifyAd: (adId, userId, payload) => rewardedAdService.verifyAd(adId, userId, payload),
  claimReward: (adId, userId) => rewardedAdService.claimReward(adId, userId),
  getProviderAdapter: (name) => getAdProviderAdapter(name)
};

export {
  rewardedAdService,
  getAdProviderAdapter,
  SimulatedDevAdAdapter,
  ProductionAdNetworkAdapter
};

export default adService;
