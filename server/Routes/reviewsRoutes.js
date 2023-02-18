/* eslint-disable camelcase */
const express = require('express');
const db = require('../readDataReviews');

const router = express.Router();

// ----- QUERYING DB ----- //
router.get('/reviews', (req, res) => {
  console.log('getting request for reviews data');

  const sort = {
    newest: 'date',
    helpful: 'helpful',
    relevant: 'relevant',
  };

  db.query(`
    SELECT product_id, r.id, rating, summary, body, date, recommend, reviewer_name, reviewer_email,
      reported, response, helpfulness, array_agg(url) as photos
    FROM reviews r
    LEFT JOIN
    (
      SELECT review_id, url
      FROM photos
    ) p
    ON r.id = p.review_id
    WHERE r.product_id IN (${req.query.product_id}) AND r.reported = 'false'
    GROUP BY  product_id, r.id, rating, summary, body, date, recommend, reviewer_name,
      reviewer_email, reported, response, helpfulness
    ORDER BY ${sort[req.query.sort]} DESC
    LIMIT ${req.query.count};
  `, (err, results) => {
    res.send(results.rows);
  });
});

router.get('/meta', (req, res) => {
  console.log('getting request for reviews meta');
  const id = req.query.product_id;

  db.query(`
  SELECT a.product_id, recommended, characteristics, ratings FROM
    (
      SELECT rec.product_id, recommended, characteristics  FROM
      (
        SELECT product_id, json_agg(json_build_object(recommend, count)) as recommended FROM
        (
          SELECT product_id, recommend, sum(count) as count
          FROM recommended
          WHERE product_id IN (${id})
          GROUP BY product_id, recommend
        ) s
        GROUP BY product_id
      ) rec
      LEFT JOIN
      (
        SELECT s.product_id, json_agg(characteristics) as characteristics
        FROM
        (
          SELECT product_id, json_build_object(name,json_build_object('id', characteristic_id, 'value',AVG(value)))
            as characteristics
          FROM characteristics_count
          WHERE product_id IN (${id})
          GROUP BY product_id, characteristic_id, name) s
          GROUP BY s.product_id) char
          ON rec.product_id = char.product_id
        ) a
      LEFT JOIN
        (
          SELECT product_id, json_agg(rating) as ratings FROM
          (
            SELECT product_id, json_build_object(rating, COUNT(rating)) as rating
            FROM reviews WHERE product_id IN (${id})
            GROUP BY product_id, rating) rat
          GROUP BY product_id
        ) b
  ON a.product_id = b.product_id;
  `, (err, result) => {
    console.log(err, result.rows);
    res.send(result.rows);
  });
});

// ----- ADDING TO DB ----- //
router.put('/reviews/:review_id/helpful', (req, res) => {
  console.log('marking helpful');
  const { review_id } = req.params;

  db.query(`
    UPDATE reviews
    SET helpfulness = helpfulness + 1
    WHERE id = ${review_id};
  `, (err, result) => {
    res.send(result);
  });
});

router.put('/reviews/:review_id/report', (req, res) => {
  console.log('reporting');
  const { review_id } = req.params;

  db.query(`
    UPDATE reviews
    SET reported = true
    WHERE id = ${review_id};
  `, (err, result) => {
    res.send(result);
  });
});

router.post('/reviews', (req, res) => {
  console.log('adding a new review');

  const date = Math.floor(new Date().getTime() / 1000).toString();
  let { photos } = req.query;
  photos = `'{${JSON.stringify(photos).slice(2, -2)}}'`;

  db.query(`
    BEGIN;

    INSERT INTO recommended (product_id, recommend, count)
    VALUES (${req.query.product_id}, ${req.query.recommend}, ${1});

    INSERT INTO reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email, date, helpfulness, reported)
    VALUES (
      ${Number(req.query.product_id)},
      ${Number(req.query.rating)},
      ${String(req.query.summary)},
      ${String(req.query.body)},
      ${String(req.query.recommend)},
      ${req.query.reviewer_name},
      ${req.query.reviewer_email},
      ${date},
      0,
      'false'
      )
    RETURNING id;

    INSERT INTO photos (review_id, url)
    VALUES (
    (SELECT MAX(id) FROM reviews WHERE product_id = ${req.query.product_id}),
    unnest(${photos}::text[]));

    COMMIT;
  `, (err, result) => {
    console.log(err);
    res.send(result);
  });
});

module.exports = router;
