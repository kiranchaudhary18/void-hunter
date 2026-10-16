import PlayerProfile from '../models/PlayerProfile.js';
import User from '../models/User.js';
import PlayerMissionProgress from '../models/PlayerMissionProgress.js';

/**
 * @desc    Get Global Pilot Leaderboard with pinned user rank (Section 29 & Screen 10)
 * @route   GET /api/leaderboard
 * @access  Public / Private (Private enhances user ranking pin)
 */
export const getLeaderboard = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { timeFrame = 'ALL_TIME', limit = 50 } = req.query;

    // Fetch top profiles sorted by totalScore descending
    const topProfiles = await PlayerProfile.find({})
      .sort({ 'stats.totalScore': -1, level: -1 })
      .limit(parseInt(limit))
      .populate('user', 'name callsign avatar');

    // Aggregate stars for each top pilot
    const leaderboard = await Promise.all(
      topProfiles.map(async (profile, index) => {
        const starCount = await PlayerMissionProgress.aggregate([
          { $match: { user: profile.user?._id } },
          { $group: { _id: null, totalStars: { $sum: '$stars' } } }
        ]);

        return {
          rank: index + 1,
          userId: profile.user?._id,
          name: profile.user?.name || 'Vanguard Ace',
          callsign: profile.user?.name?.toUpperCase() || 'COMMANDER',
          level: profile.level,
          pilotRank: profile.pilotRank,
          totalScore: profile.stats?.totalScore || 0,
          highestScore: profile.stats?.highestScore || 0,
          missionsCompleted: profile.stats?.missionsCompleted || 0,
          stars: starCount.length > 0 ? starCount[0].totalStars : 0,
          shipId: profile.selectedShipId || 'v01-orbitron'
        };
      })
    );

    // Compute requesting pilot's personal rank if authenticated
    let userRankData = null;
    if (currentUserId) {
      const allProfiles = await PlayerProfile.find({}).sort({ 'stats.totalScore': -1 });
      const userIndex = allProfiles.findIndex((p) => p.user.toString() === currentUserId.toString());
      if (userIndex !== -1) {
        const myProfile = allProfiles[userIndex];
        const userObj = await User.findById(currentUserId);
        const myStars = await PlayerMissionProgress.aggregate([
          { $match: { user: myProfile.user } },
          { $group: { _id: null, totalStars: { $sum: '$stars' } } }
        ]);

        userRankData = {
          rank: userIndex + 1,
          name: userObj?.name || 'Commander',
          level: myProfile.level,
          pilotRank: myProfile.pilotRank,
          totalScore: myProfile.stats?.totalScore || 0,
          highestScore: myProfile.stats?.highestScore || 0,
          stars: myStars.length > 0 ? myStars[0].totalStars : 0,
          shipId: myProfile.selectedShipId || 'v01-orbitron'
        };
      }
    }

    return res.status(200).json({
      success: true,
      timeFrame,
      totalPilots: leaderboard.length,
      leaderboard,
      userRank: userRankData
    });
  } catch (error) {
    console.error('getLeaderboard Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving leaderboard rankings' });
  }
};
