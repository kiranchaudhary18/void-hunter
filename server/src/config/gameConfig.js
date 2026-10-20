import dotenv from 'dotenv';
dotenv.config();

export const GAME_NAME = process.env.GAME_NAME || 'VOID HUNTER';
export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/void_hunter';
export const JWT_SECRET = process.env.JWT_SECRET || 'void_hunter_super_secret_jwt_key_2026';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Economy Configuration & Anti-Cheat Bounds
export const ECONOMY_CONFIG = {
  initialCredits: 500,
  initialEnergyCores: 10,
  initialRewardCoins: 0,
  initialShipId: 'v01-orbitron',
  
  // Rewarded Ad limits (Section 34 & 50)
  maxDailyAds: 10,
  maxSessionAds: 5,
  minSecondsBetweenAds: 60,
  maxDailyRevives: 3,
  maxDailyDoubleCredits: 5,
  maxDailyDoubleScores: 5,
  
  // Rewards
  rewards: {
    standardMissionCredits: 100,
    normalEnemyCredits: 2,
    eliteEnemyCredits: 10,
    bossDefeatCredits: 250,
    dailyMissionCredits: 150,
    threeStarBonusCredits: 50
  }
};

export default {
  GAME_NAME,
  PORT,
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  CLIENT_URL,
  ECONOMY_CONFIG
};

export const getPilotRankForLevel = (level = 1) => {
  if (level >= 10) return 'Fleet Admiral';
  if (level >= 8) return 'Wing Commander';
  if (level >= 6) return 'Squadron Leader';
  if (level >= 4) return 'Flight Officer';
  if (level >= 2) return 'Star Aviator';
  return 'Star Cadet';
};

export const getLevelData = (xp = 0, missionsCompleted = 0) => {
  let level = 1;
  let threshold = 50;
  let accumulated = 0;

  while (xp >= accumulated + threshold && level < 100) {
    accumulated += threshold;
    level += 1;
    if (level <= 9) {
      threshold = 40 + level * 10;
    } else if (level === 10) {
      threshold = 250;
    } else {
      threshold = Math.round(threshold * 1.15 + 50);
    }
  }

  if (missionsCompleted && missionsCompleted > 0) {
    const minLevel = Math.min(100, missionsCompleted + 1);
    if (minLevel > level) {
      level = minLevel;
    }
  }

  let nextThreshold = 50;
  let nextAcc = 0;
  for (let l = 1; l <= level; l++) {
    if (l <= 9) {
      nextThreshold = 40 + l * 10;
    } else if (l === 10) {
      nextThreshold = 250;
    } else {
      nextThreshold = Math.round(nextThreshold * 1.15 + 50);
    }
    nextAcc += nextThreshold;
  }

  return {
    level,
    xpToNextLevel: nextAcc,
    pilotRank: getPilotRankForLevel(level)
  };
};
