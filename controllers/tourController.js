//const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//2.route handler -- controller

//export.checkID
//export.checkbody

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//------------------

exports.getAllTours = async (req, res) => {
  try {
    /*1A)FILTERING
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach(el => delete queryObj[el]);

    //1B)ADVANCED FILTERING
    //will return a query object that why we can chain methods
    //let queryStr = JSON.stringify(queryObj);
    //regex \b: exact same value  /g: multiple tiems
    //queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    //let query = Tour.find(JSON.parse(queryStr));
    // console.log(JSON.parse(queryStr));
    // console.log(queryStr);

     */

    /*
    2)SORTING
    //if it contains sort in it
    if (req.query.sort) {
      //sort query bases on attribute of sort
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
      //sort('price ratingsAverage')
    }
    //adding default query
     else {
       query = query.sort('-createdAt');
     }
    // console.log(req.query.sort);

     */

    /*
    3)LIMIT
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
      //$select:('name duration')
    } else {
      query = query.select('-__v');
      //here on the contraty of sorting with - we exclude the field.
    }

     */

    /*
    4)PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = limit * (page - 1);
    //page=1&limit=10 , 1-10: page 1 ,11-20:page 2
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      //throwing error will send us to catch method
      if (skip >= numTours) throw new Error("this page doesn't exist");
    }

     */

    //console.log(req.query);
    //executing the query
    const features = new APIFeatures(Tour.find(), req.query)
      .fitler()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    //query.sort().select().skip().limit()

    //3)RESPONSE
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
  /*
    const tours = await Tour.find({
      duration: 5,
      difficulty: 'easy'
    });


    const tours = await Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy');

     */
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
      // const testTour = new Tour({
      //   name: 'The Forest Hiker',
      //   rating: 4.9,
      //   price: 497
      // });

      //promise that we consume
      // testTour
      //   .save()
      //   .then(doc => {
      //     console.log(doc);
      //   })
      //   .catch(err => {
      //     console.log('Error', err);
      //   });

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

exports.getTourStats = async (req, res) => {
  try {
    //returns aggeragate object
    //to execute it we need to add await
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRattings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: {
          avgPrice: 1
        }
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(201).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          //id not showing up in query
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(201).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
