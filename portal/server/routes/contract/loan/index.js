const express = require('express');
const { isBefore, set, startOfDay } = require('date-fns');
const {
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { provide, LOAN, DEAL, CURRENCIES } = require('../../api-data-provider');
const { requestParams, postToApi, errorHref, mapCurrencies, generateErrorSummary, constructPayload, getNowAsEpoch } = require('../../../helpers');
const {
  loanGuaranteeDetailsValidationErrors,
  loanFinancialDetailsValidationErrors,
  loanDatesRepaymentsValidationErrors,
  loanPreviewValidationErrors,
} = require('./pageSpecificValidationErrors');
const completedLoanForms = require('./completedForms');
const loanTaskList = require('./loanTaskList');
const saveFacilityAndGoBackToDeal = require('../saveFacilityAndGoBack');
const canIssueOrEditIssueFacility = require('../canIssueOrEditIssueFacility');
const isDealEditable = require('../isDealEditable');
const premiumFrequencyField = require('./premiumFrequencyField');
const { FACILITY_STAGE, STATUS } = require('../../../constants');
const { validateRole } = require('../../middleware');

const router = express.Router();

/**
 * Determines whether a loan can be accessed based on the status of the deal.
 *
 * @param {Object} deal - The deal object containing details of the deal.
 * @returns {boolean} - Returns true if the loan can be accessed, false otherwise.
 */
const isLoanAccessable = (deal) => {
  const { status } = deal.details;
  return !(
    status === STATUS.DEAL.READY_FOR_APPROVAL ||
    status === STATUS.DEAL.UKEF_ACKNOWLEDGED ||
    status === STATUS.DEAL.UKEF_APPROVED_WITH_CONDITIONS ||
    status === STATUS.DEAL.UKEF_APPROVED_WITHOUT_CONDITIONS ||
    status === STATUS.DEAL.SUBMITTED_TO_UKEF
  );
};

const handleNameField = (loanBody) => {
  const modifiedLoan = loanBody;
  const { facilityStage, 'facilityStageConditional-name': conditionalName, 'facilityStageUnconditional-name': unconditionalName } = modifiedLoan;

  if (facilityStage === FACILITY_STAGE.CONDITIONAL) {
    modifiedLoan.name = conditionalName;
  } else if (facilityStage === FACILITY_STAGE.UNCONDITIONAL) {
    modifiedLoan.name = unconditionalName;
  }

  delete modifiedLoan['facilityStageConditional-name'];
  delete modifiedLoan['facilityStageUnconditional-name'];

  return modifiedLoan;
};

router.get('/contract/:_id/loan/create', async (req, res) => {
  const { dealId, loanId } = await api.createLoan(req.params._id, req.session.userToken);

  return res.redirect(`/contract/${dealId}/loan/${loanId}/guarantee-details`);
});

router.get('/contract/:_id/loan/:loanId/guarantee-details', [validateRole({ role: [MAKER] }), provide([LOAN, DEAL])], async (req, res) => {
  const { dealId, loan, validationErrors } = req.apiData.loan;

  if (!isLoanAccessable(req.apiData.deal)) {
    return res.redirect('/');
  }

  const completedForms = completedLoanForms(validationErrors);

  return res.render('loan/loan-guarantee-details.njk', {
    dealId,
    loan,
    validationErrors: loanGuaranteeDetailsValidationErrors(validationErrors, loan),
    taskListItems: loanTaskList(completedForms),
    user: req.session.user,
  });
});

const loanGuaranteeDetailsPayloadProperties = [
  'facilityStage',
  'facilityStageConditional-name',
  'facilityStageUnconditional-name',
  'ukefGuaranteeInMonths',
  'requestedCoverStartDate-day',
  'requestedCoverStartDate-month',
  'requestedCoverStartDate-year',
  'coverEndDate-day',
  'coverEndDate-month',
  'coverEndDate-year',
];

const filterLoanGuaranteeDetailsPayload = (body) => {
  const payload = constructPayload(body, loanGuaranteeDetailsPayloadProperties, true);
  if (payload.facilityStage === FACILITY_STAGE.CONDITIONAL) {
    delete payload['requestedCoverStartDate-day'];
    delete payload['requestedCoverStartDate-month'];
    delete payload['requestedCoverStartDate-year'];
    delete payload['coverEndDate-day'];
    delete payload['coverEndDate-month'];
    delete payload['coverEndDate-year'];
  } else if (payload.facilityStage === FACILITY_STAGE.UNCONDITIONAL) {
    delete payload.ukefGuaranteeInMonths;
  }
  return payload;
};

router.post('/contract/:_id/loan/:loanId/guarantee-details', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  const loanBody = filterLoanGuaranteeDetailsPayload(req.body);
  const modifiedBody = handleNameField(loanBody);

  await postToApi(api.updateLoan(dealId, loanId, modifiedBody, userToken), errorHref);

  const redirectUrl = `/contract/${dealId}/loan/${loanId}/financial-details`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/loan/:loanId/guarantee-details/save-go-back', provide([LOAN]), async (req, res) => {
  const loanBody = constructPayload(req.body, loanGuaranteeDetailsPayloadProperties, true);
  const modifiedBody = handleNameField(loanBody);

  return saveFacilityAndGoBackToDeal(req, res, modifiedBody);
});

