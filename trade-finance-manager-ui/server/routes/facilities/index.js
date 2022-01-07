const express = require('express');
const { getFacilities, queryFacilities } = require('../../controllers/facilities');

const router = express.Router();

router.get('/', getFacilities);
router.post('/', queryFacilities);

module.exports = router;
