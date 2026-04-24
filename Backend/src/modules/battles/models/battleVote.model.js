const mongoose = require('mongoose');

const battleVoteSchema = new mongoose.Schema({
  battleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battle',
    required: true,
    index: true,
  },
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  selectedPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

battleVoteSchema.index({ battleId: 1, voter: 1 }, { unique: true });

module.exports = mongoose.model('BattleVote', battleVoteSchema);
