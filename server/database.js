const { Client } = require('pg');
const path = require('path');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sdc',
  password: 'pg',
  port: '5432',
});

module.exports = client;
