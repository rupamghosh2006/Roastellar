const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  battleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battle',
    required: true,
    index: true,
  },
  predictor: {
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
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  settled: {
    type: Boolean,
    default: false,
    index: true,
  },
  won: {
    type: Boolean,
    default: false,
  },
  escrowTxHash: {
    type: String,
    default: '',
  },
  chainTxHash: {
    type: String,
    default: '',
  },
  payoutTxHash: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

predictionSchema.index({ battleId: 1, predictor: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);
