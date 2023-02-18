/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const path = require('path');
const cors = require('cors');
const qAndARouter = require('./Routes/qAndARoutes');
const reviewsRouter = require('./Routes/reviewsRoutes');
const reviewsDb = require('./readDataReviews');

const app = express();

// ----- Middleware ----- //

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
// prefix route for router
app.use('/qa', qAndARouter);
app.use('/r', reviewsRouter);

app.listen(3000, () => {
  reviewsDb.connect();
  console.log('Server started on port 3000');
});
