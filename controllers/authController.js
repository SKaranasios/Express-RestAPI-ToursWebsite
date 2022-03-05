const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // let creds = {...req.body}
  // creds.email = req.body.email
  const { email, password } = req.body;

  //1) Check if password email exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  //2) check if user exists && password is correct
  const user = await User.findOne({ email: email }).select('+password');

  //if we do it that way if the user doesn;t exist we dont have access to user model to access password to compare them
  //const correct =await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email r password', 401));
  }
  //console.log(user);

  //3) If everythting ok send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //var, const in ES6 are scope variable
  let token;
  //1)GET TOKEN AND CHECK IF ITS THERE
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  //console.log(token);

  if (!token) {
    return next(new AppError('you are not logged in', 401));
  }

  //2) VERIFICATION TOKEN
  //will return a promise and then we actually call the function and await it to store the result to a variable(decoded data from jwt)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  //3) CHECK IF USER STILL EXISTS
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token do not longer exist', 401)
    );
  }
  //4)CHECK IF USER CHANGED PASSWORD AFTER THE JWT ISSUED

  //decode issued at
  //it rerutns true or false
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recenntly changed passwords!Please Login agian!', 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});
