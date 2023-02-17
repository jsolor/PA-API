const express = require('express');
const { getProduct, getProducts, getRelatedProducts } = require('../database');

const router = express.Router();

// ----- Products - Routes ----- //

router.get('/', (req, res) => {
  getProducts(req.params.page, req.params.count)
    .then((info) => {
      res.status(200);
      res.send(info);
      res.end();
    })
    .catch(() => res.send('Failed to get products'));
});

router.get('/:id/related', (req, res) => {
  getRelatedProducts(req.params.id)
    .then((info) => {
      console.log(info);
      res.status(200);
      res.send(info);
      res.end();
    })
    .catch(() => res.send('Failed to get related products'));
});

router.get('/:id/?*', (req, res) => {
  getProduct(req.params.id)
    .then(({ info }) => {
      res.status(200);
      res.send(info);
      res.end();
    })
    .catch(() => res.send('Failed to get product'));
});

// app.get('/:product_id/styles', (req, res) => {
//   const { product_id } = req.params;
//   console.log('Request received for styles at product', product_id);

//   axios.get(`https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfe/products/${product_id}/styles`, {
//     headers: {
//       Authorization: process.env.AUTH_SECRET,
//     },
//     params: {
//       product_id,
//       page: 1,
//       count: 100,
//     },
//   })
//     .then(({ data }) => {
//       res.status(200);
//       res.send(data);
//       res.end();
//     })
//     .catch(() => res.send('Failed to get styles'));
// });

module.exports = router;
