const express = require('express');
const { ROLES } = require('@ukef/dtfs2-common');
const { LANDING_PAGES } = require('../../constants');

const router = express.Router();

router.get('/', (req, res) => {
  const { user } = req.session;

  /**
   * Need to ensure `roles` object exist.
   * When a user is first logged-in as a TFM user,
   * roles object will not exist and will throw 500.
   */
  if (!user?.roles) {
    return res.redirect(LANDING_PAGES.LOGIN);
  }

  if (user.roles.some((role) => role === ROLES.PAYMENT_REPORT_OFFICER)) {
    return res.redirect(LANDING_PAGES.UTILISATION_REPORT_UPLOAD);
  }

  return res.redirect(LANDING_PAGES.DEFAULT);
});

module.exports = router;
