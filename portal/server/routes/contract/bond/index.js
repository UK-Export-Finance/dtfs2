const express = require('express');
const moment = require('moment');
const CONSTANTS = require('../../../constants');
const api = require('../../../api');
const {
  provide,
  BOND,
  DEAL,
  CURRENCIES,
} = require('../../api-data-provider');
const {
  getApiData,
  requestParams,
  errorHref,
  postToApi,
  mapCurrencies,
  generateErrorSummary,
  formattedTimestamp,
  constructPayload,
} = require('../../../helpers');
const {
  bondDetailsValidationErrors,
  bondFinancialDetailsValidationErrors,
  bondFeeDetailsValidationErrors,
  bondPreviewValidationErrors,
} = require('./pageSpecificValidationErrors');
const completedBondForms = require('./completedForms');
const bondTaskList = require('./bondTaskList');
const canIssueOrEditIssueFacility = require('../canIssueOrEditIssueFacility');
const isDealEditable = require('../isDealEditable');
const feeFrequencyField = require('./feeFrequencyField');
const saveFacilityAndGoBackToDeal = require('../saveFacilityAndGoBack');
const { validateRole } = require('../../middleware');
const { MAKER } = require('../../../constants/roles');

const router = express.Router();

const bondCanBeAccessed = (deal) => {
  if (!deal?.details) {
    return false;
  }

  const { status } = deal.details;
  const validStatus = [
    CONSTANTS.STATUS.READY_FOR_APPROVAL,
    CONSTANTS.STATUS.UKEF_ACKNOWLEDGED,
    CONSTANTS.STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
    CONSTANTS.STATUS.UKEF_APPROVED_WITH_CONDITIONS,
    CONSTANTS.STATUS.SUBMITTED_TO_UKEF,
  ];

  return !validStatus.includes(status);
};

router.get('/contract/:_id/bond/create', async (req, res) => {
  const { dealId, bondId } = await api.createBond(req.params._id, req.session.userToken);

  return res.redirect(`/contract/${dealId}/bond/${bondId}/details`);
});

router.get('/contract/:_id/bond/:bondId/details', [validateRole({ role: [MAKER] }), provide([DEAL])], async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  if (!await api.validateToken(userToken) || !bondCanBeAccessed(req.apiData.deal)) {
    return res.redirect('/');
  }

  const apiResponse = await getApiData(
    api.contractBond(_id, bondId, userToken),
    res,
  );

  const {
    dealId,
    bond,
    validationErrors,
  } = apiResponse;

  const completedForms = completedBondForms(validationErrors);

  return res.render('bond/bond-details.njk', {
    dealId,
    bond,
    validationErrors: bondDetailsValidationErrors(validationErrors, bond),
    taskListItems: bondTaskList(completedForms),
    user: req.session.user,
  });
});

const bondDetailsPayloadProperties = [
  'bondIssuer',
  'bondType',
  'facilityStage',
  'bondBeneficiary',
  'requestedCoverStartDate-day',
  'requestedCoverStartDate-month',
  'requestedCoverStartDate-year',
  'coverEndDate-day',
  'coverEndDate-month',
  'coverEndDate-year',
  'name',
  'ukefGuaranteeInMonths',
];

const filterBondDetailsPayload = (body) => {
  const payload = constructPayload(body, bondDetailsPayloadProperties);
  if (payload.facilityStage === 'Unissued') {
    delete payload['requestedCoverStartDate-day'];
    delete payload['requestedCoverStartDate-month'];
    delete payload['requestedCoverStartDate-year'];
    delete payload['coverEndDate-day'];
    delete payload['coverEndDate-month'];
    delete payload['coverEndDate-year'];
    delete payload.name;
  } else {
    delete payload.ukefGuaranteeInMonths;
  }
  return payload;
};

