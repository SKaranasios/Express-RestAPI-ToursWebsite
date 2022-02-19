//const fs = require('fs');
const Tour = require('./../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//2.route handler -- controller

//export.checkID
//export.checkbody

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      result: tours.length,
      data: {
        tours: tours
      }
    });
  } catch (err) {
    res.status(201).json({
      status: 'failed',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tours: tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err
    });
  }
  //const id = req.params.id * 1;
  // const tour = tours.find(el => el.id === id);
  // console.log(tour);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour
  //   }
  // });
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(201).json({
      status: 'failed',
      message: err
    });
  }
};
// const newTour = new Tour({});
//document here has access to save method
// newTour.save();
//but in here we use create right on the model itself
//instead of using then promises we will use async await
//Tour.create({}).then()

exports.updateTour = async (req, res) => {
  //check if data exist
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'sucess',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(201).json({
      status: 'failed',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    //204 data doesnt exist
    res.status(204).json({
      status: 'sucess',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
