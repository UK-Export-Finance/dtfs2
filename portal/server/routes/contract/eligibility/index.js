import express from 'express';
import multer from 'multer';
import stream from 'stream';
import api from '../../../api';
import {
  getApiData,
  requestParams,
  generateErrorSummary,
  formatCountriesForGDSComponent,
  errorHref,
} from '../../../helpers';
import {
  provide, DEAL, COUNTRIES,
} from '../../api-data-provider';
import submittedEligibilityMatchesOriginalData from './submittedEligibilityMatchesOriginalData';
import submittedDocumentationMatchesOriginalData from './submittedDocumentationMatchesOriginalData';
import completedEligibilityForms from './completedForms';
import eligibilityTaskList from './eligibilityTaskList';
import elgibilityCheckYourAnswersValidationErrors from './elgibilityCheckYourAnswersValidationErrors';

const mergeEligibilityValidationErrors = (criteria, files) => {
  const criteriaCount = (criteria && criteria.validationErrors && criteria.validationErrors.count)
    ? criteria.validationErrors.count : 0;

  const filesCount = (files && files.validationErrors && files.validationErrors.count)
    ? files.validationErrors.count : 0;

  const count = criteriaCount + filesCount;

  const criteriaErrorList = (criteria && criteria.validationErrors && criteria.validationErrors.errorList)
    ? criteria.validationErrors.errorList : {};

  const filesErrorList = (files && files.validationErrors && files.validationErrors.errorList)
    ? files.validationErrors.errorList : {};

  return {
    count,
    errorList: {
      ...criteriaErrorList,
      ...filesErrorList,
    },
  };
};

const upload = multer();

const router = express.Router();

const eligibilityErrorHref = (id) => `#criterion-group-${id}`;

const userCanAccessEligibility = (user) => {
  if (!user.roles.includes('maker')) {
    return false;
  }

  return true;
};

router.get('/contract/:_id/eligibility/criteria', provide([DEAL, COUNTRIES]), async (req, res) => {
  const { deal, countries } = req.apiData;

  const { user } = req.session;
  if (!userCanAccessEligibility(user)) {
    return res.redirect('/');
  }

  const allEligibilityValidationErrors = mergeEligibilityValidationErrors(
    deal.eligibility,
    deal.dealFiles,
  );

  const validationErrors = generateErrorSummary(allEligibilityValidationErrors, errorHref);

  const criteriaValidationErrors = generateErrorSummary(deal.eligibility.validationErrors, eligibilityErrorHref);

  const completedForms = completedEligibilityForms(deal.eligibility.status, validationErrors);

  return res.render('eligibility/eligibility-criteria.njk',
    {
      _id: deal._id, // eslint-disable-line no-underscore-dangle
      countries: formatCountriesForGDSComponent(
        countries,
        deal.eligibility.agentAddressCountry,
        !deal.eligibility.agentAddressCountry,
      ),
      eligibility: deal.eligibility,
      validationErrors: criteriaValidationErrors,
      bankSupplyContractName: deal.details.bankSupplyContractName,
      user: req.session.user,
      taskListItems: eligibilityTaskList(completedForms),
    });
});

router.post('/contract/:_id/eligibility/criteria', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { body } = req;

  await getApiData(
    api.updateEligibilityCriteria(_id, body, userToken),
    res,
  );

  return res.redirect(`/contract/${_id}/eligibility/supporting-documentation`);
});

router.post('/contract/:_id/eligibility/criteria/save-go-back', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { deal } = req.apiData;

  const { body } = req;

  if (!submittedEligibilityMatchesOriginalData(req.body, deal.eligibility)) {
    await getApiData(
      api.updateEligibilityCriteria(_id, body, userToken),
      res,
    );
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/eligibility/supporting-documentation', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

  const { user } = req.session;
  if (!userCanAccessEligibility(user)) {
    return res.redirect('/');
  }

  const { eligibility, dealFiles = {} } = deal;

  const allEligibilityValidationErrors = mergeEligibilityValidationErrors(
    deal.eligibility,
    deal.dealFiles,
  );
  const validationErrors = generateErrorSummary(allEligibilityValidationErrors, errorHref);

  const documentationValidationErrors = generateErrorSummary(dealFiles.validationErrors, eligibilityErrorHref);

  const completedForms = completedEligibilityForms(deal.eligibility.status, validationErrors);

  return res.render('eligibility/eligibility-supporting-documentation.njk',
    {
      _id: deal._id, // eslint-disable-line no-underscore-dangle
      dealFiles,
      eligibility,
      validationErrors: documentationValidationErrors,
      bankSupplyContractName: deal.details.bankSupplyContractName,
      user: req.session.user,
      taskListItems: eligibilityTaskList(completedForms),
    });
});

