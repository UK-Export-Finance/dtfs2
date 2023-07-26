const sanitizeHtml = require('sanitize-html');
const crypto = require('crypto');
const Application = require('../../../models/application');
const { validationErrorHandler, getCurrentTimePlusMinutes } = require('../../../utils/helpers');
const validateFile = require('../../../utils/validateFile');
const { uploadAndSaveToDeal, removeFileFromDeal } = require('../../../utils/fileUtils');
const { docType } = require('./docType');
const { FILE_UPLOAD } = require('../../../constants/file-upload');

const mapDocTypeParameterToProps = (type) => {
  let mappedValues = null;
  if (Object.prototype.hasOwnProperty.call(docType, type)) {
    mappedValues = docType[type];
  }
  if (!mappedValues) throw new Error('NOT_SUPPORTED');

  return mappedValues;
};

const validateFileQuestion = (application, field, errRef) => {
  const errors = [];

  const files = application?.supportingInformation?.[field] || [];

  if (!files.length) {
    errors.push({
      errRef,
      errMsg: 'Upload documents',
    });
  }

  if (files.length > 20) {
    errors.push({
      errRef,
      errMsg: 'You can only upload up to 20 files at the same time',
    });
  }

  return errors;
};

const nextDocument = (application, dealId, fieldName) => {
  let supportingDocument = 'manual-inclusion-questionnaire'; // default page
  let currentIndex = 0;
  if (application.supportingInformation?.requiredFields?.length > 0) {
    // append the security details to the requiredFields
    application.supportingInformation.requiredFields.push('securityDetails');
    currentIndex = application.supportingInformation?.requiredFields?.indexOf(fieldName);

    const allDocTypes = docType;
    const nextIndex = (currentIndex + 1) % application.supportingInformation.requiredFields.length;

    const nextItem = application.supportingInformation.requiredFields[nextIndex];

    Object.values(allDocTypes).forEach((value) => {
      if (value.fieldName === nextItem) {
        supportingDocument = value.path;
      }
    });
    if (nextItem === 'securityDetails') {
      supportingDocument = 'security-details';
    }
  }

  let nextDoc = `/gef/application-details/${dealId}/supporting-information/document/${supportingDocument}`;
  if (supportingDocument === 'security-details') {
    nextDoc = `/gef/application-details/${dealId}/supporting-information/${supportingDocument}`;
  }
  // check if there are no required fields or check if we reached the end of the required fields
  if (!application.supportingInformation?.requiredFields?.length || currentIndex + 1 === application.supportingInformation?.requiredFields?.length) {
    nextDoc = `/gef/application-details/${dealId}`;
  }

  return nextDoc;
};

const getApplication = async (dealId, user, userToken) => {
  const application = await Application.findById(dealId, user, userToken);
  if (!application) {
    throw new Error('NO_APPLICATION');
  }

  return application;
};

const handleError = (error, req, res, next) => {
  const { params: { dealId, documentType } } = req;

  if (error.message === 'NOT_SUPPORTED') {
    const errMessage = `No support for document type ${documentType}`;
    console.error(errMessage);

    return next(new Error(errMessage));
  }
  if (error.message === 'NO_APPLICATION') {
    const errMessage = `User unauthorised to access application ${dealId}`;
    console.error(errMessage);

    return next(new Error(errMessage));
  }

  return next(error);
};

const getSupportingDocuments = async (req, res, next) => {
  const {
    session: { user, userToken },
    params: { dealId, documentType },
  } = req;
  let application;

  const uploadCsrf = {
    token: crypto.randomBytes(32).toString('hex'),
    expiry: getCurrentTimePlusMinutes(15),
  };

  req.session.uploadCsrf = uploadCsrf;

  try {
    application = await getApplication(dealId, user, userToken);
    const { fieldName, title } = mapDocTypeParameterToProps(documentType);

    let files = [];
    if (Object.prototype.hasOwnProperty.call(application.supportingInformation, fieldName)) {
      files = application.supportingInformation?.[fieldName];
    }
    return res.render('partials/upload-supporting-documents.njk', {
      title,
      formHeaderFragment: fieldName,
      user,
      dealId,
      files,
      uploadCsrf: uploadCsrf.token,
    });
  } catch (error) {
    console.error('GEF UI - Error getting Supporting Documents %O', error);
    return handleError(error, req, res, next);
  }
};

