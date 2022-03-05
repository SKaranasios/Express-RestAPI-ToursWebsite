const express = require('express');

//exports. --> object
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
//or destructuring
//const {getAllTours,...}=  require('./../controllers/tourController');

const router = express.Router();

//val parameter will hold parameter value
//router.param('id', tourController.checkID);

//create a checkbody middleware
//check if body contains the name and price property
//if not 400 status code (bad request).
//add it to the post handler stack

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plans/:year').get(tourController.getMonthlyPlan);

//like mini apps with seperate routes for each resource
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
