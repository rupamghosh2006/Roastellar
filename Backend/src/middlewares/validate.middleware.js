const { z } = require('zod');
const ApiResponse = require('../utils/apiResponse');

const loginSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

const registerUserSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional(),
  profileCid: z.string().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional(),
  profileCid: z.string().optional(),
});

const createBattleSchema = z.object({
  topic: z.string().min(1).max(200).optional(),
  topicCid: z.string().optional(),
  entryFee: z.number().int().positive(),
});

const joinBattleSchema = z.object({
  matchId: z.number().int().positive(),
});

const submitRoastSchema = z.object({
  roastCid: z.string().min(1),
});

const voteSchema = z.object({
  selectedPlayer: z.string().min(1),
});

const predictionSchema = z.object({
  selectedPlayer: z.string().min(1),
  amount: z.number().int().positive(),
});

const uploadSchema = z.object({
  data: z.union([z.string(), z.record(z.any())]),
  name: z.string().optional(),
});

exports.validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return ApiResponse.badRequest(res, 'Validation failed', errors);
    }
    return ApiResponse.badRequest(res, 'Invalid input');
  }
};

exports.schemas = {
  login: loginSchema,
  registerUser: registerUserSchema,
  updateProfile: updateProfileSchema,
  createBattle: createBattleSchema,
  joinBattle: joinBattleSchema,
  submitRoast: submitRoastSchema,
  vote: voteSchema,
  prediction: predictionSchema,
  upload: uploadSchema,
};