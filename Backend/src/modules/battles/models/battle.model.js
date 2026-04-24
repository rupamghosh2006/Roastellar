const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  matchId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  player1Wallet: {
    type: String,
    default: '',
  },
  player2Wallet: {
    type: String,
    default: '',
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  topicCid: {
    type: String,
    default: '',
  },
  roast1: {
    type: String,
    default: '',
  },
  roast2: {
    type: String,
    default: '',
  },
  roast1Cid: {
    type: String,
    default: '',
  },
  roast2Cid: {
    type: String,
    default: '',
  },
  votesPlayer1: {
    type: Number,
    default: 0,
  },
  votesPlayer2: {
    type: Number,
    default: 0,
  },
  spectatorsCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['open', 'active', 'voting', 'ended', 'draw', 'cancelled'],
    default: 'open',
    index: true,
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  entryFee: {
    type: Number,
    required: true,
    min: 1,
  },
  startedAt: {
    type: Date,
  },
  endedAt: {
    type: Date,
  },
  txHash: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

battleSchema.methods.toJSON = function() {
  return {
    id: this._id,
    matchId: this.matchId,
    creator: this.creator,
    player1: this.player1,
    player2: this.player2,
    player1Wallet: this.player1Wallet,
    player2Wallet: this.player2Wallet,
    topic: this.topic,
    topicCid: this.topicCid,
    roast1: this.roast1,
    roast2: this.roast2,
    roast1Cid: this.roast1Cid,
    roast2Cid: this.roast2Cid,
    votesPlayer1: this.votesPlayer1,
    votesPlayer2: this.votesPlayer2,
    spectatorsCount: this.spectatorsCount,
    status: this.status,
    winner: this.winner,
    entryFee: this.entryFee,
    startedAt: this.startedAt,
    endedAt: this.endedAt,
    txHash: this.txHash,
    createdAt: this.createdAt,
  };
};

battleSchema.index({ status: 1, createdAt: -1 });
battleSchema.index({ player1: 1, createdAt: -1 });
battleSchema.index({ player2: 1, createdAt: -1 });
battleSchema.index({ winner: 1, createdAt: -1 });

module.exports = mongoose.model('Battle', battleSchema);
