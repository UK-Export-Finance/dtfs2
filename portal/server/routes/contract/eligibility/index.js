const stream = require('stream');
const express = require('express');
const multer = require('multer');
const {
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { getApiData, requestParams, generateErrorSummary, formatCountriesForGDSComponent, errorHref } = require('../../../helpers');
const { provide, DEAL, COUNTRIES } = require('../../api-data-provider');
const { submittedEligibilityMatchesOriginalData } = require('./submittedEligibilityMatchesOriginalData');
const submittedDocumentationMatchesOriginalData = require('./submittedDocumentationMatchesOriginalData');
const completedEligibilityForms = require('./completedForms');
const eligibilityTaskList = require('./eligibilityTaskList');
const eligibilityCheckYourAnswersValidationErrors = require('./eligibilityCheckYourAnswersValidationErrors');
const { multerFilter, formatBytes } = require('../../../utils/multer-filter.utils');
const { FILE_UPLOAD } = require('../../../constants/file-upload');
const { validateRole } = require('../../middleware');

const mergeEligibilityValidationErrors = (criteria, files) => {
  const criteriaCount = criteria?.validationErrors?.count ? criteria.validationErrors.count : 0;

  const filesCount = files?.validationErrors?.count ? files.validationErrors.count : 0;

  const count = criteriaCount + filesCount;

  const criteriaErrorList = criteria && criteria.validationErrors && criteria.validationErrors.errorList ? criteria.validationErrors.errorList : {};

  const filesErrorList = files?.validationErrors?.errorList ? files.validationErrors.errorList : {};

  return {
    count,
    errorList: {
      ...criteriaErrorList,
      ...filesErrorList,
    },
  };
};

const upload = multer({ limits: { fileSize: FILE_UPLOAD.MAX_FILE_SIZE }, fileFilter: multerFilter }).any();

const router = express.Router();

const eligibilityErrorHref = (id) => `#criterion-group-${id}`;

router.get('/contract/:_id/eligibility/criteria', [validateRole({ role: [MAKER] }), provide([DEAL, COUNTRIES])], async (req, res) => {
  const { deal, countries } = req.apiData;

  const allEligibilityValidationErrors = mergeEligibilityValidationErrors(deal.eligibility, deal.supportingInformation);

  const validationErrors = generateErrorSummary(allEligibilityValidationErrors, errorHref);

  const criteriaValidationErrors = generateErrorSummary(deal?.eligibility?.validationErrors, eligibilityErrorHref);

  const completedForms = completedEligibilityForms(deal.eligibility.status, validationErrors);

  return res.render('eligibility/eligibility-criteria.njk', {
    _id: deal._id,
    countries: formatCountriesForGDSComponent(
      countries,
      deal.eligibility.agentAddressCountry && deal.eligibility.agentAddressCountry.code,
      !deal.eligibility.agentAddressCountry,
    ),
    eligibility: deal.eligibility,
    validationErrors: criteriaValidationErrors,
    additionalRefName: deal.additionalRefName,
    user: req.session.user,
    taskListItems: eligibilityTaskList(completedForms),
  });
});

router.post('/contract/:_id/eligibility/criteria', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { body } = req;

  await getApiData(api.updateEligibilityCriteria(_id, body, userToken), res);

  return res.redirect(`/contract/${_id}/eligibility/supporting-documentation`);
});

router.post('/contract/:_id/eligibility/criteria/save-go-back', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { deal } = req.apiData;

  const { body } = req;

  if (!submittedEligibilityMatchesOriginalData(req.body, deal.eligibility)) {
    await getApiData(api.updateEligibilityCriteria(_id, body, userToken), res);
  }

  const redirectUrl = `/contract/${_id}`;
  return res.redirect(redirectUrl);
});

