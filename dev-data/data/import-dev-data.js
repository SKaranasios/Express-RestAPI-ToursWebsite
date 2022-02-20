const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    //console.log(con.connections);
    console.log('DB connection succesdful');
  });

//IMPORT DATA

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data syccesfully imported');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//DELETE DATA
const deleteData = async () => {
  try {
    await Tour.deleteMany({});
    console.log('Data syccesfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