router.post('/contract/:_id/bond/:bondId/details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  const bondPayload = filterBondDetailsPayload(req.body);

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      bondPayload,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/financial-details`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/bond/:bondId/details/save-go-back', provide([BOND]), async (req, res) => {
  const bondPayload = constructPayload(req.body, bondDetailsPayloadProperties);
  const filteredBondPayload = filterBondDetailsPayload(bondPayload);
  return saveFacilityAndGoBackToDeal(req, res, filteredBondPayload);
});

router.get('/contract/:_id/bond/:bondId/financial-details', [validateRole({ role: [MAKER] }), provide([CURRENCIES, DEAL])], async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  if (!await api.validateToken(userToken) || !bondCanBeAccessed(req.apiData.deal)) {
    return res.redirect('/');
  }

  const { currencies } = req.apiData;

  const bondResponse = await getApiData(
    api.contractBond(_id, bondId, userToken),
    res,
  );

  const {
    dealId,
    bond,
    validationErrors,
  } = bondResponse;

  const completedForms = completedBondForms(validationErrors);

  return res.render('bond/bond-financial-details.njk', {
    dealId,
    bond,
    validationErrors: bondFinancialDetailsValidationErrors(validationErrors, bond),
    currencies: mapCurrencies(currencies, bondResponse.bond.currency),
    taskListItems: bondTaskList(completedForms),
    user: req.session.user,
  });
});

const bondFinancialDetailsPayloadProperties = [
  'value',
  'currencySameAsSupplyContractCurrency',
  'currency',
  'conversionRate',
  'conversionRateDate-day',
  'conversionRateDate-month',
  'conversionRateDate-year',
  'riskMarginFee',
  'coveredPercentage',
  'minimumRiskMarginFee',
];

const filterBondFinancialDetailsPayload = (body) => {
  const sanitizedPayload = constructPayload(body, bondFinancialDetailsPayloadProperties);

  if (sanitizedPayload.currencySameAsSupplyContractCurrency === 'true') {
    delete sanitizedPayload.conversionRate;
    delete sanitizedPayload['conversionRateDate-day'];
    delete sanitizedPayload['conversionRateDate-month'];
    delete sanitizedPayload['conversionRateDate-year'];
  }

  return sanitizedPayload;
};

router.post('/contract/:_id/bond/:bondId/financial-details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);
  const bondPayload = filterBondFinancialDetailsPayload(req.body);

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      bondPayload,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/fee-details`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/bond/:bondId/financial-details/save-go-back', provide([BOND]), async (req, res) => {
  const sanitizedPayload = filterBondFinancialDetailsPayload(req.body);
  return saveFacilityAndGoBackToDeal(req, res, sanitizedPayload);
});

router.get('/contract/:_id/bond/:bondId/fee-details', [validateRole({ role: [MAKER] }), provide([DEAL])], async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  if (!await api.validateToken(userToken) || !bondCanBeAccessed(req.apiData.deal)) {
    return res.redirect('/');
  }

  const apiResponse = await getApiData(
    api.contractBond(_id, bondId, userToken),
    res,
  );

  const {
    dealId,
    bond,
    validationErrors,
  } = apiResponse;

  const completedForms = completedBondForms(validationErrors);

  return res.render('bond/bond-fee-details.njk', {
    dealId,
    bond,
    validationErrors: bondFeeDetailsValidationErrors(validationErrors, bond),
    taskListItems: bondTaskList(completedForms),
    user: req.session.user,
  });
});

const bondFeeDetailsPayloadProperties = [
  'feeFrequency',
  'feeType',
  'inAdvanceFeeFrequency',
  'inArrearFeeFrequency',
  'dayCountBasis',
];

