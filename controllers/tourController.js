//const fs = require('fs');
const Tour = require('./../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//2.route handler -- controller

// exports.checkID = (req, res, next, val) => {
//   console.log(`tour id is : ${val}`);
//   //return makes sure it will never call next()
//   // if (req.params.id * 1 > tours.length) {
//   res.status(404).json({
//     status: 'fail',
//     message: 'invalid Id'
//   });
//   // }
//   next();
// };

exports.checkbody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'invalid Id'
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime
    // result: tours.length,
    // data: {
    //   tours: tours
    // }
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);

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

exports.createTour = (req, res) => {
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);

  // tours.push(newTour);
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   //err
  //   () => {
  res.status(201).json({
    status: 'success'
    //       data: {
    //         tour: newTour
    //       }
  });
  //   }
  // );
  //res.send('Done');
};
exports.updateTour = (req, res) => {
  //check if data exist

  res.status(200).json({
    status: 'sucess',
    data: {
      tour: '<updated tour here >'
    }
  });
};

exports.deleteTour = (req, res) => {
  //check if data exist

  //204 data doesnt exist
  res.status(204).json({
    status: 'sucess',
    data: null
  });
};
