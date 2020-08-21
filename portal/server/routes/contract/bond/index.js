import express from 'express';
import api from '../../../api';
import {
  provide,
  BOND,
  DEAL,
  CURRENCIES,
} from '../../api-data-provider';
import {
  getApiData,
  requestParams,
  errorHref,
  postToApi,
  mapCurrencies,
  generateErrorSummary,
} from '../../../helpers';
import {
  bondDetailsValidationErrors,
  bondFinancialDetailsValidationErrors,
  bondFeeDetailsValidationErrors,
  bondPreviewValidationErrors,
} from './pageSpecificValidationErrors';
import completedBondForms from './completedForms';
import formDataMatchesOriginalData from '../formDataMatchesOriginalData';
import canIssueFacility from '../canIssueFacility';
import isDealEditable from '../isDealEditable';

const router = express.Router();

const userCanAccessBond = (user, deal) => {
  if (!user.roles.includes('maker')) {
    return false;
  }

  const { status } = deal.details;

  if (status === 'Acknowledged by UKEF'
    || status === 'Accepted by UKEF (with conditions)'
    || status === 'Accepted by UKEF (without conditions)'
    || status === 'Submitted') {
    return false;
  }

  return true;
};

const userCanAccessBondPreview = (user) => {
  if (!user.roles.includes('maker')) {
    return false;
  }

  return true;
};

const handleFeeFrequency = (bondBody) => {
  const modifiedBond = bondBody;

  const {
    feeType,
    feeFrequency: existingFeeFrequency,
    inAdvanceFeeFrequency,
    inArrearFeeFrequency,
  } = modifiedBond;

  const feeFrequencyValue = () => {
    if (feeType === 'In advance') {
      return inAdvanceFeeFrequency;
    }

    if (feeType === 'In arrear') {
      return inArrearFeeFrequency;
    }

    if (existingFeeFrequency) {
      return existingFeeFrequency;
    }

    return '';
  };

  modifiedBond.feeFrequency = feeFrequencyValue();

  delete modifiedBond.inAdvanceFeeFrequency;
  delete modifiedBond.inArrearFeeFrequency;

  return modifiedBond;
};

router.get('/contract/:_id/bond/create', async (req, res) => {
  const { _id: dealId, userToken } = requestParams(req);

  const { _id, bondId } = await api.createBond(dealId, userToken); // eslint-disable-line no-underscore-dangle

  return res.redirect(`/contract/${_id}/bond/${bondId}/details`); // eslint-disable-line no-underscore-dangle
});

router.get('/contract/:_id/bond/:bondId/details', provide([DEAL]), async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);
  const { user } = req.session;

  if (!await api.validateToken(userToken) || !userCanAccessBond(user, req.apiData.deal)) {
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
    completedForms,
    user: req.session.user,
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

router.get('/contract/:_id/bond/:bondId/financial-details', provide([CURRENCIES, DEAL]), async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);
  const { user } = req.session;

  if (!await api.validateToken(userToken) || !userCanAccessBond(user, req.apiData.deal)) {
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
    completedForms,
    user: req.session.user,
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

router.get('/contract/:_id/bond/:bondId/fee-details', provide([DEAL]), async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);
  const { user } = req.session;

  if (!await api.validateToken(userToken) || !userCanAccessBond(user, req.apiData.deal)) {
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
    completedForms,
    user: req.session.user,
  });
});

router.post('/contract/:_id/bond/:bondId/fee-details', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  const modifiedBody = handleFeeFrequency(req.body);

  await postToApi(
    api.updateBond(
      dealId,
      bondId,
      modifiedBody,
      userToken,
    ),
    errorHref,
  );

  const redirectUrl = `/contract/${dealId}/bond/${bondId}/preview`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/preview', async (req, res) => {
  const { _id, bondId, userToken } = requestParams(req);
  const { user } = req.session;

  if (!await api.validateToken(userToken) || !userCanAccessBondPreview(user)) {
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

  // TODO: make similar to other routes, using page specific function.
  let formattedValidationErrors;
  if (validationErrors.count !== 0) {
    formattedValidationErrors = generateErrorSummary(
      bondPreviewValidationErrors(validationErrors, dealId, bondId),
      errorHref,
    );
  }

  const completedForms = completedBondForms(validationErrors);

  return res.render('bond/bond-preview.njk', {
    dealId,
    bond,
    validationErrors: formattedValidationErrors,
    completedForms,
    user: req.session.user,
  });
});

