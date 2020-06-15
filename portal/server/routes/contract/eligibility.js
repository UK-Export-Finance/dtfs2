import express from 'express';
import multer from 'multer';
import stream from 'stream';
import api from '../../api';
import {
  getApiData,
  requestParams,
  generateErrorSummary,
  formatCountriesForGDSComponent,
} from '../../helpers';

import {
  provide, DEAL, COUNTRIES, MANDATORY_CRITERIA,
} from '../api-data-provider';

const upload = multer();

const router = express.Router();

const eligibilityErrorHref = (id) => `#criterion-group-${id}`;

router.get('/contract/:_id/eligibility/criteria', provide([DEAL, COUNTRIES]), async (req, res) => {
  const { deal, countries } = req.apiData;

  const validationErrors = generateErrorSummary(deal.eligibility.validationErrors, eligibilityErrorHref);

  return res.render('eligibility/eligibility-criteria.njk',
    {
      _id: deal._id, // eslint-disable-line no-underscore-dangle
      countries: formatCountriesForGDSComponent(
        countries,
        deal.eligibility.agentCountry,
        !deal.eligibility.agentCountry,
      ),
      eligibility: deal.eligibility,
      validationErrors,
      bankSupplyContractName: deal.details.bankSupplyContractName,
    });
});

router.post('/contract/:_id/eligibility/criteria', provide([COUNTRIES]), async (req, res) => {
  const { countries } = req.apiData;
  const { _id, userToken } = requestParams(req);
  const { body } = req;

  const updatedDeal = await getApiData(
    api.updateEligibilityCriteria(_id, body, userToken),
    res,
  );

  if (updatedDeal.eligibility.status === 'Completed') {
    return res.redirect(`/contract/${_id}/eligibility/supporting-documentation`);
  }

  const validationErrors = generateErrorSummary(updatedDeal.eligibility.validationErrors, eligibilityErrorHref);

  return res.render('eligibility/eligibility-criteria.njk', {
    _id,
    countries: formatCountriesForGDSComponent(
      countries,
      updatedDeal.eligibility.agentCountry,
      !updatedDeal.eligibility.agentCountry,
    ),
    criteriaStatus: updatedDeal.eligibility.status,
    eligibility: updatedDeal.eligibility,
    validationErrors,
    bankSupplyContractName: updatedDeal.details.bankSupplyContractName,
  });
});

router.post('/contract/:_id/eligibility/criteria/save-go-back', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { body } = req;

  await getApiData(
    api.updateEligibilityCriteria(_id, body, userToken),
    res,
  );

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/eligibility/supporting-documentation', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

  const { eligibility, dealFiles = {} } = deal;

  const validationErrors = generateErrorSummary(dealFiles.validationErrors, eligibilityErrorHref);

  return res.render('eligibility/eligibility-supporting-documentation.njk',
    {
      _id: deal._id, // eslint-disable-line no-underscore-dangle
      dealFiles,
      eligibility,
      validationErrors,
      bankSupplyContractName: deal.details.bankSupplyContractName,
    });
});

router.post('/contract/:_id/eligibility/supporting-documentation', upload.any(), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { body, files } = req;

  const updatedDeal = await getApiData(
    api.updateEligibilityDocumentation(_id, body, files, userToken),
    res,
  );

  const { eligibility, dealFiles = {} } = updatedDeal;

  const validationErrors = generateErrorSummary(dealFiles.validationErrors, eligibilityErrorHref);

  if (validationErrors.count === 0) {
    return res.redirect(`/contract/${_id}/eligibility/preview`);
  }

  return res.render('eligibility/eligibility-supporting-documentation.njk', {
    _id,
    eligibility,
    dealFiles,
    validationErrors,
    bankSupplyContractName: updatedDeal.details.bankSupplyContractName,
  });
});

router.post('/contract/:_id/eligibility/supporting-documentation/save-go-back', upload.any(), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { body, files } = req;

  const deal = await getApiData(
    api.updateEligibilityDocumentation(_id, body, files, userToken),
    res,
  );

  const { eligibility, dealFiles } = deal;

  if (dealFiles && dealFiles.validationErrors && dealFiles.validationErrors.uploadErrorCount) {
    const validationErrors = generateErrorSummary(dealFiles.validationErrors, eligibilityErrorHref);

    return res.render('eligibility/eligibility-supporting-documentation.njk', {
      _id,
      eligibility,
      dealFiles,
      validationErrors,
      bankSupplyContractName: deal.details.bankSupplyContractName,
    });
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/eligibility-documentation/:fieldname/:filename', async (req, res) => {
  const {
    _id, userToken,
  } = requestParams(req);
  const { fieldname, filename } = req.params;

  const fileData = await getApiData(
    api.downloadFile(_id, fieldname, filename, userToken),
    res,
  );


  res.set('Content-disposition', `attachment; filename=${filename}`);
  res.set('Content-Type', fileData.headers['content-type']);

  const readStream = new stream.PassThrough();
  fileData.pipe(readStream).pipe(res);
});


router.get('/contract/:_id/eligibility/preview', provide([DEAL, MANDATORY_CRITERIA]), async (req, res) => {
  const { deal, mandatoryCriteria } = req.apiData;

  return res.render('eligibility/eligibility-preview.njk', {
    deal,
    mandatoryCriteria,
  });
});

export default router;
