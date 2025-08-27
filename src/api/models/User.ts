import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'tutor' | 'admin';
  profilePicture?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: Date;
  location?: string;
  timezone?: string;
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialId?: string;
    credentialUrl?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    graduationYear: number;
    fieldOfStudy: string;
    gpa?: number;
  }>;
  rating?: number;
  totalRatings: number;
  totalSessions: number;
  isVerified: boolean;
  isActive: boolean;
  lastActive: Date;
  preferences?: {
    subjects?: string[];
    availability?: string[];
    maxPrice?: number;
    currency?: string;
    language?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'tutor', 'admin'],
    required: true
  },
  profilePicture: {
    type: String,
    match: /^https?:\/\/.+/
  },
  bio: {
    type: String,
    maxlength: 500
  },
  phone: {
    type: String,
    match: /^\+?[\d\s\-\(\)]+$/
  },
  dateOfBirth: Date,
  location: String,
  timezone: {
    type: String,
    default: 'UTC'
  },
  skills: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: Date,
    credentialId: String,
    credentialUrl: {
      type: String,
      match: /^https?:\/\/.+/
    }
  }],
  education: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    graduationYear: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 10
    },
    fieldOfStudy: {
      type: String,
      required: true,
      trim: true
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4.0
    }
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSessions: {
    type: Number,
    default: 0,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  preferences: {
    subjects: [String],
    availability: [String],
    maxPrice: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      default: 'USD'
    },
    language: [String]
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ rating: -1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ isActive: 1 });

// Virtual for average rating display
userSchema.virtual('averageRating').get(function(this: any) {
  return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : '0.0';
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function(this: any) {
  const fields = ['name', 'email', 'bio', 'profilePicture', 'skills', 'certifications', 'education'];
  const completed = fields.filter(field => this[field] && 
    (Array.isArray(this[field]) ? this[field].length > 0 : true));
  return Math.round((completed.length / fields.length) * 100);
});

// Pre-save middleware to update lastActive
userSchema.pre('save', function(this: any, next) {
  this.lastActive = new Date();
  next();
});

// Method to update rating
userSchema.methods.updateRating = async function(newRating: number) {
  if (newRating < 0 || newRating > 5) {
    throw new Error('Rating must be between 0 and 5');
  }
  
  const totalRating = (this.rating * this.totalRatings) + newRating;
  this.totalRatings += 1;
  this.rating = totalRating / this.totalRatings;
  
  return await this.save();
};

// Method to increment session count
userSchema.methods.incrementSessionCount = async function() {
  this.totalSessions += 1;
  return await this.save();
};

export default mongoose.model<IUser>('User', userSchema);