router.post('/contract/:_id/eligibility/supporting-documentation', upload.any(), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { body, files, query } = req;
  const formData = { ...body };

  if (query.removefile) {
    formData.deleteFile = query.removefile;
  }

  const updatedDeal = await getApiData(
    api.updateEligibilityDocumentation(_id, formData, files, userToken),
    res,
  );

  const { eligibility, dealFiles = {} } = updatedDeal;

  const documentationValidationErrors = generateErrorSummary(dealFiles.validationErrors, errorHref);

  if (query.stayonpage !== 'true' && documentationValidationErrors.count === 0) {
    return res.redirect(`/contract/${_id}/eligibility/check-your-answers`);
  }

  const allEligibilityValidationErrors = mergeEligibilityValidationErrors(
    updatedDeal.eligibility,
    updatedDeal.dealFiles,
  );
  const validationErrors = generateErrorSummary(allEligibilityValidationErrors, errorHref);

  const completedForms = completedEligibilityForms(updatedDeal.eligibility.status, validationErrors);

  return res.render('eligibility/eligibility-supporting-documentation.njk', {
    _id,
    eligibility,
    dealFiles,
    validationErrors: documentationValidationErrors,
    bankSupplyContractName: updatedDeal.details.bankSupplyContractName,
    user: req.session.user,
    taskListItems: eligibilityTaskList(completedForms),
  });
});

router.post('/contract/:_id/eligibility/supporting-documentation/save-go-back', provide([DEAL]), upload.any(), async (req, res) => {
  const { deal } = req.apiData;
  const { _id, userToken } = requestParams(req);
  const { body, files } = req;

  if (!submittedDocumentationMatchesOriginalData(req.body, req.files, deal.dealFiles)) {
    const updatedDeal = await getApiData(
      api.updateEligibilityDocumentation(_id, body, files, userToken),
      res,
    );

    const { eligibility, dealFiles } = updatedDeal;

    if (dealFiles && dealFiles.validationErrors && dealFiles.validationErrors.uploadErrorCount) {
      const documentationValidationErrors = generateErrorSummary(dealFiles.validationErrors, errorHref);

      const allEligibilityValidationErrors = mergeEligibilityValidationErrors(
        updatedDeal.eligibility,
        updatedDeal.dealFiles,
      );
      const validationErrors = generateErrorSummary(allEligibilityValidationErrors, errorHref);


      const completedForms = completedEligibilityForms(updatedDeal.eligibility.status, validationErrors);

      return res.render('eligibility/eligibility-supporting-documentation.njk', {
        _id,
        eligibility,
        dealFiles,
        validationErrors: documentationValidationErrors,
        bankSupplyContractName: deal.details.bankSupplyContractName,
        taskListItems: eligibilityTaskList(completedForms),
      });
    }
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


router.get('/contract/:_id/eligibility/check-your-answers', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;
  const { user } = req.session;

  if (!userCanAccessEligibility(user)) {
    return res.redirect('/');
  }

  const allEligibilityValidationErrors = mergeEligibilityValidationErrors(
    deal.eligibility,
    deal.dealFiles,
  );

  const validationErrors = generateErrorSummary(
    elgibilityCheckYourAnswersValidationErrors(
      allEligibilityValidationErrors,
      deal._id, // eslint-disable-line no-underscore-dangle
    ),
  );

  const completedForms = completedEligibilityForms(deal.eligibility.status, validationErrors);

  return res.render('eligibility/eligibility-check-your-answers.njk', {
    deal,
    user: req.session.user,
    validationErrors,
    taskListItems: eligibilityTaskList(completedForms),
  });
});

export default router;
