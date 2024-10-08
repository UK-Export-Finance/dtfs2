const express = require('express');
const { getFacilities, queryFacilities } = require('../../controllers/facilities');

const router = express.Router();

router.get('/', (req, res) => res.redirect('/facilities/0'));
router.get('/:pageNumber', getFacilities);
router.post('/', queryFacilities);
router.post('/:pageNumber', queryFacilities);

module.exports = router;
