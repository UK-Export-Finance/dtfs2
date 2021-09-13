const Application = require('../../../models/application');
const { validationErrorHandler } = require('../../../utils/helpers');
const validateFile = require('../../../utils/validateFile');
const { uploadAndSaveToDeal, removeFileFromDeal } = require('../../../utils/fileUtils');

// This is only needed in this question due to the different size requirement
const MAX_FILE_SIZE = 1024 * 1024 * 12;
const FIELD_NAME = 'manualInclusion';

const getUploadManualInclusion = async (req, res) => {
  const {
    session: { user, userToken },
    params: { applicationId },
  } = req;

  const application = await Application.findById(applicationId, user, userToken);

  if (!application) {
    console.log(`User unauthorised to view application ${applicationId} manual inclusion`);
    return res.redirect('/dashboard/gef/');
  }

  return res.render('partials/manual-inclusion-questionnaire.njk', {
    user,
    applicationId,
    files: application.supportingInformation?.manualInclusion,
  });
};

const validateFileQuestion = (application, field, errRef) => {
  const errors = [];

  const files = application?.supportingInformation?.[field] || [];

  if (!files.length) {
    errors.push({
      errRef,
      errMsg: 'Upload Manual inclusion questionnaire',
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

const postUploadManualInclusion = async (req, res) => {
  const {
    body: { delete: fileToDelete, submit },
    files,
    params: { applicationId },
    session: { user, userToken },
  } = req;
  const errRef = 'documents';

  let manualInclusionErrors = [];
  let processedFiles = [];

  let application = await Application.findById(applicationId, user, userToken);

  if (!application) {
    console.log(`User unauthorised to view application ${applicationId} manual inclusion`);
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

    manualInclusionErrors = processedFiles.reduce((fileErrors, file) => {
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
      manualInclusionErrors.push({ errRef, errMsg });
    }
  }

  if (!fileToDelete) {
    manualInclusionErrors = [
      ...manualInclusionErrors,
      ...validateFileQuestion(application, FIELD_NAME, errRef),
    ];
  }

  if (manualInclusionErrors.length || !submit) {
    return res.render('partials/manual-inclusion-questionnaire.njk', {
      errors: manualInclusionErrors.length && validationErrorHandler(manualInclusionErrors),
      user,
      applicationId,
      files: [
        ...processedFiles,
        ...(application.supportingInformation?.manualInclusion || []),
      ],
    });
  }

  return res.redirect('financial-statements');
};

const uploadManualInclusion = async (req, res) => {
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
        console.log(`User unauthorised to view application ${applicationId} manual inclusion`);
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
      console.error(`Error updating manual inclusion ${err}`);
      file.error = `${file.originalname} could not be uploaded`;
    }
  }

  return res.status(200).send({
    file,
    error: { message: file.error },
  });
};

const deleteManualInclusion = async (req, res) => {
  const {
    body: { delete: fileToDelete },
    params: { applicationId },
    session: { user, userToken },
  } = req;

  if (!fileToDelete) return res.status(400).send('Missing file to delete');

  try {
    const application = await Application.findById(applicationId, user, userToken);

    if (!application) {
      console.error(`User unauthorised to view application ${applicationId} manual inclusion`);
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
  getUploadManualInclusion,
  postUploadManualInclusion,
  uploadManualInclusion,
  deleteManualInclusion,
};