router.get('/contract/:_id/loan/:loanId/financial-details', [validateRole({ role: [MAKER] }), provide([LOAN, DEAL, CURRENCIES])], async (req, res) => {
  const { dealId, loan, validationErrors } = req.apiData.loan;
  const { currencies } = req.apiData;

  if (!isLoanAccessable(req.apiData.deal)) {
    return res.redirect('/');
  }

  const completedForms = completedLoanForms(validationErrors);

  return res.render('loan/loan-financial-details.njk', {
    dealId,
    loan,
    currencies: mapCurrencies(currencies, loan.currency),
    validationErrors: loanFinancialDetailsValidationErrors(validationErrors, loan),
    taskListItems: loanTaskList(completedForms),
    user: req.session.user,
  });
});

const loanFinancialDetailsPayloadProperties = [
  'value',
  'currencySameAsSupplyContractCurrency',
  'currency',
  'conversionRate',
  'conversionRateDate-day',
  'conversionRateDate-month',
  'conversionRateDate-year',
  'disbursementAmount',
  'interestMarginFee',
  'coveredPercentage',
  'minimumQuarterlyFee',
];

const filterLoanFinancialDetailsPayload = (body) => {
  const sanitizedPayload = constructPayload(body, loanFinancialDetailsPayloadProperties, true);

  if (sanitizedPayload.currencySameAsSupplyContractCurrency === 'true') {
    delete sanitizedPayload.conversionRate;
    delete sanitizedPayload['conversionRateDate-day'];
    delete sanitizedPayload['conversionRateDate-month'];
    delete sanitizedPayload['conversionRateDate-year'];
  }
  return sanitizedPayload;
};

router.post('/contract/:_id/loan/:loanId/financial-details', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  const payload = filterLoanFinancialDetailsPayload(req.body);

  await postToApi(api.updateLoan(dealId, loanId, payload, userToken), errorHref);

  const redirectUrl = `/contract/${dealId}/loan/${loanId}/dates-repayments`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/loan/:loanId/financial-details/save-go-back', provide([LOAN]), async (req, res) => {
  const sanitizedPayload = constructPayload(req.body, loanFinancialDetailsPayloadProperties, true);
  return saveFacilityAndGoBackToDeal(req, res, sanitizedPayload);
});

router.get('/contract/:_id/loan/:loanId/dates-repayments', [validateRole({ role: [MAKER] }), provide([LOAN, DEAL])], async (req, res) => {
  const { dealId, loan, validationErrors } = req.apiData.loan;

  if (!isLoanAccessable(req.apiData.deal)) {
    return res.redirect('/');
  }

  const completedForms = completedLoanForms(validationErrors);

  return res.render('loan/loan-dates-repayments.njk', {
    dealId,
    loan,
    validationErrors: loanDatesRepaymentsValidationErrors(validationErrors, loan),
    taskListItems: loanTaskList(completedForms),
    user: req.session.user,
  });
});

const loanRepaymentDatesPayloadProperties = ['premiumFrequency', 'premiumType', 'inAdvancePremiumFrequency', 'inArrearPremiumFrequency', 'dayCountBasis'];

router.post('/contract/:_id/loan/:loanId/dates-repayments', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  const loanBody = constructPayload(req.body, loanRepaymentDatesPayloadProperties, true);
  const modifiedBody = premiumFrequencyField(loanBody);

  await postToApi(api.updateLoan(dealId, loanId, modifiedBody, userToken), errorHref);

  const redirectUrl = `/contract/${dealId}/loan/${loanId}/check-your-answers`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/loan/:loanId/dates-repayments/save-go-back', provide([LOAN]), async (req, res) => {
  const loanBody = constructPayload(req.body, loanRepaymentDatesPayloadProperties, true);
  const modifiedBody = premiumFrequencyField(loanBody);

  return saveFacilityAndGoBackToDeal(req, res, modifiedBody);
});

