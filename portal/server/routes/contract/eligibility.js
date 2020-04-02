import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
  generateErrorSummary,
} from '../../helpers';

const router = express.Router();

const eligibilityErrorHref = (id) => `#criterion-group-${id}`;

router.get('/contract/:_id/eligibility/criteria', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  const validationErrors = generateErrorSummary(deal.eligibility.validationErrors, eligibilityErrorHref);

  return res.render('eligibility/eligibility-criteria.njk',
    {
      _id,
      eligibility: deal.eligibility,
      validationErrors,
    });
});

router.post('/contract/:_id/eligibility/criteria', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { body } = req;

  const updatedDeal = await getApiData(
    api.updateEligibilityCriteria(_id, body, userToken),
    res,
  );

  if (updatedDeal.eligibility.status === 'Complete') {
    return res.redirect(`/contract/${_id}/eligibility/supporting-documentation`);
  }

  const validationErrors = generateErrorSummary(updatedDeal.eligibility.validationErrors, eligibilityErrorHref);

  return res.render('eligibility/eligibility-criteria.njk', {
    _id,
    criteriaStatus: updatedDeal.eligibility.status,
    eligibility: updatedDeal.eligibility,
    validationErrors,
  });
});

router.post('/contract/:_id/eligibility/criteria/save-go-back', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { body } = req;

  await getApiData(
    api.updateEligibilityCriteria(_id, body, userToken),
    res,
  );

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/eligibility/supporting-documentation', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('eligibility/eligibility-supporting-documentation.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.post('/contract/:id/eligibility/supporting-documentation', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/eligibility/preview`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/eligibility/supporting-documentation/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/eligibility/preview', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('eligibility/eligibility-preview.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    mandatoryCriteria: await getApiData(
      api.mandatoryCriteria(userToken),
      res,
    ),
  });
});

export default router;
