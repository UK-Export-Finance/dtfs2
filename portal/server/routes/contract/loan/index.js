import express from 'express';
import api from '../../../api';
import { provide, LOAN } from '../../api-data-provider';
import {
  requestParams,
  postToApi,
  errorHref,
} from '../../../helpers';
import {
  loanGuaranteeDetailsValidationErrors,
} from './pageSpecificValidationErrors';

const router = express.Router();

const MOCK_LOAN = {
  _id: '1',
  bankReferenceNumber: 'Not entered',
  facilityStage: 'Conditional',
  ukefGuaranteeInMonths: '12',
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
    validationErrors: loanGuaranteeDetailsValidationErrors(validationErrors, loan),
  });
});

router.post('/contract/:_id/loan/:loanId/guarantee-details', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  const modifiedBody = req.body;

  const {
    facilityStage,
    'facilityStageConditional-bankReferenceNumber': conditionalBankReferenceNumber,
    'facilityStageUnconditional-bankReferenceNumber': unconditionalBankReferenceNumber,
  } = req.body;

  if (facilityStage === 'Conditional') {
    modifiedBody.bankReferenceNumber = conditionalBankReferenceNumber;
  } else if (facilityStage === 'Unconditional') {
    modifiedBody.bankReferenceNumber = unconditionalBankReferenceNumber;
  }

  delete modifiedBody['facilityStageConditional-bankReferenceNumber'];
  delete modifiedBody['facilityStageUnconditional-bankReferenceNumber'];

  await postToApi(
    api.updateDealLoan(
      dealId,
      loanId,
      modifiedBody,
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

  return res.render('loan/loan-financial-details.njk', {
    dealId,
    loan,
    validationErrors,
  });
});


router.post('/contract/:_id/loan/:loanId/financial-details', async (req, res) => {
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

router.get('/contract/:_id/loan/:loanId/preview', provide([LOAN]), async (req, res) => {
  const { loanId, userToken } = requestParams(req);
  const {
    dealId,
    loan,
    // validationErrors,
  } = req.apiData.loan;


  // POST to api to flag that we have viewed preview page.
  // this is required specifically for other Loan forms/pages, to match the existing UX/UI.
  const updatedLoan = {
    ...loan,
    viewedPreviewPage: true,
  };

  await postToApi(
    api.updateDealLoan(
      dealId,
      loanId,
      updatedLoan,
      userToken,
    ),
  );

  return res.render('loan/loan-preview.njk', {
    dealId,
    loan,
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
