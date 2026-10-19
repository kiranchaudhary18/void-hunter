/**
 * VOID HUNTER: Multi-Campaign Rewarded Ad Video Library
 * Rotating collection of 5 distinct high-definition sci-fi commercials
 * Designed for 10-second verified rewarded playback
 */

export const AD_CAMPAIGNS = [
  {
    id: 'ad-cybertech',
    title: 'CYBERNETIC WEAPONS EXPO',
    tagline: 'Dual Hyper-Ion Cannons & Antimatter Emitters',
    sponsor: 'CYBERTECH MIL-SPEC INDUSTRIES',
    videoSrc: '/videos/ad_commercial.mp4',
    badge: 'WEAPONS & DPS',
    ctaText: 'VISIT ARMORY'
  },
  {
    id: 'ad-quantum',
    title: 'QUANTUM HYPERDRIVE ENGINES',
    tagline: '50% Rebate on Sub-Light & Warp Core Retrofits',
    sponsor: 'HYPERION PROPULSION LABS',
    videoSrc: '/videos/ad_2.mp4',
    badge: 'PROPULSION',
    ctaText: 'EXPLORE ENGINES'
  },
  {
    id: 'ad-mars',
    title: 'DEEP SPACE MARS EXPEDITION',
    tagline: 'Orbital Reconnaissance & Deep Planetary Survey',
    sponsor: 'AERO-SPACE COALITION',
    videoSrc: '/videos/ad_3.webm',
    badge: 'SECTOR SURVEY',
    ctaText: 'JOIN CONVOY'
  },
  {
    id: 'ad-magnetar',
    title: 'STELLAR MAGNETAR DEFENSE MATRIX',
    tagline: 'Heavy-Shield Deflection against Coronal Plasma',
    sponsor: 'NOVA TECH HARDWARE',
    videoSrc: '/videos/ad_4.webm',
    badge: 'SHIELD TECH',
    ctaText: 'INSPECT SHIELDS'
  },
  {
    id: 'ad-orbital',
    title: 'AUTONOMOUS ORBITAL REPAIR NANITES',
    tagline: 'Self-Deploying Nanite Drones & Rapid Hull Mending',
    sponsor: 'SAGE INDUSTRIAL ROBOTICS',
    videoSrc: '/videos/ad_5.webm',
    badge: 'NANITE DRONES',
    ctaText: 'VIEW BLUEPRINTS'
  }
];

export const getRandomAdCampaign = () => {
  const index = Math.floor(Math.random() * AD_CAMPAIGNS.length);
  return AD_CAMPAIGNS[index];
};

export default AD_CAMPAIGNS;
