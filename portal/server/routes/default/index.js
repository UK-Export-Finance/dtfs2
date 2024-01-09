const express = require('express');
const { ROLES, LANDING_PAGES } = require('../../constants');

const router = express.Router();

router.get('/', (req, res) => {
  const { user } = req.session;
  if (!user) {
    return res.redirect('/login');
  }

  if (user.roles.some((role) => role === ROLES.PAYMENT_REPORT_OFFICER)) {
    return res.redirect(LANDING_PAGES.UTILISATION_REPORT_UPLOAD);
  }
  return res.redirect(LANDING_PAGES.DEFAULT);
});

module.exports = router;
