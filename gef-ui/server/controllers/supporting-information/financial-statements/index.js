const Application = require('../../../models/application');
const { validationErrorHandler } = require('../../../utils/helpers');
const validateFile = require('../../../utils/validateFile');
const { uploadAndSaveToDeal, removeFileFromDeal } = require('../../../utils/fileUtils');

// This is only needed in this question due to the different size requirement
const MAX_FILE_SIZE = 1024 * 1024 * 12;
const FIELD_NAME = 'financialStatements';

const getUploadFinancialStatements = async (req, res) => {
  const {
    session: { user, userToken },
    params: { applicationId },
  } = req;

  const application = await Application.findById(applicationId, user, userToken);

  if (!application) {
    console.log(`User unauthorised to view application ${applicationId} financial statements`);
    return res.redirect('/dashboard/gef/');
  }

  return res.render('partials/financial-statements.njk', {
    user,
    applicationId,
    files: application.supportingInformation?.financialStatements,
  });
};

const validateFileQuestion = (application, field, errRef) => {
  const errors = [];

  const files = application?.supportingInformation?.[field] || [];

  if (!files.length) {
    errors.push({
      errRef,
      errMsg: 'Upload Financial statements',
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

const postUploadFinancialStatements = async (req, res) => {
  const {
    body: { delete: fileToDelete, submit },
    files,
    params: { applicationId },
    session: { user, userToken },
  } = req;
  const errRef = 'documents';

  let errors = [];
  let processedFiles = [];

  let application = await Application.findById(applicationId, user, userToken);

  if (!application) {
    console.log(`User unauthorised to view application ${applicationId} financial statements`);
    return res.redirect('/dashboard/gef/');
  }

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
      FIELD_NAME,
      application,
      userToken,
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
      await removeFileFromDeal(fileToDelete, FIELD_NAME, application, userToken);
    } catch (err) {
      const errMsg = `Error deleting file ${fileToDelete}: ${err.message}`;
      console.error(errMsg);
      errors.push({ errRef, errMsg });
    }
  }

  if (!fileToDelete) {
    errors = [
      ...errors,
      ...validateFileQuestion(application, FIELD_NAME, errRef),
    ];
  }

  if (errors.length || !submit) {
    return res.render('partials/financial-statements.njk', {
      errors: errors.length && validationErrorHandler(errors),
      user,
      applicationId,
      files: [
        ...processedFiles,
        ...(application.supportingInformation?.financialStatements || []),
      ],
    });
  }

  return res.redirect(`/gef/application-details/${application._id}`);
};

const uploadFinancialStatements = async (req, res) => {
  const {
    file,
    params: { applicationId },
    session: { user, userToken },
  } = req;

  if (!file) return res.status(400).send('Missing file');

  const [isValid, error] = validateFile(file, MAX_FILE_SIZE);

  file.error = error;

  if (isValid) {
    try {
      const application = await Application.findById(applicationId, user, userToken);

      if (!application) {
        console.log(`User unauthorised to view application ${applicationId} financial statements`);
        return res.sendStatus(401);
      }

      const [processedFile] = await uploadAndSaveToDeal(
        [file],
        FIELD_NAME,
        application,
        userToken,
        MAX_FILE_SIZE,
      );

      const response = processedFile.error
        ? { error: { message: processedFile.error } }
        : { success: { messageHtml: processedFile.filename } };

      return res.status(200).send({
        file: processedFile,
        ...response,
      });
    } catch (err) {
      console.error(`Error updating financial statements ${err}`);
      file.error = `${file.originalname} could not be uploaded`;
    }
  }

  return res.status(200).send({
    file,
    error: { message: file.error },
  });
};

const deleteFinancialStatements = async (req, res) => {
  const {
    body: { delete: fileToDelete },
    params: { applicationId },
    session: { user, userToken },
  } = req;

  if (!fileToDelete) return res.status(400).send('Missing file to delete');

  try {
    const application = await Application.findById(applicationId, user, userToken);

    if (!application) {
      console.error(`User unauthorised to view application ${applicationId} financial statements`);
      return res.sendStatus(401);
    }

    await removeFileFromDeal(fileToDelete, FIELD_NAME, application, userToken);

    return res.status(200).send({
      file: fileToDelete,
      success: {
        messageText: `${fileToDelete} deleted`,
      },
    });
  } catch (err) {
    console.error(`Error deleting file ${fileToDelete}: ${err.message}`);
    return res.sendStatus(500);
  }
};

module.exports = {
  getUploadFinancialStatements,
  postUploadFinancialStatements,
  uploadFinancialStatements,
  deleteFinancialStatements,
};
