import express from 'express';
import api from '../../api';
import companiesHouseAPI from '../../companies-house-api';
import {
  getApiData,
  requestParams,
  mapCurrencies,
} from '../../helpers';


const router = express.Router();

router.get('/contract/:_id/about/supplier', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('about/about-supplier.njk', {
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

router.post('/contract/:id/about/supplier', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/about/buyer`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:_id/about/supplier/companies-house-search', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  const company = await companiesHouseAPI.searchByRegistrationNumber(req.body.supplierCompaniesHouseRegistrationNumber);

  // cache the current form status in the deal so it gets re-displayed when we re-render..
  deal.submissionDetails = req.body;

  if (!company) {
    return res.render('about/about-supplier.njk', {
      validation: { // TODO do this properly
        supplierCompaniesHouseRegistrationNumber: 'not found',
      },
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
  deal.submissionDetails.supplierName = company.title;
  deal.submissionDetails['supplier-address-line-1'] = company.address.premises;
  deal.submissionDetails['supplier-address-line-2'] = company.address.address_line_1;
  deal.submissionDetails['supplier-address-town'] = company.address.locality;
  deal.submissionDetails['supplier-address-postcode'] = company.address.postal_code;
  // looks like CH don't use this?
  // contract.submissionDetails["supplier-address-county"] = company.address.?????;
  // CH-> 'england', portal->United Kingdom
  // contract.submissionDetails["supplier-address-country"] = company.address.?????;

  // re-render
  return res.render('about/about-supplier.njk', {
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
  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  const submissionDetails = req.body;

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
  }

  await api.updateSubmissionDetails(deal, submissionDetails, userToken);

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/buyer', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('about/about-supply-buyer.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    countries: await getApiData(
      api.countries(userToken),
      res,
    ),
  });
});

router.post('/contract/:id/about/buyer', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/about/financial`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/about/buyer/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/financial', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const currencies = await getApiData(
    api.bondCurrencies(userToken),
    res,
  );

  res.render('about/about-supply-financial.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    currencies: mapCurrencies(currencies),
  });
});

router.post('/contract/:id/about/financial', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}/about/preview`;
  return res.redirect(redirectUrl);
});

router.post('/contract/:id/about/financial/save-go-back', (req, res) => {
  const redirectUrl = `/contract/${req.params.id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/about/preview', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('about/about-supply-preview.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});


export default router;
