const battleService = require('../../battles/services/battle.service');
const Battle = require('../../battles/models/battle.model');
const Prediction = require('../models/prediction.model');

class PredictionService {
  async place({ user, matchId, selectedPlayer, amount }) {
    return battleService.placePrediction({
      user,
      matchId,
      selectedPlayer,
      amount,
    });
  }

  async getSummary(matchId) {
    return battleService.predictionSummary(matchId);
  }

  async getAllForMatch(matchId) {
    const battle = await Battle.findOne({ matchId });
    if (!battle) {
      throw new Error('Battle not found');
    }

    const predictions = await Prediction.find({ battleId: battle._id })
      .populate('predictor', 'username avatar imageUrl')
      .populate('selectedPlayer', 'username avatar imageUrl')
      .sort({ createdAt: -1 });

    return predictions;
  }
}

module.exports = new PredictionService();
