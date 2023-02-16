/* eslint-disable no-use-before-define */
const fs = require('fs');
const csv = require('csv-stream');
const through2 = require('through2');
const events = require('events');
const readline = require('readline');
const { db } = require('../db_reviews_postgres');

async function addProducts(path) {
  await db.connect();

  await db.query(`COPY products(id) FROM '${path}' DELIMITER ',' CSV HEADER;`, (err, res) => {
    console.log(err, res);
  });
}

addProducts('../TestData/product.csv');
