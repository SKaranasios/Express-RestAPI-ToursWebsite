const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    role: req.body.role,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
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
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token do not longer exist', 401)
    );
  }
  //4)CHECK IF USER CHANGED PASSWORD AFTER THE JWT ISSUED

  //decode issued at
  //it rerutns true or false
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recenntly changed passwords!Please Login agian!', 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE

  //saving in request an object user to use it later
  req.user = currentUser;
  next();
});

//we need to pass arguments to middleware --which  that doesn;t work
//we will actually create wrapper function whicj will return middleware function that we want to create
//the middleware function will get access to roles cause its a closure
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You don;t have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get User based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with taht email', 404));
  }

  //2)Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  //we don't save the new document in the model method
  //to turn off all the validators
  await user.save({ validateBeforeSave: false });

  //3) Send it to user's email
  //req.protocol http/https
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot your password ?? submit a patch request with new your new password and passwordConfirm to ${resetURL}.\n
  if you didnt forget your password,please ignore the mail`;

  try {
    console.log('entered try block');
    await sendEmail({
      email: user.email, //req.body.email
      subject: 'your password reset token is valid for 10 mins',
      message: message
    });

    //if an error happens
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('there was an error sending email.please try again', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //2)If token not exprited and there is user , set the new password
  //at the seame time here we find the user and check if token has yet expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  //3) UPdate changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  //4) Log the user in , send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)Get user
  const user = await User.findById(req.user.id).select('+password');
  //2) CHeck if password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current Password is wrong', 401));
  }
  //3)CHange Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4)Log in send JWT
  createSendToken(user, 200, res);
});
