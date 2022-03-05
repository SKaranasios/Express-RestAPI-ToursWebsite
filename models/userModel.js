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
  }
  //WILL IMPLEMENT LATER
});

userSchema.methods.correctPassword = async function(
  canditatePassword,
  userPassword
) {
  return await bcrypt.compare(canditatePassword, userPassword);
};

//password should be in model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //after cofirmation we no longer need the field
  this.passwordConfirm = undefined;
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

const User = mongoose.model('User', userSchema);

module.exports = User;
