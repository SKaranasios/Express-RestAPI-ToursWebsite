const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

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
  .then(() =>
    //console.log(con.connections);
    console.log('DB connection successful')
  );

const app = require('./app');

//SERVER STARTED
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('server started');
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION');
  server.close(() => {
    process.exit(1);
  });
});

//UNCLEAN STATE
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION 🤷‍♂️ SHUTTING DOWN....');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
