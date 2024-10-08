const express = require('express');
const { getDeals, queryDeals } = require('../../controllers/deals');

const router = express.Router();

router.get('/', (req, res) => res.redirect('/deals/0'));
router.get('/:pageNumber', getDeals);
router.post('/', queryDeals);
router.post('/:pageNumber', queryDeals);

module.exports = router;