router.post('/contract/:_id/bond/:bondId/fee-details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);
  const sanitizedBody = constructPayload(req.body, bondFeeDetailsPayloadProperties);
  const modifiedBody = feeFrequencyField(sanitizedBody);

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      modifiedBody,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/check-your-answers`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/bond/:bondId/fee-details/save-go-back', provide([BOND]), async (req, res) => {
  const sanitizedBody = constructPayload(req.body, bondFeeDetailsPayloadProperties);
  const modifiedBody = feeFrequencyField(sanitizedBody);
  return saveFacilityAndGoBackToDeal(req, res, modifiedBody);
});

router.get('/contract/:_id/bond/:bondId/check-your-answers', validateRole({ role: [MAKER] }), async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    return res.redirect('/');
  }

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

  // The status is extracted, otherwise bad things happen.
  // When we GET a facility/bond, the status is dynamically added (it's not in the DB)
  // here, in the preview screen, we need to extract the status from the POST
  // otherwise the status will be added to the DB and not dynamically added.
  const { status, ...bondWithoutStatus } = bond;

  const updatedBond = {
    ...bondWithoutStatus,
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

  let formattedValidationErrors;
  if (validationErrors.count !== 0) {
    formattedValidationErrors = generateErrorSummary(
      bondPreviewValidationErrors(validationErrors, dealId, bondId),
      errorHref,
    );
  }

  const completedForms = completedBondForms(validationErrors);

  return res.render('bond/bond-check-your-answers.njk', {
    dealId,
    bond,
    validationErrors: formattedValidationErrors,
    taskListItems: bondTaskList(completedForms),
    user: req.session.user,
  });
});

router.get('/contract/:_id/bond/:bondId/issue-facility', [validateRole({ role: [MAKER] }), provide([BOND, DEAL])], async (req, res) => {
  const { _id: dealId } = requestParams(req);
  const { bond } = req.apiData.bond;
  const { user } = req.session;

  if (!canIssueOrEditIssueFacility(user.roles, req.apiData.deal, bond)) {
    return res.redirect('/');
  }

  return res.render('bond/bond-issue-facility.njk', {
    dealId,
    user,
    bond,
  });
});

router.post('/contract/:_id/bond/:bondId/issue-facility', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);
  const { user } = req.session;

  const payloadProperties = [
    'issuedDate-day',
    'issuedDate-month',
    'issuedDate-year',
    'requestedCoverStartDate-day',
    'requestedCoverStartDate-month',
    'requestedCoverStartDate-year',
    'coverEndDate-day',
    'coverEndDate-month',
    'coverEndDate-year',
    'name',
  ];
  const payload = constructPayload(req.body, payloadProperties);

  const { validationErrors, bond } = await postToApi(
    api.updateBondIssueFacility(
      dealId,
      bondId,
      payload,
      userToken,
    ),
    errorHref,
  );

  if (validationErrors) {
    return res.render('bond/bond-issue-facility.njk', {
      user,
      validationErrors,
      bond,
      dealId,
    });
  }

  return res.redirect(`/contract/${dealId}`);
});

router.get('/contract/:_id/bond/:bondId/confirm-requested-cover-start-date', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  const apiResponse = await getApiData(
    api.contractBond(dealId, bondId, userToken),
    res,
  );

  const {
    bond,
  } = apiResponse;

  const formattedRequestedCoverStartDate = formattedTimestamp(bond.requestedCoverStartDate);
  const now = formattedTimestamp(moment().utc().valueOf().toString());

  const needToChangeRequestedCoverStartDate = moment(formattedRequestedCoverStartDate).isBefore(now, 'day');

  return res.render('_shared-pages/confirm-requested-cover-start-date.njk', {
    dealId,
    user: req.session.user,
    facility: bond,
    needToChangeRequestedCoverStartDate,
  });
});

router.post('/contract/:_id/bond/:bondId/confirm-requested-cover-start-date', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  let requestedCoverValidationErrors = {};
  let bondToRender;

  if (req.body.needToChangeRequestedCoverStartDate) {
    if (!req.session.confirmedRequestedCoverStartDates) {
      req.session.confirmedRequestedCoverStartDates = {};
    }
  }

  const addFacilityToSessionConfirmedStartDates = () => {
    if (!req.session.confirmedRequestedCoverStartDates[dealId]) {
      req.session.confirmedRequestedCoverStartDates[dealId] = [bondId];
    } else if (!req.session.confirmedRequestedCoverStartDates[dealId].includes(bondId)) {
      req.session.confirmedRequestedCoverStartDates[dealId].push(bondId);
    }
  };

  if (req.body.needToChangeRequestedCoverStartDate === 'true') {
    const apiData = await getApiData(
      api.contractBond(dealId, bondId, userToken),
      res,
    );
    bondToRender = apiData.bond;

    if (!req.body['requestedCoverStartDate-day'] || !req.body['requestedCoverStartDate-month'] || !req.body['requestedCoverStartDate-year']) {
      requestedCoverValidationErrors = {
        count: 1,
        errorList: {
          requestedCoverStartDate: {
            text: 'Enter the Requested Cover Start Date', order: '1',
          },
        },
        summary: [{
          text: 'Enter the Requested Cover Start Date',
          href: '#requestedCoverStartDate',
        }],
      };
    } else {
      const previousCoverStartDate = moment().set({
        date: Number(bondToRender['requestedCoverStartDate-day']),
        month: Number(bondToRender['requestedCoverStartDate-month']) - 1, // months are zero indexed
        year: Number(bondToRender['requestedCoverStartDate-year']),
      });

      const previousCoverStartDateTimestamp = moment(previousCoverStartDate).utc().valueOf().toString();

      const now = moment();

      const dateOfCoverChange = moment().set({
        date: Number(moment(now).format('DD')),
        month: Number(moment(now).format('MM')) - 1, // months are zero indexed
        year: Number(moment(now).format('YYYY')),
      });

      const dateOfCoverChangeTimestamp = moment(dateOfCoverChange).utc().valueOf().toString();

      const payloadProperties = [
        'requestedCoverStartDate-day',
        'requestedCoverStartDate-month',
        'requestedCoverStartDate-year',
        'needToChangeRequestedCoverStartDate',
      ];
      const newRequestedCoverStartDate = constructPayload(req.body, payloadProperties);

      const newBondDetails = {
        ...newRequestedCoverStartDate,
        previousCoverStartDate: previousCoverStartDateTimestamp,
        dateOfCoverChange: dateOfCoverChangeTimestamp,
      };

      const { bond, validationErrors } = await postToApi(
        api.updateBondCoverStartDate(
          dealId,
          bondId,
          newBondDetails,
          userToken,
        ),
        errorHref,
      );

      requestedCoverValidationErrors = {
        ...validationErrors,
      };
      bondToRender = bond;
    }

    if (!requestedCoverValidationErrors.errorList
      || (requestedCoverValidationErrors.errorList
          && !requestedCoverValidationErrors.errorList.requestedCoverStartDate)) {
      addFacilityToSessionConfirmedStartDates();
    }

    if (
      requestedCoverValidationErrors
      && requestedCoverValidationErrors.errorList
      && requestedCoverValidationErrors.errorList.requestedCoverStartDate
    ) {
      return res.render('_shared-pages/confirm-requested-cover-start-date.njk', {
        dealId,
        user: req.session.user,
        facility: bondToRender,
        validationErrors: requestedCoverValidationErrors,
        enteredValues: req.body,
        needToChangeRequestedCoverStartDate: req.body.needToChangeRequestedCoverStartDate,
      });
    }
  } else if (req.body.needToChangeRequestedCoverStartDate === 'false') {
    addFacilityToSessionConfirmedStartDates();
  }

  const redirectUrl = `/contract/${dealId}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/delete', [validateRole({ role: [MAKER] }, (req) => `/contract/${req.params._id}`), provide([DEAL, BOND])], async (req, res) => {
  const { bond } = req.apiData.bond;
  const { user } = req.session;

  if (isDealEditable(req.apiData.deal, user)) {
    return res.render('bond/bond-delete.njk', {
      deal: req.apiData.deal,
      bond,
      user: req.session.user,
    });
  }

  const redirectUrl = `/contract/${req.params._id}`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/bond/:bondId/delete', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  await postToApi(
    api.deleteBond(
      dealId,
      bondId,
      userToken,
    ),
    errorHref,
  );

  req.flash('successMessage', {
    text: `Bond #${bondId} has been deleted`,
  });

  return res.redirect(`/contract/${dealId}`);
});

module.exports = router;
