import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
  errorHref,
  postToApi,
  mapCurrencies,
  generateErrorSummary,
} from '../../helpers';
import {
  bondDetailsValidationErrors,
  bondFinancialDetailsValidationErrors,
  bondFeeDetailsValidationErrors,
  bondPreviewValidationErrors,
} from './pageSpecificValidationErrors/bond';
import bondCompletedStatus from './completedStatus/bond';

const router = express.Router();

router.get('/contract/:_id/bond/create', async (req, res) => {
  const { _id: dealId, userToken } = requestParams(req);

  const { _id, bondId } = await api.createBond(dealId, userToken); // eslint-disable-line no-underscore-dangle

  return res.redirect(`/contract/${_id}/bond/${bondId}/details`); // eslint-disable-line no-underscore-dangle
});

router.get('/contract/:_id/bond/:bondId/details', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  const apiResponse = await getApiData(
    api.contractBond(_id, bondId, userToken),
    res,
  );

  const {
    dealId,
    bond,
    validationErrors,
  } = apiResponse;

  const completedStatus = bondCompletedStatus(validationErrors);

  return res.render('bond/bond-details.njk', {
    dealId,
    bond,
    validationErrors: bondDetailsValidationErrors(validationErrors, bond),
    completedStatus,
  });
});

router.post('/contract/:_id/bond/:bondId/details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      req.body,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/financial-details`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/financial-details', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  const currencies = await getApiData(
    api.bondCurrencies(userToken),
    res,
  );

  const bondResponse = await getApiData(
    api.contractBond(_id, bondId, userToken),
    res,
  );

  const {
    dealId,
    bond,
    validationErrors,
  } = bondResponse;

  const completedStatus = bondCompletedStatus(validationErrors);

  return res.render('bond/bond-financial-details.njk', {
    dealId,
    bond,
    validationErrors: bondFinancialDetailsValidationErrors(validationErrors, bond),
    currencies: mapCurrencies(currencies, bondResponse.bond.currency),
    completedStatus,
  });
});

router.post('/contract/:_id/bond/:bondId/financial-details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      req.body,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/fee-details`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/fee-details', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  const apiResponse = await getApiData(
    api.contractBond(_id, bondId, userToken),
    res,
  );

  const {
    dealId,
    bond,
    validationErrors,
  } = apiResponse;

  const completedStatus = bondCompletedStatus(validationErrors);

  return res.render('bond/bond-fee-details.njk', {
    dealId,
    bond,
    validationErrors: bondFeeDetailsValidationErrors(validationErrors, bond),
    completedStatus,
  });
});

router.post('/contract/:_id/bond/:bondId/fee-details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  const {
    inAdvanceFeeFrequency,
    inArrearFeeFrequency,
  } = req.body;

  const postBody = {
    ...req.body,
    feeFrequency: inAdvanceFeeFrequency || inArrearFeeFrequency,
  };

  delete postBody.inAdvanceFeeFrequency;
  delete postBody.inArrearFeeFrequency;

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      postBody,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/preview`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/preview', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  const apiResponse = await getApiData(
    api.contractBond(_id, bondId, userToken),
    res,
  );

  const {
    dealId,
    bond,
    validationErrors,
  } = apiResponse;

  // POST to api to flag that we have viewed preview page.
  // this is required specifically for other Bond forms/pages, to match the existing UX/UI.
  // viewedPreviewPage
  const updatedBond = {
    ...bond,
    viewedPreviewPage: true,
  };

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      updatedBond,
      userToken,
    ),
  );

  const formattedValidationErrors = generateErrorSummary(
    bondPreviewValidationErrors(validationErrors, dealId, bondId),
    errorHref,
  );

  const completedStatus = bondCompletedStatus(validationErrors);

  return res.render('bond/bond-preview.njk', {
    dealId,
    bond,
    validationErrors: formattedValidationErrors,
    completedStatus,
  });
});

router.post('/contract/:_id/bond/:bondId/save-go-back', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  const {
    inAdvanceFeeFrequency,
    inArrearFeeFrequency,
  } = req.body;

  const postBody = req.body;

  if (inAdvanceFeeFrequency || inArrearFeeFrequency) {
    postBody.feeFrequency = inAdvanceFeeFrequency || inArrearFeeFrequency;

    delete postBody.inAdvanceFeeFrequency;
    delete postBody.inArrearFeeFrequency;
  }

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      postBody,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${req.params._id}`; // eslint-disable-line no-underscore-dangle
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:_bondId/issue-facility', async (req, res) => {
  const { _id: dealId } = requestParams(req);

  return res.render('bond/bond-issue-facility.njk', {
    dealId,
  });
});

router.get('/contract/:_id/bond/:_bondId/confirm-requested-cover-start-date', async (req, res) => {
  const { _id: dealId } = requestParams(req);

  return res.render('_shared-pages/confirm-requested-cover-start-date.njk', {
    dealId,
  });
});

router.get('/contract/:_id/bond/:bondId/delete', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  return res.render('bond/bond-delete.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    ...await getApiData(
      api.contractBond(_id, bondId, userToken),
      res,
    ),
  });
});


export default router;
