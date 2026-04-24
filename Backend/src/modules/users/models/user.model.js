const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  walletPublicKey: {
    type: String,
    sparse: true,
  },
  walletEncryptedSecret: {
    type: String,
    default: '',
  },
  walletCreatedAt: {
    type: Date,
    default: null,
  },
  walletFunded: {
    type: Boolean,
    default: false,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  xp: {
    type: Number,
    default: 0,
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  rankPoints: {
    type: Number,
    default: 0,
  },
  totalBattles: {
    type: Number,
    default: 0,
  },
  badges: [{
    type: String,
  }],
  profileCid: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  lastLoginAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    clerkId: this.clerkId,
    username: this.username,
    email: this.email,
    avatar: this.avatar || this.imageUrl,
    name: this.firstName && this.lastName 
      ? `${this.firstName} ${this.lastName}` 
      : this.name || this.firstName || this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    imageUrl: this.imageUrl,
    walletPublicKey: this.walletPublicKey,
    walletCreatedAt: this.walletCreatedAt,
    walletFunded: this.walletFunded,
    onboardingCompleted: this.onboardingCompleted,
    xp: this.xp,
    wins: this.wins,
    losses: this.losses,
    rankPoints: this.rankPoints,
    totalBattles: this.totalBattles,
    badges: this.badges,
    profileCid: this.profileCid,
    role: this.role,
    createdAt: this.createdAt,
  };
};

userSchema.index({ xp: -1 });
userSchema.index({ wins: -1 });
userSchema.index({ rankPoints: -1 });

module.exports = mongoose.model('User', userSchema);
