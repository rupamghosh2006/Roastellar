const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const userController = require('../controllers/user.controller');
const { protect } = require('../../../middlewares/clerk.middleware');
const ApiResponse = require('../../../utils/apiResponse');
const { sanitizeText, sanitizeUsername, sanitizeCid } = require('../../../utils/inputSanitizer');

const avatarUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many profile picture uploads. Please try again later.' },
});

const updateProfileSchema = z.object({
  username: z.string().transform((value) => sanitizeUsername(value)).optional(),
  firstName: z.string().transform((value) => sanitizeText(value, 50)).optional(),
  lastName: z.string().transform((value) => sanitizeText(value, 50)).optional(),
  profileCid: z.string().transform((value) => sanitizeCid(value, 120)).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'No profile fields provided',
});

const avatarUploadSchema = z.object({
  dataUrl: z.string().min(1).max(7 * 1024 * 1024),
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
router.get('/me/matches', protect, userController.getMyMatchHistory);
router.post('/me/avatar', protect, avatarUploadLimiter, validateBody(avatarUploadSchema), userController.uploadAvatar);
router.patch('/me', protect, validateBody(updateProfileSchema), userController.updateProfile);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/:userId', userController.getUserById);

module.exports = router;
