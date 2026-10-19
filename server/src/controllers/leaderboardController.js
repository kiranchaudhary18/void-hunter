import PlayerProfile from '../models/PlayerProfile.js';
import User from '../models/User.js';
import PlayerMissionProgress from '../models/PlayerMissionProgress.js';

// Human-readable ship name mapping
const SHIP_ROSTER = {
  'v01-orbitron': 'Orbitron Vanguard',
  's02-phoenix': 'Phoenix Striker',
  'x03-shadow': 'Shadow Phantom',
  'r04-titan': 'Titan Dreadnought',
  'z05-nova': 'Nova Crusader'
};

/**
 * @desc    Get Global Pilot Leaderboard with pinned user rank (Section 29 & Screen 10)
 * @route   GET /api/leaderboard
 * @access  Public / Private (Private enhances user ranking pin)
 */
export const getLeaderboard = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { timeFrame = 'ALL_TIME', limit = 50 } = req.query;

    // Timeframe date boundary computation
    let dateFilter = {};
    const now = new Date();
    if (timeFrame === 'TODAY' || timeFrame === 'DAILY') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      dateFilter = { updatedAt: { $gte: oneDayAgo } };
    } else if (timeFrame === 'WEEKLY' || timeFrame === 'THIS_WEEK') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { updatedAt: { $gte: sevenDaysAgo } };
    }

    // Exclude test fixture automated bot accounts
    const testBotUsers = await User.find({
      email: { $regex: '^(pilota_|pilotb_|hacker_|invariant_|admin_\\d+)', $options: 'i' }
    }).select('_id');
    const excludedUserIds = testBotUsers.map((u) => u._id);

    // Build query filter
    const profileFilter = {
      user: { $nin: excludedUserIds }
    };

    // Apply timeframe activity filter if specified
    if (dateFilter.updatedAt) {
      profileFilter.updatedAt = dateFilter.updatedAt;
    }

    // Primary deterministic sorting criteria:
    // 1. totalScore desc
    // 2. highestScore desc
    // 3. missionsCompleted desc
    // 4. level desc
    // 5. createdAt asc (earlier registration wins deterministic tie-break)
    const sortCriteria = {
      'stats.totalScore': -1,
      'stats.highestScore': -1,
      'stats.missionsCompleted': -1,
      level: -1,
      createdAt: 1
    };

    // Fetch matching profiles
    let topProfiles = await PlayerProfile.find(profileFilter)
      .sort(sortCriteria)
      .limit(parseInt(limit, 10))
      .populate('user', 'name callsign avatar email role');

    // Filter out any orphaned profiles whose user document no longer exists
    topProfiles = topProfiles.filter((p) => p.user && p.user._id);

    // If a time-scoped filter (TODAY / THIS_WEEK) has 0 active profiles,
    // we return the top verified combat pilots with a clear indicator rather than an empty page
    let isFallbackToAllTime = false;
    if (topProfiles.length === 0 && (timeFrame === 'TODAY' || timeFrame === 'DAILY' || timeFrame === 'WEEKLY' || timeFrame === 'THIS_WEEK')) {
      topProfiles = await PlayerProfile.find({ user: { $nin: excludedUserIds } })
        .sort(sortCriteria)
        .limit(parseInt(limit, 10))
        .populate('user', 'name callsign avatar email role');
      topProfiles = topProfiles.filter((p) => p.user && p.user._id);
      isFallbackToAllTime = true;
    }

    // Aggregate stars and format clean pilot data
    const leaderboard = await Promise.all(
      topProfiles.map(async (profile, index) => {
        const starCount = await PlayerMissionProgress.aggregate([
          { $match: { user: profile.user?._id } },
          { $group: { _id: null, totalStars: { $sum: '$stars' } } }
        ]);

        const rawName = profile.user?.name || 'Vanguard Ace';
        const shipId = profile.selectedShipId || 'v01-orbitron';
        const shipName = SHIP_ROSTER[shipId] || 'Orbitron Vanguard';

        return {
          rank: index + 1,
          userId: profile.user?._id,
          name: rawName,
          callsign: profile.user?.callsign || rawName.toUpperCase(),
          level: profile.level || 1,
          pilotRank: profile.pilotRank || 'Star Cadet',
          totalScore: profile.stats?.totalScore || 0,
          highestScore: profile.stats?.highestScore || 0,
          missionsCompleted: profile.stats?.missionsCompleted || 0,
          stars: starCount.length > 0 ? starCount[0].totalStars : 0,
          shipId,
          shipName,
          verified: true
        };
      })
    );

    // Compute requesting pilot's personal rank if authenticated
    let userRankData = null;
    if (currentUserId) {
      const allProfiles = await PlayerProfile.find({ user: { $nin: excludedUserIds } })
        .sort(sortCriteria)
        .populate('user', 'name callsign');

      const userIndex = allProfiles.findIndex(
        (p) => p.user && p.user._id.toString() === currentUserId.toString()
      );

      if (userIndex !== -1) {
        const myProfile = allProfiles[userIndex];
        const userObj = await User.findById(currentUserId);
        const myStars = await PlayerMissionProgress.aggregate([
          { $match: { user: myProfile.user?._id || currentUserId } },
          { $group: { _id: null, totalStars: { $sum: '$stars' } } }
        ]);

        const myShipId = myProfile.selectedShipId || 'v01-orbitron';
        userRankData = {
          rank: userIndex + 1,
          name: userObj?.name || 'Commander',
          callsign: userObj?.callsign || userObj?.name?.toUpperCase() || 'COMMANDER',
          level: myProfile.level || 1,
          pilotRank: myProfile.pilotRank || 'Star Cadet',
          totalScore: myProfile.stats?.totalScore || 0,
          highestScore: myProfile.stats?.highestScore || 0,
          missionsCompleted: myProfile.stats?.missionsCompleted || 0,
          stars: myStars.length > 0 ? myStars[0].totalStars : 0,
          shipId: myShipId,
          shipName: SHIP_ROSTER[myShipId] || 'Orbitron Vanguard'
        };
      }
    }

    return res.status(200).json({
      success: true,
      timeFrame,
      isFallbackToAllTime,
      totalPilots: leaderboard.length,
      leaderboard,
      userRank: userRankData,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('getLeaderboard Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving leaderboard rankings' });
  }
};
