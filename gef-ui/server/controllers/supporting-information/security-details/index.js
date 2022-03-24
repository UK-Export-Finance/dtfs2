const Application = require('../../../models/application');
const { validationErrorHandler } = require('../../../utils/helpers');
const { updateApplication } = require('../../../services/api');

const MAX_INPUT_LENGTH = 400;

const getSecurityDetails = async (req, res) => {
  const {
    params: { dealId },
    session: { user, userToken },
  } = req;
  try {
    const application = await Application.findById(dealId, user, userToken);

    // if application not found not authorised to view route
    if (!application) {
      console.error(`User unauthorised to view application ${dealId} security details`);
      return res.sendStatus(404);
    }

    const { supportingInformation: { securityDetails = {} } } = application;

    return res.render('partials/security-details.njk', {
      dealId,
      inputMaxLength: MAX_INPUT_LENGTH,
      exporterSecurity: securityDetails.exporter,
      facilitySecurity: securityDetails.facility,
    });
  } catch (err) {
    console.error(`Error getting security details ${err}`);
    return res.sendStatus(500);
  }
};

const postSecurityDetails = async (req, res) => {
  const {
    body: { exporterSecurity = '', facilitySecurity = '' },
    params: { dealId },
    session: { user, userToken },
  } = req;
  const { _id: editorId } = user;

  const securityDetailsErrors = [];

  try {
    [
      {
        id: 'exporterSecurity',
        content: exporterSecurity,
        description: 'details about the general security your bank holds',
      },
      {
        id: 'facilitySecurity',
        content: facilitySecurity,
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
        dealId,
        inputMaxLength: MAX_INPUT_LENGTH,
        exporterSecurity,
        facilitySecurity,
      });
    }

    const securityDetails = {
      exporter: exporterSecurity,
      facility: facilitySecurity,
    };

    const application = await Application.findById(dealId, user, userToken);

    if (!application) {
      console.error(`User unauthorised to update application ${dealId} security details`);
      return res.sendStatus(404);
    }

    application.supportingInformation = {
      ...application.supportingInformation,
      securityDetails,
    };
    // adds editorId to application
    application.editorId = editorId;

    await updateApplication(dealId, application);

    return res.redirect(`/gef/application-details/${dealId}`);
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
