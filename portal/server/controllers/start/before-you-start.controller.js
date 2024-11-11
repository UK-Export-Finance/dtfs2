import { errorHref, generateErrorSummary } from '../../helpers';
import beforeYouStartValidation from '../../validation/before-you-start';

export const getBeforeYouStartPage = async (req, res) => {
  const { mandatoryCriteria } = req.apiData;
  res.render('before-you-start/before-you-start.njk', {
    mandatoryCriteria,
    user: req.session.user,
  });
};

export const postBeforeYouStartPage = async (req, res) => {
  const { mandatoryCriteria } = req.apiData;

  const validationErrors = generateErrorSummary(beforeYouStartValidation(req.body), errorHref);

  if (validationErrors) {
    return res.render('before-you-start/before-you-start.njk', {
      mandatoryCriteria,
      validationErrors,
    });
  }

  if (req.body.criteriaMet === 'false') {
    return res.redirect('/unable-to-proceed');
  }

  return res.redirect('/before-you-start/bank-deal');
};
