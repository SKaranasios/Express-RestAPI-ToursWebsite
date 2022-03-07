const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Provide email']
  },
  email: {
    type: String,
    required: [true, 'Provide email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'PLease provide a valid email']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Set a password'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'admin', 'lead-guide'],
    default: 'user'
  },

  passwordChangedAt: {
    type: Date
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm password'],
    validate: {
      //we need to use this keyword so we don;t use arrow function
      //this only works on create & save!!
      validator: function(val) {
        return val === this.password;
      },
      message: 'Password are not the same'
    }
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

//password should be in model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //after cofirmation we no longer need the field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  //False means not chanegd
  return false;
};

userSchema.methods.correctPassword = async function(
  canditatePassword,
  userPassword
) {
  return await bcrypt.compare(canditatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function() {
  //kind of behaves like a password
  const resetToken = crypto.randomBytes(32).toString('hex');
  //just like the password we need to encrypt it to store it to pass it to databse

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  //where will we save this resetToken -- we will create new attribute to our schema
  //10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