router.get('/contract/:_id/eligibility/supporting-documentation', [validateRole({ role: [MAKER] }), provide([DEAL])], async (req, res) => {
  const { deal } = req.apiData;

  const { eligibility, supportingInformation = {} } = deal;

  const allEligibilityValidationErrors = mergeEligibilityValidationErrors(deal.eligibility, deal.supportingInformation);
  const validationErrors = generateErrorSummary(allEligibilityValidationErrors, errorHref);

  const documentationValidationErrors = generateErrorSummary(supportingInformation.validationErrors, eligibilityErrorHref);

  const completedForms = completedEligibilityForms(deal.eligibility.status, validationErrors);

  return res.render('eligibility/eligibility-supporting-documentation.njk', {
    _id: deal._id,
    supportingInformation,
    eligibility,
    validationErrors: documentationValidationErrors,
    additionalRefName: deal.additionalRefName,
    user: req.session.user,
    taskListItems: eligibilityTaskList(completedForms),
  });
});

const renderSupportingDocumentationPageWithUploadErrors = (uploadError, deal, req, res) => {
  const { eligibility, supportingInformation = {} } = deal;

  const allEligibilityValidationErrors = mergeEligibilityValidationErrors(deal.eligibility, deal.supportingInformation);
  const validationErrors = generateErrorSummary(allEligibilityValidationErrors, errorHref);

  let documentationValidationErrors = generateErrorSummary(supportingInformation.validationErrors, eligibilityErrorHref);

  if (documentationValidationErrors) {
    documentationValidationErrors.errorList[uploadError.fieldName] = uploadError.error;
    documentationValidationErrors.count += 1;
    documentationValidationErrors.summary.push({
      text: uploadError.summaryText,
      href: uploadError.summaryHref,
    });
  } else {
    documentationValidationErrors = {
      errorList: { [uploadError.fieldName]: uploadError.error },
      summary: [{ text: uploadError.summaryText, href: uploadError.summaryHref }],
      count: 1,
    };
  }

  const completedForms = completedEligibilityForms(deal.eligibility.status, validationErrors);

  return res.render('eligibility/eligibility-supporting-documentation.njk', {
    _id: deal._id,
    supportingInformation,
    eligibility,
    validationErrors: documentationValidationErrors,
    additionalRefName: deal.additionalRefName,
    user: req.session.user,
    taskListItems: eligibilityTaskList(completedForms),
  });
};

router.post(
  '/contract/:_id/eligibility/supporting-documentation',
  provide([DEAL]),
  (req, res, next) => {
    upload(req, res, (error) => {
      if (!error) {
        return next(); // if there are no errors, then continue with the file upload
      }
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.locals.fileUploadError = {
          fieldName: error.field,
          error: { order: 1, text: `File too large, must be smaller than ${formatBytes(12 * 1024 * 1024)}` },
          summaryText: `File too large, must be smaller than ${formatBytes(FILE_UPLOAD.MAX_FILE_SIZE)}`,
          summaryHref: `#criterion-group-${error.field}`,
        };
      } else {
        res.locals.fileUploadError = {
          fieldName: error.file.fieldname,
          error: { order: 1, text: error.message },
          summaryText: error.message,
          summaryHref: `#criterion-group-${error.file.fieldname}`,
        };
      }
      return next();
    });
  },
  async (req, res) => {
    const { _id, userToken } = requestParams(req);
    const { body, files, query } = req;
    const formData = { ...body };

    if (res.locals?.fileUploadError) {
      const { deal } = req.apiData;
      return renderSupportingDocumentationPageWithUploadErrors(res.locals.fileUploadError, deal, req, res);
    }

    if (query.removefile) {
      formData.deleteFile = query.removefile;
    }

    const updatedDeal = await getApiData(api.updateEligibilityDocumentation(_id, formData, files, userToken), res);

    const { eligibility, supportingInformation = {} } = updatedDeal;

    const documentationValidationErrors = generateErrorSummary(supportingInformation.validationErrors, errorHref);

    if (query.stayonpage !== 'true' && documentationValidationErrors.count === 0) {
      return res.redirect(`/contract/${_id}/eligibility/check-your-answers`);
    }

    const allEligibilityValidationErrors = mergeEligibilityValidationErrors(updatedDeal.eligibility, updatedDeal.supportingInformation);
    const validationErrors = generateErrorSummary(allEligibilityValidationErrors, errorHref);

    const completedForms = completedEligibilityForms(updatedDeal.eligibility.status, validationErrors);

    return res.render('eligibility/eligibility-supporting-documentation.njk', {
      _id,
      eligibility,
      supportingInformation,
      validationErrors: documentationValidationErrors,
      additionalRefName: updatedDeal.additionalRefName,
      user: req.session.user,
      taskListItems: eligibilityTaskList(completedForms),
    });
  },
);

