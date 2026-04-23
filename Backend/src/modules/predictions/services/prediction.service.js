const axios = require('axios');
const { Prediction } = require('../models/battle.model');
const User = require('../../modules/users/models/user.model');
const Analytics = require('../../modules/analytics/models/analytics.model');
const { EVENT_TYPES } = require('../../utils/constants');
const logger = require('../../utils/logger');

class PredictionService {
  async place(userId, matchId, selectedPlayer, amount) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const existingPrediction = await Prediction.findOne({
      predictor: userId,
      matchId,
    });

    if (existingPrediction) {
      throw new Error('Already placed a prediction');
    }

    const prediction = new Prediction({
      matchId,
      predictor: userId,
      selectedPlayer,
      amount,
    });

    await prediction.save();

    await Analytics.create({
      userId,
      eventType: EVENT_TYPES.PREDICTION_PLACED,
      metadata: { matchId, selectedPlayer, amount },
    });

    return prediction;
  }

  async getPredictionsForMatch(matchId) {
    return Prediction.find({ matchId })
      .populate('predictor', 'name avatar')
      .lean();
  }

  async getUserPredictions(userId) {
    return Prediction.find({ predictor: userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async settlePredictions(matchId, winningPlayerId) {
    const predictions = await Prediction.find({
      matchId,
      settled: false,
    });

    for (const prediction of predictions) {
      const won = prediction.selectedPlayer === winningPlayerId.toString();
      prediction.settled = true;
      prediction.won = won;
      await prediction.save();
    }

    return predictions;
  }
}

class UploadService {
  async uploadToIPFS(data, name = 'metadata') {
    try {
      const formData = new FormData();
      formData.append('file', JSON.stringify(data), {
        filename: `${name}.json`,
        contentType: 'application/json',
      });

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      logger.error(`IPFS upload failed: ${error.message}`);
      throw new Error('Failed to upload to IPFS');
    }
  }

  async uploadJSON(metadata, name = 'metadata') {
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: metadata,
          pinataMetadata: {
            name,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      logger.error(`IPFS JSON upload failed: ${error.message}`);
      throw new Error('Failed to upload to IPFS');
    }
  }

  async pinCID(cid) {
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinByHash',
        {
          hashToPin: cid,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
          },
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      logger.error(`IPFS pin failed: ${error.message}`);
      throw new Error('Failed to pin CID');
    }
  }
}

module.exports = {
  predictionService: new PredictionService(),
  uploadService: new UploadService(),
};