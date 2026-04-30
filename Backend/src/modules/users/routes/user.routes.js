const express = require('express');
const router = express.Router();
const { z } = require('zod');
const userController = require('../controllers/user.controller');
const { protect } = require('../../../middlewares/clerk.middleware');
const ApiResponse = require('../../../utils/apiResponse');
const { sanitizeText, sanitizeUsername, sanitizeCid } = require('../../../utils/inputSanitizer');

const updateProfileSchema = z.object({
  username: z.string().transform((value) => sanitizeUsername(value)).optional(),
  firstName: z.string().transform((value) => sanitizeText(value, 50)).optional(),
  lastName: z.string().transform((value) => sanitizeText(value, 50)).optional(),
  profileCid: z.string().transform((value) => sanitizeCid(value, 120)).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'No profile fields provided',
});

function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid request body';
      return ApiResponse.badRequest(res, message);
    }
    req.body = parsed.data;
    return next();
  };
}

router.get('/me', protect, userController.getMe);
router.patch('/me', protect, validateBody(updateProfileSchema), userController.updateProfile);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/:userId', userController.getUserById);

module.exports = router;
