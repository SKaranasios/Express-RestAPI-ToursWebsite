const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal that 40 characters'],
      minlength: [10, 'A tour must have more or equal than 10 characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have maxgroup number']
    },
    difficulty: {
      type: String,
      required: [true, ' It should have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'DIfficulty is either :easy,medium,difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1 '],
      max: [5, 'Rating must be below 5'],
      set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      //current document object ,so will not work on update
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'The tour must have a sumamry']
    },
    desctiprion: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'Must have an image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//virtual properties
tourSchema.virtual('durationWeeks').get(function() {
  //this referes to current document which function has called and not the schema
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//FOR EMPEDDING WHICH WE WILL NOT USE IN THIS CASE
// tourSchema.pre('save', async function(next) {
//   //array full of promises.
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   //consume promises
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//DOCUMENT MIDDLEWARE
//pre-hook before command save and create
//pre-save hook
tourSchema.pre('save', function(next) {
  //console.log(this);
  //point to current document
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});

//QUERY MIDDLEWARY
//its executed every time a find query
//not in FindById,we solve this we regular expression
tourSchema.pre(/^find/, function(next) {
  //points to current query
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`QUery took: ${Date.now() - this.start} milliseconds`);
  //console.log(docs);
  next();
});

// tourSchema.pre('findOne', function(next) {
//   this.find({ secretTour: { $ne: true } });
// });

//EXCLUDE SECRET TOUR
//AGREGGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//   //this refers to current aggragation object
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   //console.log(this);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

/*
const testTour = new Tour({
  name: 'The Forest Hiker',
  rating: 4.9,
  price: 497
});

promise that we consume
testTour
  .save()
  .then(doc => {
    console.log(doc);
  })
  .catch(err => {
    console.log('Error', err);
  });

 */
