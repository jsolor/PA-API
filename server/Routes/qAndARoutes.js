const express = require('express');

const router = express.Router();

// example routes that will be prefixed
router.get('/', (req, res) => {
  res.send('Get all users QA');
});

router.get('/:id', (req, res) => {
  res.send(`Get user with id: ${req.params.id}`);
});

module.exports = router;
