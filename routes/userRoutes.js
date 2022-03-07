const express = require('express');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe
} = require('./../controllers/userController');

const authController = require('./../controllers/authController');
//const {deleteMe} = require("../controllers/userController");

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

//Protect all routes afte this middleware
router.use(authController.protect);

router.route('/updateMyPassword').patch(authController.updatePassword);

router.route('/me').get(getMe, getUser);

router.route('/updateMe').patch(updateMe);

router.route('/deleteMe').delete(deleteMe);

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
