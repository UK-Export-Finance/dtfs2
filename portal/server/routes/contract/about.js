import express from 'express';
import api from '../../api';
import companiesHouseAPI from '../../companies-house-api';
import {
  getApiData,
  requestParams,
  mapCurrencies,
} from '../../helpers';


const updateSubmissionDetails = async (dealId, postedSubmissionDetails, userToken, res) => {
  const deal = await getApiData(
    api.contract(dealId, userToken),
    res,
  );

  const submissionDetails = { ...postedSubmissionDetails };

  // fix industrySector/industryClass data; is nested in source data, and the way it's rendered makes this preferable
  if (submissionDetails.industrySector && submissionDetails.industryClass) {
    submissionDetails.industrySector = {
      code: submissionDetails.industrySector,
      name: '', // TODO
      class: {
        code: submissionDetails.industryClass,
        name: '', // TODO
      },
    };
    delete submissionDetails.industryClass;
  }

  // fix currency
  if (submissionDetails.supplyContractCurrency && !submissionDetails.supplyContractCurrency.id) {
    submissionDetails.supplyContractCurrency = {
      id: submissionDetails.supplyContractCurrency,
    };
  }

  await api.updateSubmissionDetails(deal, submissionDetails, userToken, res);
};

const router = express.Router();

router.get('/contract/:_id/about/supplier', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/about/about-supplier.njk', {
    deal: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    countries: await getApiData(
      api.countries(userToken),
      res,
    ),
    industrySectors: await getApiData(
      api.industrySectors(userToken),
      res,
    ),
  });
});

router.post('/contract/:_id/about/supplier', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${_id}/about/buyer`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/supplier/companies-house-search/:prefix', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { prefix } = req.params;

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  const searchTerm = `${prefix}-companies-house-registration-number`;
  const company = await companiesHouseAPI.searchByRegistrationNumber(req.body[searchTerm]);

  // fix industrySector/industryClass data; is nested in source data, and the way it's rendered makes this preferable
  const submissionDetails = req.body;
  if (submissionDetails.industrySector && submissionDetails.industryClass) {
    submissionDetails.industrySector = {
      code: submissionDetails.industrySector,
      name: '', // TODO
      class: {
        code: submissionDetails.industryClass,
        name: '', // TODO
      },
    };
  }

  // cache the current form status in the deal so it gets re-displayed when we re-render..
  deal.submissionDetails = submissionDetails;

  if (!company) {
    // TODO - send a real message?
    const validation = {};
    validation[`${prefix}-companies-house-registration-number`] = 'not found';

    return res.render('contract/about/about-supplier.njk', {
      validation,
      deal,
      countries: await getApiData(
        api.countries(userToken),
        res,
      ),
      industrySectors: await getApiData(
        api.industrySectors(userToken),
        res,
      ),
    });
  }

  // munge data back into form data
  deal.submissionDetails[`${prefix}-name`] = company.title;
  deal.submissionDetails[`${prefix}-address-line-1`] = company.address.premises;
  deal.submissionDetails[`${prefix}-address-line-2`] = company.address.address_line_1;
  deal.submissionDetails[`${prefix}-address-town`] = company.address.locality;
  deal.submissionDetails[`${prefix}-address-postcode`] = company.address.postal_code;
  // looks like CH don't use this?
  // contract.submissionDetails["supplier-address-county"] = company.address.?????;
  // CH-> 'england', portal->United Kingdom
  // contract.submissionDetails["supplier-address-country"] = company.address.?????;

  // re-render
  return res.render('contract/about/about-supplier.njk', {
    deal,
    countries: await getApiData(
      api.countries(userToken),
      res,
    ),
    industrySectors: await getApiData(
      api.industrySectors(userToken),
      res,
    ),
  });
});

router.post('/contract/:_id/about/supplier/save-go-back', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/buyer', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/about/about-supply-buyer.njk', {
    deal: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    countries: await getApiData(
      api.countries(userToken),
      res,
    ),
  });
});

router.post('/contract/:_id/about/buyer', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${_id}/about/financial`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/buyer/save-go-back', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/financial', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const currencies = await getApiData(
    api.bondCurrencies(userToken),
    res,
  );

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  res.render('contract/about/about-supply-financial.njk', {
    deal,
    currencies: mapCurrencies(currencies, deal.submissionDetails.supplyContractCurrency),
  });
});

router.post('/contract/:_id/about/financial', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${req.params._id}/about/preview`; // eslint-disable-line no-underscore-dangle
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/financial/save-go-back', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const submissionDetails = req.body;

  await updateSubmissionDetails(_id, submissionDetails, userToken, res);

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/preview', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );
  console.log(JSON.stringify(deal));
  return res.render('contract/about/about-supply-preview.njk', { deal });
});


export default router;
