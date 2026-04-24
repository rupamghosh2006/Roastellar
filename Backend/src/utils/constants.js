module.exports = {
  BATTLE_STATUS: {
    OPEN: 'open',
    ACTIVE: 'active',
    VOTING: 'voting',
    ENDED: 'ended',
    DRAW: 'draw',
    CANCELLED: 'cancelled',
  },

  BADGES: {
    FIRST_WIN: 'FirstWin',
    FIVE_WINS: 'FiveWins',
    TEN_MATCHES: 'TenMatches',
  },

  EVENT_TYPES: {
    LOGIN: 'login',
    WALLET_CREATED: 'wallet_created',
    BATTLE_CREATED: 'battle_created',
    BATTLE_JOINED: 'battle_joined',
    ROAST_SUBMITTED: 'roast_submitted',
    VOTE_CAST: 'vote_cast',
    PREDICTION_PLACED: 'prediction_placed',
    BATTLE_COMPLETED: 'battle_completed',
    BATTLE_FINISHED: 'battle_finished',
  },

  ROLE: {
    USER: 'user',
    ADMIN: 'admin',
  },

  PLATFORM_FEE_PERCENT: 1,

  XP_REWARD_WIN: 100,
  XP_REWARD_LOSE: 10,
  XP_REWARD_VOTE: 5,

  RANK_POINTS_WIN: 25,
  RANK_POINTS_LOSE: 5,
};
