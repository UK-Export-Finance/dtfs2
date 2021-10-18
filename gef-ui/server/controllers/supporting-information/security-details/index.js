const Application = require('../../../models/application');
const { validationErrorHandler } = require('../../../utils/helpers');
const { updateApplication } = require('../../../services/api');

const MAX_INPUT_LENGTH = 400;

const getSecurityDetails = async (req, res) => {
  const {
    params: { applicationId },
    session: { user, userToken },
  } = req;
  try {
    const application = await Application.findById(applicationId, user, userToken);

    // if application not found not authorised to view route
    if (!application) {
      console.error(`User unauthorised to view application ${applicationId} security details`);
      return res.sendStatus(404);
    }

    const { supportingInformation: { securityDetails = {} } } = application;

    return res.render('partials/security-details.njk', {
      applicationId,
      inputMaxLength: MAX_INPUT_LENGTH,
      exporterSecurity: securityDetails.exporter,
      applicationSecurity: securityDetails.application,
    });
  } catch (err) {
    console.error(`Error getting security details ${err}`);
    return res.sendStatus(500);
  }
};

const postSecurityDetails = async (req, res) => {
  const {
    body: { exporterSecurity = '', applicationSecurity = '' },
    params: { applicationId },
    session: { user, userToken },
  } = req;

  const securityDetailsErrors = [];

  try {
    [
      {
        id: 'exporterSecurity',
        content: exporterSecurity,
        description: 'details about the general security your bank holds',
      },
      {
        id: 'applicationSecurity',
        content: applicationSecurity,
        description: 'details about the specific security for facilities your bank holds',
      },
    ].forEach(({ id, content, description }) => {
      const errRef = id;

      if (!content.length) {
        securityDetailsErrors.push({
          errRef,
          errMsg: `Enter ${description}`,
        });
      }

      if (content.length > MAX_INPUT_LENGTH) {
        securityDetailsErrors.push({
          errRef,
          errMsg: 'Details must be 400 characters or fewer',
        });
      }

      const safeCharsRegex = /^[a-zA-Z\s0-9.,\-!']*$/;

      if (content.length && !safeCharsRegex.test(content)) {
        securityDetailsErrors.push({
          errRef,
          errMsg: 'Details must only include letters a to z, fullstops, commas, hyphens, spaces and apostrophes',
        });
      }
    });

    if (securityDetailsErrors.length) {
      return res.render('partials/security-details.njk', {
        errors: validationErrorHandler(securityDetailsErrors),
        applicationId,
        inputMaxLength: MAX_INPUT_LENGTH,
        exporterSecurity,
        applicationSecurity,
      });
    }

    const securityDetails = {
      exporter: exporterSecurity,
      application: applicationSecurity,
    };

    const application = await Application.findById(applicationId, user, userToken);

    if (!application) {
      console.error(`User unauthorised to update application ${applicationId} security details`);
      return res.sendStatus(404);
    }

    application.supportingInformation = {
      ...application.supportingInformation,
      securityDetails,
    };

    await updateApplication(applicationId, application);

    return res.redirect('export-licence');
  } catch (err) {
    console.error(`Error updating security details ${err}`);
    return res.sendStatus(500);
  }
};

module.exports = {
  MAX_INPUT_LENGTH,
  getSecurityDetails,
  postSecurityDetails,
};