router.post(
  '/contract/:_id/eligibility/supporting-documentation/save-go-back',
  provide([DEAL]),
  (req, res, next) => {
    upload(req, res, (error) => {
      if (!error) {
        return next(); // if there are no errors, then continue with the file upload
      }
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.locals.fileUploadError = {
          fieldName: error.field,
          error: { order: 1, text: `File too large, must be smaller than ${formatBytes(12 * 1024 * 1024)}` },
          summaryText: `File too large, must be smaller than ${formatBytes(FILE_UPLOAD.MAX_FILE_SIZE)}`,
          summaryHref: `#criterion-group-${error.field}`,
        };
      } else {
        res.locals.fileUploadError = {
          fieldName: error.file.fieldname,
          error: { order: 1, text: error.message },
          summaryText: error.message,
          summaryHref: `#criterion-group-${error.file.fieldname}`,
        };
      }
      return next();
    });
  },
  async (req, res) => {
    const { deal } = req.apiData;
    const { _id, userToken } = requestParams(req);
    const { body, files } = req;

    if (res.locals?.fileUploadError) {
      return renderSupportingDocumentationPageWithUploadErrors(res.locals.fileUploadError, deal, req, res);
    }

    if (!submittedDocumentationMatchesOriginalData(req.body, req.files, deal.supportingInformation)) {
      const updatedDeal = await getApiData(api.updateEligibilityDocumentation(_id, body, files, userToken), res);

      const { eligibility, supportingInformation } = updatedDeal;

      if (supportingInformation && supportingInformation.validationErrors && supportingInformation.validationErrors.uploadErrorCount) {
        const documentationValidationErrors = generateErrorSummary(supportingInformation.validationErrors, errorHref);

        const allEligibilityValidationErrors = mergeEligibilityValidationErrors(updatedDeal.eligibility, updatedDeal.supportingInformation);
        const validationErrors = generateErrorSummary(allEligibilityValidationErrors, errorHref);

        const completedForms = completedEligibilityForms(updatedDeal.eligibility.status, validationErrors);

        return res.render('eligibility/eligibility-supporting-documentation.njk', {
          _id,
          eligibility,
          supportingInformation,
          validationErrors: documentationValidationErrors,
          additionalRefName: deal.additionalRefName,
          taskListItems: eligibilityTaskList(completedForms),
        });
      }
    }

    const redirectUrl = `/contract/${_id}`;
    return res.redirect(redirectUrl);
  },
);

router.get('/contract/:_id/eligibility-documentation/:fieldname/:filename', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { fieldname, filename } = req.params;

  const fileData = await getApiData(api.downloadEligibilityDocumentationFile(_id, fieldname, filename, userToken), res);

  res.set('Content-disposition', `attachment; filename=${filename}`);
  res.set('Content-Type', fileData.headers['content-type']);

  const readStream = new stream.PassThrough();
  fileData.pipe(readStream).pipe(res);
});

router.get('/contract/:_id/eligibility/check-your-answers', [validateRole({ role: [MAKER] }), provide([DEAL])], async (req, res) => {
  const { deal } = req.apiData;

  const allEligibilityValidationErrors = mergeEligibilityValidationErrors(deal.eligibility, deal.supportingInformation);

  const validationErrors = generateErrorSummary(eligibilityCheckYourAnswersValidationErrors(allEligibilityValidationErrors, deal._id));

  const completedForms = completedEligibilityForms(deal.eligibility.status, validationErrors);

  return res.render('eligibility/eligibility-check-your-answers.njk', {
    deal,
    user: req.session.user,
    validationErrors,
    taskListItems: eligibilityTaskList(completedForms),
  });
});

module.exports = router;