router.get('/contract/:_id/loan/:loanId/check-your-answers', [validateRole({ role: [MAKER] }), provide([LOAN])], async (req, res) => {
  const { loanId, userToken } = requestParams(req);
  const { dealId, loan, validationErrors } = req.apiData.loan;

  // POST to api to flag that we have viewed preview page.
  // this is required specifically for other Loan forms/pages, to match the existing UX/UI.

  // The status is extracted, otherwise bad things happen.
  // When we GET a facility/loan, the status is dynamically added (it's not in the DB)
  // here, in the preview screen, we need to extract the status from the POST
  // otherwise the status will be added to the DB and not dynamically added.
  const { status: _status, ...loanWithoutStatus } = loan;

  const updatedLoan = {
    ...loanWithoutStatus,
    viewedPreviewPage: true,
  };

  await postToApi(api.updateLoan(dealId, loanId, updatedLoan, userToken));

  let formattedValidationErrors;
  if (validationErrors.count !== 0) {
    formattedValidationErrors = generateErrorSummary(loanPreviewValidationErrors(validationErrors, dealId, loanId), errorHref);
  }

  const completedForms = completedLoanForms(validationErrors);

  return res.render('loan/loan-check-your-answers.njk', {
    dealId,
    loan,
    validationErrors: formattedValidationErrors,
    taskListItems: loanTaskList(completedForms),
    user: req.session.user,
  });
});

router.get('/contract/:_id/loan/:loanId/issue-facility', [validateRole({ role: [MAKER] }), provide([LOAN, DEAL])], async (req, res) => {
  const { _id: dealId } = requestParams(req);
  const { loan } = req.apiData.loan;
  const { user } = req.session;

  if (!canIssueOrEditIssueFacility(user.roles, req.apiData.deal, loan)) {
    return res.redirect('/');
  }

  return res.render('loan/loan-issue-facility.njk', {
    dealId,
    user,
    loan,
  });
});

router.post('/contract/:_id/loan/:loanId/issue-facility', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);
  const { user } = req.session;

  const payloadProperties = [
    'issuedDate-day',
    'issuedDate-month',
    'issuedDate-year',
    'coverDateConfirmed',
    'requestedCoverStartDate-day',
    'requestedCoverStartDate-month',
    'requestedCoverStartDate-year',
    'coverEndDate-day',
    'coverEndDate-month',
    'coverEndDate-year',
    'disbursementAmount',
    'name',
  ];

  /**
   * Add coverDateConfirmed: true property to the bond.
   * This flag will allow Maker to further the application.
   */
  const payloadValues = {
    ...req.body,
    coverDateConfirmed: true,
  };

  const payload = constructPayload(payloadValues, payloadProperties, true);

  const { validationErrors, loan } = await postToApi(api.updateLoanIssueFacility(dealId, loanId, payload, userToken), errorHref);

  if (validationErrors) {
    return res.render('loan/loan-issue-facility.njk', {
      user,
      validationErrors,
      loan,
      dealId,
    });
  }

  return res.redirect(`/contract/${dealId}`);
});

router.get('/contract/:_id/loan/:loanId/confirm-requested-cover-start-date', provide([LOAN]), async (req, res) => {
  const { _id: dealId } = requestParams(req);
  const { loan } = req.apiData.loan;

  const startOfToday = startOfDay(new Date());
  const requestedCoverStartDate = new Date(loan.requestedCoverStartDate);

  const needToChangeRequestedCoverStartDate = isBefore(requestedCoverStartDate, startOfToday);

  return res.render('_shared-pages/confirm-requested-cover-start-date.njk', {
    dealId,
    user: req.session.user,
    facility: loan,
    needToChangeRequestedCoverStartDate,
  });
});

