const express = require('express');
const {
  ROLES: { MAKER },
  errorHandlingAdaptor,
} = require('@ukef/dtfs2-common');
const { validateToken, validateRole } = require('./middleware');
const { provide, MANDATORY_CRITERIA } = require('./api-data-provider');
const { beforeYouStartController, beforeYouStartBankDealController, unableToProceedController } = require('../controllers/start');

const router = express.Router();

router.use('/before-you-start/*', validateToken);

router.get(
  '/before-you-start',
  [validateRole({ role: [MAKER] }), provide([MANDATORY_CRITERIA])],
  errorHandlingAdaptor(beforeYouStartController.getBeforeYouStartPage),
);

router.post(
  '/before-you-start',
  [validateRole({ role: [MAKER] }), provide([MANDATORY_CRITERIA])],
  errorHandlingAdaptor(beforeYouStartController.postBeforeYouStartPage),
);

router.get(
  '/before-you-start/bank-deal',
  validateRole({ role: [MAKER] }),
  errorHandlingAdaptor(beforeYouStartBankDealController.getBeforeYouStartBankDealPage),
);

router.post(
  '/before-you-start/bank-deal',
  [validateRole({ role: [MAKER] }), provide([MANDATORY_CRITERIA])],
  errorHandlingAdaptor(beforeYouStartBankDealController.postBeforeYouStartBankDealPage),
);

router.get('/unable-to-proceed', errorHandlingAdaptor(unableToProceedController.getUnableToProceedPage));

module.exports = router;
