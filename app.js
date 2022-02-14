const fs = require('fs');
const express = require('express');

const app = express();
//app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//its good practice for defining version of API
app.get('/api/v1/tours', (req, res) => {
  //statuscode,header
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours: tours,
    },
  });
});

app.get('/api/v1/tours', (req, res) => {
  console.log(req.params);

  res.status(200).json({
    status: 'success',
  });
});

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
  //res.send('Done');
});

const port = 3000;
app.listen(port, () => {
  console.log('server started');
});
