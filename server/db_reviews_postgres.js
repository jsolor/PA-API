/* eslint-disable no-unused-vars */
const { Pool, Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function buildDb() {
  await db.connect();
  await db.query('DROP TABLE IF EXISTS test, products, reviews, photos, characteristics;', (res) => {
    console.log(res);
  });

  await db.query('CREATE TABLE products (id INT PRIMARY KEY);', (err) => {
    if (err === undefined) {
      console.log('created products table');
    }
  });

  await db.query('CREATE TABLE reviews (product_id INT, id INT PRIMARY KEY, rating INT, summary VARCHAR, body VARCHAR, date TIMESTAMP, recommend INT, helpfulness VARCHAR, reviewer_name VARCHAR, reviewer_email VARCHAR, reported VARCHAR);', (err, res) => {
    if (err !== undefined) {
      console.log(err);
    } else {
      console.log('added reviews table');
    }
  });

  await db.query('CREATE TABLE characteristics (product_id INT, id INT PRIMARY KEY, name VARCHAR, value VARCHAR);', (err, res) => {
    if (err !== undefined) {
      console.log(err);
    } else {
      console.log('added chars table');
    }
  });

  await db.query('CREATE TABLE photos (review_id INT, id INT PRIMARY KEY, url VARCHAR);', (err) => {
    if (err !== undefined) {
      console.log(err);
    } else {
      console.log('added photos table');
    }
  });

  await db.end();
}

async function addForeignKeys() {
  await db.connect();

  await db.query('ALTER TABLE reviews ADD CONSTRAINT fk_products_reviews FOREIGN KEY (product_id) REFERENCES products (id);', (err, res) => {
    if (err !== undefined) {
      console.log(err);
    } else {
      console.log('added reviews FK');
    }
  });

  await db.query('ALTER TABLE photos ADD CONSTRAINT fk_reviews_photos FOREIGN KEY (review_id) REFERENCES reviews (id);', (err, res) => {
    if (err !== undefined) {
      console.log(err);
    } else {
      console.log('added photos constraint');
    }
  });

  await db.query('ALTER TABLE characteristics ADD CONSTRAINT fk_products_chars FOREIGN KEY (product_id) REFERENCES products (id);', (err, res) => {
    if (err !== undefined) {
      console.log(err);
    } else {
      console.log('added reviews table');
    }
  });
};

// buildDb();
// addForeignKeys();

module.exports = { db };
