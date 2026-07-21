const User = require('../models/user.model');
const Battle = require('../../battles/models/battle.model');
const BattleVote = require('../../battles/models/battleVote.model');
const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');
const { EVENT_TYPES } = require('../../../utils/constants');
const analyticsService = require('../../analytics/services/analytics.service');
const uploadService = require('../../uploads/services/upload.service');
const { sanitizeText, sanitizeUsername, sanitizeCid } = require('../../../utils/inputSanitizer');

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const AVATAR_FORMATS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function normalizeUsername(value) {
  return sanitizeUsername(value);
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasExpectedImageSignature(buffer, contentType) {
  if (contentType === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (contentType === 'image/png') {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  return buffer.length >= 12
    && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
    && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
}

function parseAvatarDataUrl(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/i.exec(String(dataUrl || ''));
  if (!match) {
    throw new Error('Upload a PNG, JPEG, or WebP image');
  }

  const contentType = match[1].toLowerCase();
  const encoded = match[2];
  const buffer = Buffer.from(encoded, 'base64');
  if (!buffer.length || buffer.length > MAX_AVATAR_BYTES || !hasExpectedImageSignature(buffer, contentType)) {
    throw new Error('Avatar image is invalid or exceeds 5 MB');
  }

  return { buffer, contentType, extension: AVATAR_FORMATS[contentType] };
}

exports.getMe = async (req, res) => {
  try {
    const user = req.auth.user;
    const betterRankedCount = await User.countDocuments({
      isBanned: false,
      $or: [
        { rankPoints: { $gt: Number(user.rankPoints || 0) } },
        {
          rankPoints: Number(user.rankPoints || 0),
          xp: { $gt: Number(user.xp || 0) },
        },
        {
          rankPoints: Number(user.rankPoints || 0),
          xp: Number(user.xp || 0),
          wins: { $gt: Number(user.wins || 0) },
        },
      ],
    });

    return ApiResponse.success(res, {
      ...user.toPublicJSON(),
      rank: betterRankedCount + 1,
    });
  } catch (error) {
    logger.error('Get me error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.getMyMatchHistory = async (req, res) => {
  try {
    const user = req.auth.user;
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Math.min(Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 10, 1), 50);

    // A voter cannot also be a player in the same battle, but retaining the
    // vote record lets the profile label the user's relationship to each match.
    const votes = await BattleVote.find({ voter: user._id })
      .select('battleId selectedPlayer')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const voteByBattleId = new Map(
      votes.map((vote) => [String(vote.battleId), String(vote.selectedPlayer)])
    );

    const battles = await Battle.find({
      status: { $in: ['ended', 'draw', 'cancelled'] },
      $or: [
        { player1: user._id },
        { player2: user._id },
        { _id: { $in: votes.map((vote) => vote.battleId) } },
      ],
    })
      .populate('creator', 'username avatar imageUrl clerkId xp wins losses rankPoints badges walletPublicKey')
      .populate('player1', 'username avatar imageUrl clerkId xp wins losses rankPoints badges walletPublicKey')
      .populate('player2', 'username avatar imageUrl clerkId xp wins losses rankPoints badges walletPublicKey')
      .populate('winner', 'username avatar imageUrl clerkId xp wins losses rankPoints badges walletPublicKey')
      .sort({ endedAt: -1, createdAt: -1 })
      .limit(limit);

    const matches = battles.map((battle) => {
      const battleJson = battle.toJSON();
      const userId = String(user._id);
      const isPlayer = String(battle.player1?._id || battle.player1) === userId
        || String(battle.player2?._id || battle.player2) === userId;
      const selectedPlayerId = voteByBattleId.get(String(battle._id));

      return {
        ...battleJson,
        participation: isPlayer
          ? { role: 'player' }
          : { role: 'voter', selectedPlayerId },
      };
    });

    return ApiResponse.success(res, matches);
  } catch (error) {
    logger.error('Get match history error:', error);
    return ApiResponse.error(res, error.message || 'Failed to fetch match history');
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const { buffer, contentType, extension } = parseAvatarDataUrl(req.body?.dataUrl);
    const user = req.auth.user;
    const filename = `avatar_${String(user._id)}_${Date.now()}.${extension}`;
    const upload = await uploadService.uploadFile(buffer, filename, contentType);
    const avatar = uploadService.getGatewayURL(upload.cid);

    user.avatar = avatar;
    user.avatarCid = upload.cid;
    await user.save();

    await analyticsService.trackEvent(EVENT_TYPES.PROFILE_UPDATED, user._id, {
      fields: ['avatar'],
      avatarCid: upload.cid,
    });

    return ApiResponse.success(res, user.toPublicJSON(), 'Profile picture updated');
  } catch (error) {
    logger.error('Avatar upload error:', error);
    const message = error?.message || 'Failed to upload profile picture';
    const statusCode = /PNG, JPEG, or WebP|invalid or exceeds/.test(message) ? 400 : 500;
    return ApiResponse.error(res, message, statusCode);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, firstName, lastName, profileCid } = req.body;
    const user = req.auth.user;

    const updates = {};

    if (username !== undefined) {
      const normalizedUsername = normalizeUsername(username);
      if (!normalizedUsername) {
        return ApiResponse.badRequest(res, 'Username cannot be empty');
      }

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(normalizedUsername)) {
        return ApiResponse.badRequest(res, 'Username must be 3-20 chars and use letters, numbers, or underscore');
      }

      const existingUser = await User.findOne({
        _id: { $ne: user._id },
        username: { $regex: `^${escapeRegex(normalizedUsername)}$`, $options: 'i' },
      }).select('_id');

      if (existingUser) {
        return ApiResponse.conflict(res, 'Username is already taken');
      }

      updates.username = normalizedUsername;
    }

    if (firstName !== undefined) {
      updates.firstName = sanitizeText(firstName, 50);
    }

    if (lastName !== undefined) {
      updates.lastName = sanitizeText(lastName, 50);
    }

    if (profileCid !== undefined) updates.profileCid = sanitizeCid(profileCid, 120);

    if (Object.keys(updates).length === 0) {
      return ApiResponse.badRequest(res, 'No profile fields provided');
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true, runValidators: true }
    );
    await analyticsService.trackEvent(EVENT_TYPES.PROFILE_UPDATED, user._id, {
      fields: Object.keys(updates),
    });

    return ApiResponse.success(res, updatedUser.toPublicJSON(), 'Profile updated');
  } catch (error) {
    logger.error('Update profile error:', error);
    if (error?.code === 11000 && error?.keyPattern?.username) {
      return ApiResponse.conflict(res, 'Username is already taken');
    }
    return ApiResponse.error(res, error.message);
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'xp', limit = 10 } = req.query;
    
    let users;
    if (type === 'wins') {
      users = await User.find({ isBanned: false })
        .sort({ wins: -1 })
        .limit(parseInt(limit))
        .select('username imageUrl xp wins badges');
    } else {
      users = await User.find({ isBanned: false })
        .sort({ xp: -1 })
        .limit(parseInt(limit))
        .select('username imageUrl xp wins badges');
    }

    return ApiResponse.success(res, users);
  } catch (error) {
    logger.error('Leaderboard error:', error);
    return ApiResponse.error(res, error.message);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return ApiResponse.notFound(res, 'User not found');
    }

    return ApiResponse.success(res, user.toPublicJSON());
  } catch (error) {
    logger.error('Get user error:', error);
    return ApiResponse.error(res, error.message);
  }
};
