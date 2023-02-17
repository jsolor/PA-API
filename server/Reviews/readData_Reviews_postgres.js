/* eslint-disable no-use-before-define */
const fs = require('fs');
const csv = require('csv-stream');
const through2 = require('through2');
const papa = require('papaparse');
const events = require('events');
const readline = require('readline');
const pgp = require('pg-promise');
const fastcsv = require('fast-csv');
const { Pool, Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
// const { db } = require('../db_reviews_postgres');

const db = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// addProducts(); // server/TestData/product.csv
// readProductData();

const stream = fs.createReadStream('../TestData/reviews.csv');
const data = [];
const csvStream = fastcsv
  .parse()
  .on('data', (row) => {
    console.log(row[0]);
    data.push(row);
  })
  .on('end', () => {
    // remove the first line: header
    data.shift();
    console.log('DONE');

    const query = 'INSERT INTO reviews (id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES ($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);';

    db.connect((err, client, done) => {
      if (err) throw err;

      db.tx((t) => {
        const queries = data.map((row) => row.none(`INSERT INTO reviews (id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES (${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}, ${row[5]}, ${row[6]}, ${row[7]}, ${row[8]}, ${row[9]}, ${row[10]}, ${row[11]});`, l));
        return t.batch(queries);
      })
        .then((data) => {
          // SUCCESS
          // data = array of null-s
          console.log('added');
        })
        .catch((error) => {
          // ERROR
        });

      // try {
      //   for (let i = 0; i < data.length; i++) {
      //     db.query(query, data[i], (err, res) => {
      //       if (err) {
      //         console.log(err.stack);
      //       } else {
      //         console.log(`inserted ${res.rowCount} row:`, data[i]);
      //       }
      //     });
      //     data[i] = null;
      //   }
      // } finally {
      //   console.log('DONZU');
      //   done();
      // }
    });
  });

stream.pipe(csvStream);
// console.log(data[0]);
