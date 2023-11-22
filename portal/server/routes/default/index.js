const express = require('express');
const { ROLES } = require('../../constants');

const router = express.Router();

router.get('/', (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.redirect('/login');
  }

  if (user.roles.some((role) => role === ROLES.PAYMENT_REPORT_OFFICER)) {
    return res.redirect('/utilisation-report-upload');
  }
  return res.redirect('/dashboard/deals/0');
});

module.exports = router;
