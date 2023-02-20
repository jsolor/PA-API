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
    .catch((e) => console.log(e));

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
    .catch((e) => console.log(e));

  client
    .query(`
      CREATE TABLE IF NOT EXISTS styles (
        style_id INTEGER PRIMARY KEY,
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
    .catch((e) => console.log(e));

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
    .catch((e) => console.log(e));

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
    .catch((e) => console.log(e));

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
    `));
}

async function productsETL2() {
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
    `));
}

async function makeIndexes() {
  client
  .query(`
    CREATE INDEX idx_feats_product_id
    ON features(product_id)
  `)
  .catch((err) => console.log('ERROR: ', err, '\ncouldn\'t make index on features'));
  client
  .query(`
    CREATE INDEX idx_styles_product_id
    ON styles(product_id)
  `)
  .catch((err) => console.log('ERROR: ', err, '\ncouldn\'t make index on styles'));
  client
  .query(`
    CREATE INDEX idx_curr_product_id
    ON related(current_product_id)
  `)
  .catch((err) => console.log('ERROR: ', err, '\ncouldn\'t make index on related products'));
  client
  .query(`
    CREATE INDEX idx_photos_style_id
    ON photos(style_id)
  `)
  .catch((err) => console.log('ERROR: ', err, '\ncouldn\'t make index on photos'));
  client
  .query(`
    CREATE INDEX idx_skus_style_id
    ON skus(style_id)
  `)
  .catch((err) => console.log('ERROR: ', err, '\ncouldn\'t make index on skus'));
}

async function getProduct(pid) {
  return client
    .query(`
      SELECT
        p.id, p.name, p.slogan, p.description, p.default_price, category, ARRAY_AGG(
          properties
        ) AS features
      FROM products p
      LEFT JOIN (
        SELECT product_id, json_build_object('feature',feature, 'value',value) AS properties
        FROM features f
        WHERE product_id = ${pid}
      ) l
      ON p.id = l.product_id
      LEFT JOIN categories c
      ON p.category_id = c.id
      WHERE p.id = ${pid}
      GROUP BY p.id, p.name, p.slogan, p.description, p.default_price, category
    `)
    .then(({ rows }) => rows);
}

async function getProducts(page = 1, count = 5) {
  // TODO: use offset //////////////////////////////////////////////
  const prods = {};
  return client
    .query(`
      SELECT
        products.id, products.name, products.slogan, products.description, products.default_price, categories.category
      FROM products
      LEFT JOIN categories
      ON products.category_id = categories.id
      ORDER BY products.id ASC
      LIMIT ${count} OFFSET ${count * (page - 1)}
    `)
    .then(({ rows }) => rows);
}

async function getRelatedProducts(pid) {
  return client
    .query(`
      SELECT related_product_id
      FROM related
      WHERE current_product_id = ${pid}
    `)
    .then(({ rows }) => rows.map((row) => row.related_product_id));
}

async function getProductStyles(pid) {
  return client
    .query(`
      SELECT s.product_id, ARRAY_AGG(
        json_build_object(
          'style_id', s.style_id,
          'name', s.name,
          'original_price', s.original_price,
          'default', s.default_style,
          'photos', parr,
          'skus', skusobj
        )
      ) results
      FROM styles s
      LEFT JOIN (
        SELECT style_id, ARRAY_AGG(
          json_build_object(
            'url', ph.url,
            'thumbnail_url', ph.thumbnail_url
          )
        ) AS parr
        FROM photos ph
        GROUP BY style_id
      ) flj
      ON flj.style_id = s.style_id
      LEFT JOIN (
        SELECT style_id, json_agg(
          json_build_object(sk.id,
            json_build_object(
              'quantity', sk.quantity,
              'size', sk.size
            )
          )
        ) AS skusobj
        FROM skus sk
        GROUP BY style_id
      ) slj
      ON slj.style_id = s.style_id
      WHERE s.product_id = ${pid}
      GROUP BY s.product_id
    `)
    .then(({ rows }) => rows);
}

// productsETL();
// productsETL2();
// makeIndexes();
module.exports.client = client;
module.exports.getProduct = getProduct;
module.exports.getProducts = getProducts;
module.exports.getRelatedProducts = getRelatedProducts;
module.exports.getProductStyles = getProductStyles;
