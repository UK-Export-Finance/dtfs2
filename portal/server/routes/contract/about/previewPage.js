import express from 'express';
import api from '../../../api';
import {
  requestParams,
  errorHref,
  generateErrorSummary,
} from '../../../helpers';

import { DEAL } from '../../api-data-provider';

import { aboutSupplyContractPreviewValidationErrors } from './pageSpecificValidationErrors';

import calculateStatusOfEachPage from './navStatusCalculations';

const router = express.Router();

const userCanAccessAbout = (user) => {
  if (!user.roles.includes('maker')) {
    return false;
  }

  return true;
};

router.get('/contract/:_id/about/check-your-answers', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const { user } = req.session;
  if (!userCanAccessAbout(user)) {
    return res.redirect('/');
  }

  const deal = req.apiData[DEAL];

  // TODO dirty hack; this is how we apply the business rule
  //  "don't display error messages unless the user has viewed the preview page"
  await api.updateSubmissionDetails(deal, { viewedPreviewPage: true }, userToken);

  const { validationErrors } = await api.getSubmissionDetails(_id, userToken);

  const errorSummary = generateErrorSummary(
    validationErrors,
    errorHref,
  );

  deal.supplyContract = {
    completedStatus: calculateStatusOfEachPage(Object.keys(errorSummary.errorList)),
  };

  let formattedValidationErrors;
  if (validationErrors.count !== 0) {
    formattedValidationErrors = generateErrorSummary(
      aboutSupplyContractPreviewValidationErrors(validationErrors, _id),
      errorHref,
    );
  }

  return res.render('contract/about/about-supply-preview.njk', {
    deal,
    validationErrors: formattedValidationErrors,
    user: req.session.user,
  });
});


export default router;
