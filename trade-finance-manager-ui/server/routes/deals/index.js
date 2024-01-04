const express = require('express');
const { getDeals, queryDeals } = require('../../controllers/deals');

const router = express.Router();

router.get('/', getDeals);
router.post('/', queryDeals);

module.exports = router;
