const fs = require('fs');
const express = require('express');

//exports. --> object
const tourController = require('./../controllers/tourController');
//destructuring
//const {getAllTours}=  require('./../controllers/tourController');

const router = express.Router();

//like mini apps with seperate routes for each resource
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
