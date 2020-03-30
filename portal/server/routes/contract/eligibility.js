import express from 'express';
import api from '../../api';
import {
  getApiData,
  getDealIdAndToken,
} from '../../helpers';

const router = express.Router();

router.get('/contract/:_id/eligibility/criteria', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

  return res.render('eligibility/eligibility-criteria.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.post('/contract/:id/eligibility/criteria', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/eligibility/supporting-documentation`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/eligibility/criteria/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/eligibility/supporting-documentation', async (req, res) => {
  const { _id, userToken } = getDealIdAndToken(req);

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
  const { _id, userToken } = getDealIdAndToken(req);

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