const postSupportingDocuments = async (req, res, next) => {
  delete req.body?._csrf;
  const {
    body: { delete: fileToDelete, submit },
    files,
    params: { dealId, documentType },
    session: { user, userToken },
  } = req;
  const errRef = 'documents';
  try {
    const { fieldName, title } = mapDocTypeParameterToProps(documentType);
    let errors = [];
    let processedFiles = [];

    let application = await getApplication(dealId, user, userToken);

    // Check if files have been sent via non-JS upload
    if (files && Array.isArray(files) && files.length) {
      const validFiles = [];
      const invalidFiles = [];

      files.forEach((file) => {
        const [isValid, error] = validateFile(file, FILE_UPLOAD.MAX_FILE_SIZE_MB);

        if (isValid) {
          validFiles.push(file);
        } else {
          invalidFiles.push({
            ...file,
            error,
          });
        }
      });

      const uploadedFiles = validFiles.length ? await uploadAndSaveToDeal(
        validFiles,
        fieldName,
        dealId,
        userToken,
        user,
        FILE_UPLOAD.MAX_FILE_SIZE_MB,
      ) : [];

      processedFiles = [
        ...invalidFiles,
        ...uploadedFiles,
      ];

      errors = processedFiles.reduce((fileErrors, file) => {
        if (file.error) {
          fileErrors.push({
            errRef: file.filename || file.originalname,
            errMsg: file.error,
          });
        }

        return fileErrors;
      }, []);
    }

    // Need to re-get the application here if any file changes
    if (processedFiles.length) application = await Application.findById(dealId, user, userToken);

    if (fileToDelete) {
      try {
        await removeFileFromDeal(fileToDelete, fieldName, application, userToken, user);
      } catch (error) {
        const errMsg = `Error deleting file ${fileToDelete}: ${error.message}`;
        console.error(errMsg);
        errors.push({ errRef, errMsg });
      }
    }

    if (!fileToDelete) {
      errors = [
        ...errors,
        ...validateFileQuestion(application, fieldName, errRef),
      ];
    }

    if (errors.length || !submit) {
      return res.render('partials/upload-supporting-documents.njk', {
        title,
        formHeaderFragment: fieldName,
        errors: errors.length && validationErrorHandler(errors),
        user,
        dealId,
        files: [
          ...processedFiles,
          ...(application.supportingInformation?.[fieldName] || []),
        ],
      });
    }

    return res.redirect(nextDocument(application, dealId, fieldName));
  } catch (error) {
    console.error('Supporting document post failed %O', error);
    return handleError(error, req, res, next);
  }
};

const uploadSupportingDocument = async (req, res, next) => {
  const { file, params: { dealId, documentType }, session: { user, userToken } } = req;

  try {
    const { fieldName } = mapDocTypeParameterToProps(documentType);

    if (!file) return res.status(400).send('Missing file');

    const [isValid, error] = validateFile(file, FILE_UPLOAD.MAX_FILE_SIZE_MB);

    file.error = error;

    if (isValid) {
      // check user has access
      await getApplication(dealId, user, userToken);
      const documentPath = fieldName;

      const [processedFile] = await uploadAndSaveToDeal(
        [file],
        fieldName,
        dealId,
        userToken,
        user,
        FILE_UPLOAD.MAX_FILE_SIZE_MB,
        documentPath,
      );

      const response = processedFile.error
        ? { error: { message: processedFile.error } }
        : { success: { messageHtml: processedFile.filename } };

      return res.status(200).send({
        file: processedFile,
        ...response,
      });
    }

    return res.status(200).send({ file, error: { message: file.error } });
  } catch (error) {
    console.error('Supporting document upload failed %O', error);
    return handleError(error, req, res, next);
  }
};

const deleteSupportingDocument = async (req, res, next) => {
  const {
    body: { delete: fileToDelete },
    params: { dealId, documentType },
    session: { user, userToken },
  } = req;
  try {
    if (!fileToDelete) return res.status(400).send('Missing file to delete');

    const { fieldName } = mapDocTypeParameterToProps(documentType);

    const application = await getApplication(dealId, user, userToken);

    await removeFileFromDeal(fileToDelete, fieldName, application, userToken, user);

    return res.status(200).send({
      file: sanitizeHtml(fileToDelete),
      success: {
        messageText: `${sanitizeHtml(fileToDelete)} deleted`,
      },
    });
  } catch (error) {
    return handleError(error, req, res, next);
  }
};

module.exports = {
  getSupportingDocuments,
  postSupportingDocuments,
  uploadSupportingDocument,
  deleteSupportingDocument,
  nextDocument,
};
