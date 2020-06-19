import express from 'express';
import api from '../../../api';
import { provide, LOAN, CURRENCIES } from '../../api-data-provider';
import {
  requestParams,
  postToApi,
  errorHref,
  mapCurrencies,
} from '../../../helpers';
import {
  loanGuaranteeDetailsValidationErrors,
  loanFinancialDetailsValidationErrors,
} from './pageSpecificValidationErrors';
import completedLoanForms from './completedForms';

const router = express.Router();

const handleBankReferenceNumberField = (loanBody) => {
  const modifiedLoan = loanBody;
  const {
    facilityStage,
    'facilityStageConditional-bankReferenceNumber': conditionalBankReferenceNumber,
    'facilityStageUnconditional-bankReferenceNumber': unconditionalBankReferenceNumber,
  } = modifiedLoan;

  if (facilityStage === 'Conditional') {
    modifiedLoan.bankReferenceNumber = conditionalBankReferenceNumber;
  } else if (facilityStage === 'Unconditional') {
    modifiedLoan.bankReferenceNumber = unconditionalBankReferenceNumber;
  }

  delete modifiedLoan['facilityStageConditional-bankReferenceNumber'];
  delete modifiedLoan['facilityStageUnconditional-bankReferenceNumber'];

  return modifiedLoan;
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

  const completedForms = completedLoanForms(validationErrors);

  return res.render('loan/loan-guarantee-details.njk', {
    dealId,
    loan,
    validationErrors: loanGuaranteeDetailsValidationErrors(validationErrors, loan),
    completedForms,
  });
});

router.post('/contract/:_id/loan/:loanId/guarantee-details', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  const modifiedBody = handleBankReferenceNumberField(req.body);

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

router.get('/contract/:_id/loan/:loanId/financial-details', provide([LOAN, CURRENCIES]), async (req, res) => {
  const {
    dealId,
    loan,
    validationErrors,
  } = req.apiData.loan;
  const { currencies } = req.apiData;

  const completedForms = completedLoanForms(validationErrors);

  return res.render('loan/loan-financial-details.njk', {
    dealId,
    loan,
    currencies: mapCurrencies(currencies, loan.currency),
    validationErrors: loanFinancialDetailsValidationErrors(validationErrors, loan),
    completedForms,
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

router.get('/contract/:_id/loan/:loanId/dates-repayments', provide([LOAN]), async (req, res) => {
  const {
    dealId,
    loan,
    validationErrors,
  } = req.apiData.loan;

  const completedForms = completedLoanForms(validationErrors);

  return res.render('loan/loan-dates-repayments.njk', {
    dealId,
    loan,
    completedForms,
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
    validationErrors,
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

  const completedForms = completedLoanForms(validationErrors);

  return res.render('loan/loan-preview.njk', {
    dealId,
    loan,
    completedForms,
  });
});

router.post('/contract/:_id/loan/:loanId/save-go-back', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  const modifiedBody = handleBankReferenceNumberField(req.body);

  await postToApi(
    api.updateDealLoan(
      dealId,
      loanId,
      modifiedBody,
      userToken,
    ),
  );

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

router.get('/contract/:_id/loan/:loanId/delete', provide([LOAN]), async (req, res) => {
  const { dealId } = requestParams(req);
  const {
    loan,
  } = req.apiData.loan;

  return res.render('loan/loan-delete.njk', {
    dealId,
    loan,
  });
});

export default router;
