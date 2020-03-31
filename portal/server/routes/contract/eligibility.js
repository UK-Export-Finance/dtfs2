import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
} from '../../helpers';

const router = express.Router();

router.get('/contract/:_id/eligibility/criteria', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('eligibility/eligibility-criteria.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
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

  const eligibilityErrors = updatedDeal.eligibility.criteria.filter((c) => typeof c.answer === 'undefined')
    .map((c) => ({
      text: `Eligibility criterion ${c.id} is required`,
      href: `#criterion-${c.id}`,
    }));

  res.render('eligibility/eligibility-criteria.njk', {
    criteriaStatus: updatedDeal.eligibility.status,
    eligibility: updatedDeal.eligibility,
    eligibilityErrors,
  });
});

router.post('/contract/:id/eligibility/criteria/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
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