router.post('/contract/:_id/loan/:loanId/confirm-requested-cover-start-date', provide([LOAN]), async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  const { loan } = req.apiData.loan;

  let requestedCoverValidationErrors;

  if (req.body.needToChangeRequestedCoverStartDate) {
    if (!req.session.confirmedRequestedCoverStartDates) {
      req.session.confirmedRequestedCoverStartDates = {};
    }
  }

  const addFacilityToSessionConfirmedStartDates = () => {
    if (!req.session.confirmedRequestedCoverStartDates[dealId]) {
      req.session.confirmedRequestedCoverStartDates[dealId] = [loanId];
    } else if (!req.session.confirmedRequestedCoverStartDates[dealId].includes(loanId)) {
      req.session.confirmedRequestedCoverStartDates[dealId].push(loanId);
    }
  };

  if (req.body.needToChangeRequestedCoverStartDate === 'true') {
    if (!req.body['requestedCoverStartDate-day'] || !req.body['requestedCoverStartDate-month'] || !req.body['requestedCoverStartDate-year']) {
      requestedCoverValidationErrors = {
        count: 1,
        errorList: {
          requestedCoverStartDate: {
            text: 'Enter the Requested Cover Start Date',
            order: '1',
          },
        },
        summary: [
          {
            text: 'Enter the Requested Cover Start Date',
            href: '#requestedCoverStartDate',
          },
        ],
      };
    } else {
      const previousCoverStartDate = set(new Date(), {
        date: Number(loan['requestedCoverStartDate-day']),
        month: Number(loan['requestedCoverStartDate-month']) - 1, // months are zero indexed
        year: Number(loan['requestedCoverStartDate-year']),
      });

      const previousCoverStartDateTimestamp = previousCoverStartDate.valueOf().toString();

      const payloadProperties = [
        'requestedCoverStartDate-day',
        'requestedCoverStartDate-month',
        'requestedCoverStartDate-year',
        'needToChangeRequestedCoverStartDate',
      ];
      const newRequestedCoverStartDate = constructPayload(req.body, payloadProperties, true);

      const newLoanDetails = {
        ...newRequestedCoverStartDate,
        previousCoverStartDate: previousCoverStartDateTimestamp,
        dateOfCoverChange: getNowAsEpoch().toString(),
      };

      const { validationErrors } = await postToApi(api.updateLoanCoverStartDate(dealId, loanId, newLoanDetails, userToken), errorHref);

      requestedCoverValidationErrors = {
        ...validationErrors,
      };
    }

    if (
      !requestedCoverValidationErrors.errorList ||
      (requestedCoverValidationErrors.errorList && !requestedCoverValidationErrors.errorList.requestedCoverStartDate)
    ) {
      addFacilityToSessionConfirmedStartDates();
    }

    if (requestedCoverValidationErrors && requestedCoverValidationErrors.errorList && requestedCoverValidationErrors.errorList.requestedCoverStartDate) {
      return res.render('_shared-pages/confirm-requested-cover-start-date.njk', {
        dealId,
        user: req.session.user,
        facility: loan,
        validationErrors: requestedCoverValidationErrors,
        enteredValues: req.body,
        needToChangeRequestedCoverStartDate: req.body.needToChangeRequestedCoverStartDate,
      });
    }
  } else if (req.body.needToChangeRequestedCoverStartDate === 'false') {
    addFacilityToSessionConfirmedStartDates();
  }

  /**
   * Add coverDateConfirmed: true property to the bond.
   * This flag will allow Maker to further the application.
   */
  const updatedLoan = {
    coverDateConfirmed: true,
  };

  await postToApi(api.updateLoan(dealId, loanId, updatedLoan, userToken));

  const redirectUrl = `/contract/${dealId}`;
  return res.redirect(redirectUrl);
});

router.get(
  '/contract/:_id/loan/:loanId/delete',
  [validateRole({ role: [MAKER] }, (req) => `/contract/${req.params._id}`), provide([DEAL, LOAN])],
  async (req, res) => {
    const { loan } = req.apiData.loan;
    const { user } = req.session;

    if (isDealEditable(req.apiData.deal, user)) {
      return res.render('loan/loan-delete.njk', {
        deal: req.apiData.deal,
        loan,
        user: req.session.user,
      });
    }

    const redirectUrl = `/contract/${req.params._id}`;
    return res.redirect(redirectUrl);
  },
);

router.post('/contract/:_id/loan/:loanId/delete', async (req, res) => {
  const { _id: dealId, loanId, userToken } = requestParams(req);

  await postToApi(api.deleteLoan(dealId, loanId, userToken), errorHref);

  req.flash('successMessage', {
    text: `Loan #${loanId} has been deleted`,
  });

  return res.redirect(`/contract/${dealId}`);
});

module.exports = router;
