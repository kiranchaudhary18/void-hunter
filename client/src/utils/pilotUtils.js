/**
 * Pilot Progression and Rank Utilities for VOID HUNTER
 * Maps pilot experience levels to military space fleet rank tiers.
 */

export const getPilotRank = (level = 1, currentRank) => {
  if (level >= 10) return 'Fleet Admiral';
  if (level >= 8) return 'Wing Commander';
  if (level >= 6) return 'Squadron Leader';
  if (level >= 4) return 'Flight Officer';
  if (level >= 2) return 'Star Aviator';
  return currentRank || 'Star Cadet';
};

export const getNextRankInfo = (level = 1) => {
  if (level < 2) return { title: 'Star Aviator', level: 2 };
  if (level < 4) return { title: 'Flight Officer', level: 4 };
  if (level < 6) return { title: 'Squadron Leader', level: 6 };
  if (level < 8) return { title: 'Wing Commander', level: 8 };
  if (level < 10) return { title: 'Fleet Admiral', level: 10 };
  return { title: 'Supreme Fleet Commander', level: 'MAX' };
};
