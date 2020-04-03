import express from 'express';
import api from '../../api';
import aboutRoutes from './about';
import bondRoutes from './bond';
import eligibilityRoutes from './eligibility';
import {
  getApiData,
  requestParams,
  generateErrorSummary,
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

router.post('/contract/:_id/edit-name', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { supplyContractName } = req.body;

  const updateToApply = {
    _id,
    details: {
      supplyContractName,
    },
  };

  await api.updateDeal(updateToApply, userToken);

  return res.redirect(`/contract/${_id}`);
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


const errorHref = (id) => `#${id}`;

router.post('/contract/:_id/clone', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const dealResponse = await api.cloneDeal(_id, req.body, userToken);

  const validationErrors = generateErrorSummary(dealResponse.validationErrors, errorHref);

  if (validationErrors) {
    return res.render('contract/contract-clone.njk', {
      dealResponse,
      validationErrors,
    });
  }

  // TODO: display flash message 'cloned successfully'
  return res.redirect('/dashboard');
});


router.get('/contract/:_id/clone/before-you-start', async (req, res) => {
  const { userToken } = requestParams(req);

  return res.render('before-you-start/before-you-start.njk', {
    mandatoryCriteria: await getApiData(
      api.mandatoryCriteria(userToken),
      res,
    ),
  });
});

router.post('/contract/:_id/clone/before-you-start', async (req, res) => {
  const { _id } = requestParams(req);
  const { criteriaMet } = req.body;

  // TODO: check as boolean
  if (criteriaMet === 'true') {
    return res.redirect(`/contract/${_id}/clone`);
  }
  return res.redirect('/unable-to-proceed');
});

router.use('/',
  aboutRoutes,
  bondRoutes,
  eligibilityRoutes);

export default router;