router.post('/contract/:_id/bond/:bondId/save-go-back', provide([BOND]), async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);
  const { bond } = req.apiData.bond;

  const modifiedBody = handleFeeFrequency(req.body);

  // UI form submit only has the currency code. API has a currency object.
  // to check if something has changed, only use the currency code.
  const mappedOriginalData = bond;

  if (bond.currency && bond.currency.id) {
    mappedOriginalData.currency = bond.currency.id;
  }
  delete mappedOriginalData._id; // eslint-disable-line no-underscore-dangle
  delete mappedOriginalData.status;

  if (!formDataMatchesOriginalData(modifiedBody, mappedOriginalData)) {
    await postToApi(
      api.updateBond(
        dealId,
        bondId,
        modifiedBody,
        userToken,
      ),
      errorHref,
    );
  }

  const redirectUrl = `/contract/${req.params._id}`; // eslint-disable-line no-underscore-dangle
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/issue-facility', provide([BOND, DEAL]), async (req, res) => {
  const { _id: dealId } = requestParams(req);
  const { bond } = req.apiData.bond;
  const { user } = req.session;

  if (!canIssueFacility(user.roles, req.apiData.deal, bond)) {
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

  const { validationErrors, bond } = await postToApi(
    api.updateBondIssueFacility(
      dealId,
      bondId,
      req.body,
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


  return res.render('_shared-pages/confirm-requested-cover-start-date.njk', {
    dealId,
    user: req.session.user,
    facility: bond,
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

    if (!req.session.confirmedRequestedCoverStartDates[dealId]) {
      req.session.confirmedRequestedCoverStartDates[dealId] = [bondId];
    } else if (!req.session.confirmedRequestedCoverStartDates[dealId].includes(bondId)) {
      req.session.confirmedRequestedCoverStartDates[dealId].push(bondId);
    }
  }

  if (req.body.needToChangeRequestedCoverStartDate === 'true') {
    const apiData = await getApiData(
      api.contractBond(dealId, bondId, userToken),
      res,
    );
    bondToRender = apiData.bond;

    if (!req.body['requestedCoverStartDate-day'] || !req.body['requestedCoverStartDate-day'] || !req.body['requestedCoverStartDate-day']) {
      requestedCoverValidationErrors = {
        count: 1,
        errorList: {
          requestedCoverStartDate: {
            text: 'Enter the Cover End Date', order: '1',
          },
        },
        summary: [{
          text: 'Enter the Cover End Date',
          href: '#requestedCoverStartDate',
        }],
      };
    } else {
      const today = new Date();
      const newBondDetails = {
        ...req.body,
        previousCoverStartDate: `${bondToRender['requestedCoverStartDate-day']}/${bondToRender['requestedCoverStartDate-month']}/${bondToRender['requestedCoverStartDate-year']}`,
        dateOfCoverChange: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
      };

      const { bond, validationErrors } = await postToApi(
        api.updateBond(
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
  }

  const redirectUrl = `/contract/${dealId}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/bond/:bondId/delete', provide([DEAL, BOND]), async (req, res) => {
  const { user } = req.session;
  const { bond } = req.apiData.bond;

  if (isDealEditable(req.apiData.deal, user)) {
    return res.render('bond/bond-delete.njk', {
      deal: req.apiData.deal,
      bond,
      user: req.session.user,
    });
  }

  const redirectUrl = `/contract/${req.params._id}`; // eslint-disable-line no-underscore-dangle
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/bond/:bondId/delete', async (req, res) => {
  const { _id: dealId, bondId, userToken } = requestParams(req);

  await postToApi(
    api.deleteDealBond(
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


export default router;
