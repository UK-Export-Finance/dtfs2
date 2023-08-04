const express = require('express');
const { getDeals, queryDeals } = require('#controllers/deals/index.js');

const router = express.Router();

router.get('/', getDeals);
router.post('/', queryDeals);

module.exports = router;
