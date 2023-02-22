const { Client } = require('pg');
const path = require('path');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sdc',
  password: 'pg',
  port: '5432',
});

client.connect((err) => {
  if (err) {
    console.log('connection error: ', err);
  } else {
    console.log('db connected...');
  }
});

module.exports = client;
