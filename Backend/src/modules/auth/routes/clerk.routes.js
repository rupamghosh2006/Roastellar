const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../../users/models/user.model');
const ApiResponse = require('../../../utils/apiResponse');
const logger = require('../../../utils/logger');

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      logger.warn('CLERK_WEBHOOK_SECRET not configured');
      return ApiResponse.badRequest(res, 'Webhook not configured');
    }

    const svixId = req.headers['svix-id'];
    const timestamp = req.headers['svix-timestamp'];
    const signature = req.headers['svix-signature'];

    if (!svixId || !signature || !timestamp) {
      logger.warn('Missing webhook headers', {
        hasSvixId: Boolean(svixId),
        hasSvixTimestamp: Boolean(timestamp),
        hasSvixSignature: Boolean(signature),
      });
      return ApiResponse.badRequest(res, 'Missing webhook signature');
    }

    if (!Buffer.isBuffer(req.body)) {
      logger.warn('Webhook body is not raw bytes; signature cannot be verified safely');
      return ApiResponse.badRequest(res, 'Invalid webhook payload format');
    }

    const isValid = verifyWebhookSignature(req.body, webhookSecret, svixId, timestamp, signature);
    
    if (!isValid) {
      logger.warn('Invalid webhook signature');
      return ApiResponse.badRequest(res, 'Invalid webhook signature');
    }

    const event = JSON.parse(req.body.toString());
    const eventType = event.type;
    const data = event.data;

    logger.info(`Clerk webhook received: ${eventType}`);

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      
      case 'email_address.created':
        await handleEmailCreated(data);
        break;
      
      case 'email_address.deleted':
        await handleEmailDeleted(data);
        break;
      
      default:
        logger.info(`Unhandled event type: ${eventType}`);
    }

    return ApiResponse.success(res, { received: true }, 'Webhook processed');
  } catch (error) {
    logger.error('Webhook error:', error);
    return ApiResponse.error(res, error.message);
  }
});

function verifyWebhookSignature(bodyBuffer, secret, svixId, timestamp, signatureHeader) {
  try {
    const key = secret.startsWith('whsec_')
      ? Buffer.from(secret.slice(6), 'base64')
      : Buffer.from(secret, 'utf8');
    const payload = Buffer.from(`${svixId}.${timestamp}.${bodyBuffer.toString('utf8')}`, 'utf8');
    const expected = crypto.createHmac('sha256', key).update(payload).digest('base64');

    const signatures = String(signatureHeader)
      .split(' ')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .filter((entry) => entry.startsWith('v1,'))
      .map((entry) => entry.slice(3));

    if (signatures.length === 0) {
      return false;
    }

    return signatures.some((signature) => safeCompareBase64(signature, expected));
  } catch (error) {
    logger.error('Signature verification error:', error);
    return false;
  }
}

function safeCompareBase64(a, b) {
  const left = Buffer.from(String(a), 'base64');
  const right = Buffer.from(String(b), 'base64');

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

async function handleUserCreated(data) {
  const clerkId = data.id;
  const email = data.email_addresses?.[0]?.email_address || '';
  const firstName = data.first_name || '';
  const lastName = data.last_name || '';
  const imageUrl = data.image_url || '';
  const username = data.username || `user_${clerkId.slice(0, 8)}`;

  const existingUser = await User.findOne({ clerkId });
  
  if (!existingUser) {
    const user = new User({
      clerkId,
      email,
      firstName,
      lastName,
      imageUrl,
      username,
    });
    
    await user.save();
    logger.info(`User synced from Clerk: ${clerkId}`);
  }
}

async function handleUserUpdated(data) {
  const clerkId = data.id;
  const email = data.email_addresses?.[0]?.email_address || '';
  const firstName = data.first_name || '';
  const lastName = data.last_name || '';
  const imageUrl = data.image_url || '';
  const username = data.username || '';

  const user = await User.findOne({ clerkId });
  
  if (user) {
    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.imageUrl = imageUrl || user.imageUrl;
    if (username) user.username = username;
    
    await user.save();
    logger.info(`User updated from Clerk: ${clerkId}`);
  }
}

async function handleUserDeleted(data) {
  const clerkId = data.id;
  
  const user = await User.findOne({ clerkId });
  
  if (user) {
    user.isBanned = true;
    user.email = `[deleted]_${user.email}`;
    await user.save();
    logger.info(`User soft-deleted from Clerk: ${clerkId}`);
  }
}

async function handleEmailCreated(data) {
  logger.info(`Email created: ${data.email_address}`);
}

async function handleEmailDeleted(data) {
  const clerkId = data.owner_id;
  const email = data.email_address;
  
  const user = await User.findOne({ clerkId });
  
  if (user && user.email === email) {
    const newEmail = data.object.email_addresses?.[0]?.email_address;
    if (newEmail) {
      user.email = newEmail;
      await user.save();
    }
  }
}

module.exports = router;
