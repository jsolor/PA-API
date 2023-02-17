const { Client } = require('pg');
const path = require('path');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sdc',
  password: 'pg',
  port: '5432',
});

async function productsETL() {
  await client.connect();

  client
    .query(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name VARCHAR (30) NOT NULL,
        slogan VARCHAR (256) NOT NULL,
        description VARCHAR (512) NOT NULL,
        category VARCHAR (20) NOT NULL,
        default_price VARCHAR (10) NOT NULL
      )`)
    // .then((res) => console.log(res))
    .then(() => client.query(`
      COPY products(id, name, slogan, description, category, default_price)
        FROM '${path.join(__dirname, '../Data/product.csv')}'
        DELIMITER ','
        CSV HEADER
    `))
    // .then((res) => console.log(res))
    .catch((e) => console.log(e)); // .finally(() => client.end());

  client
    .query(`
      CREATE TABLE IF NOT EXISTS features (
        id INTEGER PRIMARY KEY,
        product_id INTEGER
          REFERENCES products(id),
        feature VARCHAR (24) NOT NULL,
        value VARCHAR (30)
    )`)
    // .then((res) => console.log(res))
    .then(() => client.query(`
      COPY features(id, product_id, feature, value)
        FROM '${path.join(__dirname, '../Data/features.csv')}'
        DELIMITER ','
        CSV HEADER
    `))
    // .then((res) => console.log(res))
    .catch((e) => console.log(e)); // .finally(() => client.end());

  client
    .query(`
      CREATE TABLE IF NOT EXISTS styles (
        id INTEGER PRIMARY KEY,
        product_id INTEGER
          REFERENCES products(id),
        name VARCHAR (30),
        sale_price VARCHAR (10),
        original_price VARCHAR (10),
        default_style BOOLEAN
    )`)
    // .then((res) => console.log(res))
    .then(() => client.query(`
      COPY styles(id, product_id, name, sale_price, original_price, default_style)
        FROM '${path.join(__dirname, '../Data/styles.csv')}'
        DELIMITER ','
        CSV HEADER
    `))
    // .then((res) => console.log(res))
    .catch((e) => console.log(e)); // .finally(() => client.end());

  client
    .query(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY,
        style_id INTEGER NOT NULL
          REFERENCES styles(id),
        url VARCHAR (155),
        thumbnail_url VARCHAR (155)
    )`)
    // .then((res) => console.log(res))
    .then(() => client.query(`
      COPY photos(id, style_id, url, thumbnail_url)
        FROM '${path.join(__dirname, '../Data/photos.csv')}'
        DELIMITER ','
        CSV HEADER
    `))
    // .then((res) => console.log(res))
    .catch((e) => console.log(e)); // .finally(() => client.end());

  client
    .query(`
      CREATE TABLE IF NOT EXISTS skus (
        id INTEGER PRIMARY KEY,
        style_id INTEGER NOT NULL
          REFERENCES styles(id),
        size VARCHAR (10),
        quantity INTEGER
    )`)
    // .then((res) => console.log(res))
    .then(() => client.query(`
      COPY skus(id, style_id, size, quantity)
        FROM '${path.join(__dirname, '../Data/skus.csv')}'
        DELIMITER ','
        CSV HEADER
    `))
    // .then((res) => console.log(res))
    .catch((e) => console.log(e)); // .finally(() => client.end());

  client
    .query(`
      CREATE TABLE IF NOT EXISTS related (
        id INTEGER PRIMARY KEY,
        current_product_id INTEGER NOT NULL
          REFERENCES products(id),
        related_product_id INTEGER NOT NULL
          REFERENCES products(id)
    )`)
    // .then((res) => console.log(res))
    .then(() => client.query(`
      COPY related(id, current_product_id, related_product_id)
        FROM '${path.join(__dirname, '../Data/related.csv')}'
        DELIMITER ','
        CSV HEADER
        NULL '0'
        WHERE current_product_id IS NOT NULL AND related_product_id IS NOT NULL
    `))
    // .then((res) => console.log(res))
    .catch((e) => console.log(e)); // .finally(() => client.end());
}

async function productsETL2() {
  await client.connect();

  client
    .query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        category VARCHAR (20) NOT NULL
      )
    `)
    // .then((res) => console.log(res))
    .then(() => client.query(`
      INSERT INTO categories(category)
      (
        SELECT DISTINCT category
        FROM products
      )
    `))
    // .then((res) => console.log(res))
    .then(() => client.query(`
        ALTER TABLE products
        ADD COLUMN category_id INTEGER
          REFERENCES categories(id)
    `))
    .then(() => client.query(`
        UPDATE products
        SET category_id = categories.id
        FROM categories
        WHERE products.category = categories.category
    `))
    // .then((res) => console.log(res))
    .then(() => client.query(`
        ALTER TABLE products
        DROP COLUMN category
    `))
    // .then((res) => console.log(res))
    .catch((e) => console.log(e))
    .finally(() => client.end());
}

productsETL();
productsETL2();