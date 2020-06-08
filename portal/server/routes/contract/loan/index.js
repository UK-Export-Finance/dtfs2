import express from 'express';
import api from '../../../api';
import {
  requestParams,
  postToApi,
  errorHref,
} from '../../../helpers';

import { provide, LOAN } from '../../api-data-provider';

const router = express.Router();

const MOCK_LOAN = {
  _id: '1',
  bankReferenceNumber: 'Not entered',
  facilityStage: 'Conditional',
  ukefGuaranteeLengthInMonths: '12',
  'requestedCoverStartDate-day': '01',
  'requestedCoverStartDate-month': '02',
  'requestedCoverStartDate-year': '2020',
  'coverEndDate-day': '02',
  'coverEndDate-month': '03',
  'coverEndDate-year': '2020',
  loanFacilityValue: '3,000,000.00',
  currencySameAsSupplyContractCurrency: 'false',
  currency: 'EGP - Egyptian Pounds',
  conversionRate: '1.75',
  'conversionRateDate-day': '01',
  'conversionRateDate-month': '02',
  'conversionRateDate-year': '2020',
  interestMargin: '3',
  coveredPercentage: '70',
  minimumQuarterlyFee: '3.00',
  guaranteeFeePayableByBank: '2.7000',
  ukefExposure: '2,100,000.00',
  premiumType: 'At maturity',
  premiumFrequency: 'Monthly',
  dayCountBasis: '365',
};

router.get('/contract/:_id/loan/create', async (req, res) => {
  const { _id: dealId, userToken } = requestParams(req);
  const { _id, loanId } = await api.createDealLoan(dealId, userToken); // eslint-disable-line no-underscore-dangle

  return res.redirect(`/contract/${_id}/loan/${loanId}/guarantee-details`); // eslint-disable-line no-underscore-dangle
});

router.get('/contract/:_id/loan/:loanId/guarantee-details', provide([LOAN]), async (req, res) => {
  const {
    dealId,
    loan,
    validationErrors,
  } = req.apiData.loan;

  return res.render('loan/loan-guarantee-details.njk', {
    dealId,
    loan,
    // validationErrors: loanGuaranteeDetailsValidationErrors(validationErrors, loan),
    validationErrors,
  });
});

router.post('/contract/:_id/loan/:loanId/guarantee-details', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  await postToApi(
    api.updateDealLoan(
      dealId,
      loanId,
      req.body,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/loan/${loanId}/financial-details`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/loan/:loanId/financial-details', provide([LOAN]), async (req, res) => {
  const {
    dealId,
    loan,
    validationErrors,
  } = req.apiData.loan;

  return res.render('loan/loan-guarantee-details.njk', {
    dealId,
    loan,
    // validationErrors: loanGuaranteeDetailsValidationErrors(validationErrors, loan),
    validationErrors,
  });
});


router.post('/contract/:_id/loan/:loanId/financial-details', async (req, res) => {
  const { _id: dealId, loanId } = requestParams(req);

  // await postToApi(
  //   api.updateLoan(dealId, loanId, req.body, userToken),
  //   errorHref,
  // );

  const redirectUrl = `/contract/${dealId}/loan/${loanId}/dates-repayments`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/loan/:loanId/dates-repayments', async (req, res) => {
  const { _id: dealId } = requestParams(req);

  return res.render('loan/loan-dates-repayments.njk', {
    dealId,
    loan: { _id: MOCK_LOAN._id }, // eslint-disable-line no-underscore-dangle
    // ...await getApiData(
    //   api.contractLoan(_id, loanId, userToken),
    //   res,
    // ),
  });
});

router.post('/contract/:_id/loan/:loanId/dates-repayments', async (req, res) => {
  const { _id: dealId, loanId } = requestParams(req);

  // await postToApi(
  //   api.updateLoan(dealId, loanId, req.body, userToken),
  //   errorHref,
  // );

  const redirectUrl = `/contract/${dealId}/loan/${loanId}/preview`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/loan/:loanId/preview', async (req, res) => {
  const { _id: dealId } = requestParams(req);

  return res.render('loan/loan-preview.njk', {
    dealId,
    loan: MOCK_LOAN,
    // ...await getApiData(
    //   api.contractLoan(_id, loanId, userToken),
    //   res,
    // ),
  });
});

router.post('/contract/:_id/loan/:loanId/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params._id}`; // eslint-disable-line no-underscore-dangle
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/loan/:_loanId/issue-facility', async (req, res) => {
  const { _id: dealId } = requestParams(req);

  return res.render('loan/loan-issue-facility.njk', {
    dealId,
  });
});

router.get('/contract/:_id/loan/:_loanId/confirm-requested-cover-start-date', async (req, res) => {
  const { _id: dealId } = requestParams(req);

  return res.render('_shared-pages/confirm-requested-cover-start-date.njk', {
    dealId,
  });
});

router.get('/contract/:_id/loan/:loanId/delete', async (req, res) => {
  const { dealId } = requestParams(req);

  return res.render('loan/loan-delete.njk', {
    dealId,
    loan: MOCK_LOAN,
  });
});

export default router;
