const express = require('express');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe
} = require('./../controllers/userController');

const authController = require('./../controllers/authController');
//const {deleteMe} = require("../controllers/userController");

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router
  .route('/updatePassword')
  .patch(authController.protect, authController.updatePassword);

router.route('/updateMe').patch(authController.protect, updateMe);

router.route('/deleteMe').delete(authController.protect, deleteMe);

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
