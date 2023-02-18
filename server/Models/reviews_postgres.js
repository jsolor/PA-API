
const { Client } = require('pg');
const path = require('path');
// const { connectDb } = require('../database_postgres');
require('dotenv').config(path.join(__dirname, '../../.env'));
// await connectDb();
console.log(process.env.AUTH_SECRET);

const db = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function buildDb() {
  await db.conncet();
  console.log("connected");
}

// pool.query("CREATE TABLE products (product_id INT)", (err, res) => {
//   console.log(err, res);
//   pool.end();
// });

// CREATE TABLE "Products" (
//   "id" int PRIMARY KEY,
// );


// CREATE TABLE "Reviews" (
//   "product_id" int REFERENCES Products(id)
//   "review_id" int PRIMARY KEY,
//   "rating" int,
//   "summary" varchar,
//   "body" varchar,
//   "date" timestamp,
//   "recommend" int,
//   "helpfulness" varchar,
//   "response" varchar,
//   "reviewer_name" varchar,
//   "reviewer_name" varchar,
//   "reviewer_email" varchar,
//   "reported" varchar,

// );


// CREATE TABLE "Meta" (
//   "id" int PRIMARY KEY,
//   "title" varchar,
//   "body" varchar,
//   "minutesRead" varchar,
//   "createdAt" timestamp,
//   "updatedAt" timestamp
// );


// CREATE TABLE "Photos" (
//   "id" int PRIMARY KEY,
//   "title" varchar,
//   "body" varchar,
//   "minutesRead" varchar,
//   "createdAt" timestamp,
//   "updatedAt" timestamp
// );

