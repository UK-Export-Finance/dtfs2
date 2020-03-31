import express from 'express';
import api from '../../api';
import aboutRoutes from './about';
import bondRoutes from './bond';
import eligibilityRoutes from './eligibility';
import {
  getApiData,
  requestParams,
} from '../../helpers';

const router = express.Router();

router.get('/contract/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-view.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/comments', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-view-comments.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/submission-details', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-submission-details.njk', {
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

router.get('/contract/:_id/delete', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-delete.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/ready-for-review', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-ready-for-review.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/edit-name', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-edit-name.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/return-to-maker', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-return-to-maker.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/confirm-submission', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-confirm-submission.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/clone', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-clone.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});


router.use('/',
  aboutRoutes,
  bondRoutes,
  eligibilityRoutes);

export default router;
