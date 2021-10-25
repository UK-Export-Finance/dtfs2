const Application = require('../../../models/application');
const { validationErrorHandler } = require('../../../utils/helpers');
const validateFile = require('../../../utils/validateFile');
const { uploadAndSaveToDeal, removeFileFromDeal } = require('../../../utils/fileUtils');
const { docType } = require('./docType');

const MAX_FILE_SIZE = 1024 * 1024 * 12;

const mapDocTypeParemeterToProps = (type) => {
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

const nextDocument = (application, applicationId, fieldName) => {
  let supportingDocument = 'manual-inclusion-questionnaire'; // default page
  if (application.supportingInformation?.requiredFields?.length > 0) {
    const allDocTypes = docType;
    const currentIndex = application.supportingInformation.requiredFields.indexOf(fieldName);
    const nextIndex = (currentIndex + 1) % application.supportingInformation.requiredFields.length;

    const nextItem = application.supportingInformation.requiredFields[nextIndex];

    Object.values(allDocTypes).forEach((value) => {
      if (value.fieldName === nextItem) {
        supportingDocument = value.path;
      }
    });
  }

  let nextDoc = `/gef/application-details/${applicationId}/supporting-information/${supportingDocument}`;
  if (!application.supportingInformation?.requiredFields?.length) {
    nextDoc = `/gef/application-details/${applicationId}`;
  }

  return nextDoc;
};

const getApplication = async (applicationId, user, userToken) => {
  const application = await Application.findById(applicationId, user, userToken);
  if (!application) {
    throw new Error('NO_APPLICATION');
  }

  return application;
};

const handleError = (err, req, res, next) => {
  const { params: { applicationId, documentType } } = req;

  if (err.message === 'NOT_SUPPORTED') {
    const errMessage = `No support for document type ${documentType}`;
    console.error(errMessage);

    return next(new Error(errMessage));
  }
  if (err.message === 'NO_APPLICATION') {
    const errMessage = `User unauthorised to access application ${applicationId}`;
    console.error(errMessage);

    return next(new Error(errMessage));
  }

  return next(err);
};

const getSupportingDocuments = async (req, res, next) => {
  const {
    session: { user, userToken },
    params: { applicationId, documentType },
  } = req;
  let application;

  try {
    application = await getApplication(applicationId, user, userToken);
    const { fieldName, title } = mapDocTypeParemeterToProps(documentType);

    let files = [];
    if (Object.prototype.hasOwnProperty.call(application.supportingInformation, fieldName)) {
      files = application.supportingInformation?.[fieldName];
    }
    return res.render('partials/upload-supporting-documents.njk', {
      title,
      formHeaderFragment: fieldName,
      user,
      applicationId,
      files,
    });
  } catch (err) {
    console.error('GEF UI - Error getting Supporting Documents ', err);
    return handleError(err, req, res, next);
  }
};

const postSupportingDocuments = async (req, res, next) => {
  const {
    body: { delete: fileToDelete, submit },
    files,
    params: { applicationId, documentType },
    session: { user, userToken },
  } = req;
  const errRef = 'documents';
  try {
    const { fieldName, title } = mapDocTypeParemeterToProps(documentType);

    let errors = [];
    let processedFiles = [];

    let application = await getApplication(applicationId, user, userToken);

    // Check if files have been sent via non-JS upload
    if (files && Array.isArray(files) && files.length) {
      const validFiles = [];
      const invalidFiles = [];

      files.forEach((file) => {
        const [isValid, error] = validateFile(file, MAX_FILE_SIZE);

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
        applicationId,
        userToken,
        user,
        MAX_FILE_SIZE,
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
    if (processedFiles.length) application = await Application.findById(applicationId, user, userToken);

    if (fileToDelete) {
      try {
        await removeFileFromDeal(fileToDelete, fieldName, application, userToken);
      } catch (err) {
        const errMsg = `Error deleting file ${fileToDelete}: ${err.message}`;
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
        applicationId,
        files: [
          ...processedFiles,
          ...(application.supportingInformation?.[fieldName] || []),
        ],
      });
    }

    return res.redirect(nextDocument(application, applicationId, fieldName));
  } catch (err) {
    return handleError(err, req, res, next);
  }
};

const uploadSupportingDocument = async (req, res, next) => {
  const {
    file,
    params: { applicationId, documentType },
    session: { user, userToken },
  } = req;
  try {
    const { fieldName } = mapDocTypeParemeterToProps(documentType);

    if (!file) return res.status(400).send('Missing file');

    const [isValid, error] = validateFile(file, MAX_FILE_SIZE);

    file.error = error;

    if (isValid) {
      // check user has access
      await getApplication(applicationId, user, userToken);

      const [processedFile] = await uploadAndSaveToDeal(
        [file],
        fieldName,
        applicationId,
        userToken,
        user,
        MAX_FILE_SIZE,
      );

      const response = processedFile.error
        ? { error: { message: processedFile.error } }
        : { success: { messageHtml: processedFile.filename } };

      return res.status(200).send({
        file: processedFile,
        ...response,
      });
    }

    return res.status(200).send({
      file,
      error: { message: file.error },
    });
  } catch (err) {
    return handleError(err, req, res, next);
  }
};

const deleteSupportingDocument = async (req, res, next) => {
  const {
    body: { delete: fileToDelete },
    params: { applicationId, documentType },
    session: { user, userToken },
  } = req;
  try {
    const { fieldName } = mapDocTypeParemeterToProps(documentType);

    if (!fileToDelete) return res.status(400).send('Missing file to delete');

    const application = await getApplication(applicationId, user, userToken);

    await removeFileFromDeal(fileToDelete, fieldName, application, userToken);

    return res.status(200).send({
      file: fileToDelete,
      success: {
        messageText: `${fileToDelete} deleted`,
      },
    });
  } catch (err) {
    return handleError(err, req, res, next);
  }
};

module.exports = {
  getSupportingDocuments,
  postSupportingDocuments,
  uploadSupportingDocument,
  deleteSupportingDocument,
  nextDocument,
};
