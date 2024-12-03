const { validationErrorHandler } = require('../../utils/helpers');
const api = require('../../services/api');
const constructPayload = require('../../utils/constructPayload');

const nameApplication = async (req, res, next) => {
  const { userToken } = req.session;
  const { params } = req;
  const dealId = params?.dealId;
  const viewProps = {};

  try {
    if (dealId) {
      const application = await api.getApplication({ dealId, userToken });
      viewProps.bankInternalRefName = application.bankInternalRefName;
      viewProps.additionalRefName = application.additionalRefName;
    }
  } catch (error) {
    return next(error);
  }
  return res.render('partials/name-application.njk', viewProps);
};

const createApplication = async (req, res, next) => {
  const { body, session } = req;
  const { userToken } = session;
  const { _id: userId, bank } = session.user;

  const payloadProperties = ['bankInternalRefName', 'additionalRefName'];
  const createApplicationPayload = constructPayload(body, payloadProperties);

  try {
    const application = await api.createApplication({
      payload: {
        ...createApplicationPayload,
        userId,
        bank,
      },
      userToken,
    });

    // Validation errors
    if (application.status === 422) {
      return res.render('partials/name-application.njk', {
        bankInternalRefName: body.bankInternalRefName,
        additionalRefName: body.additionalRefName,
        errors: validationErrorHandler(application.data),
      });
    }

    return res.redirect(`/gef/application-details/${application._id}`);
  } catch (error) {
    return next(error);
  }
};

const updateApplicationReferences = async (req, res, next) => {
  const { body, params } = req;
  const { dealId } = params;
  const { userToken } = req.session;

  const payloadProperties = ['bankInternalRefName', 'additionalRefName'];
  const updateApplicationPayload = constructPayload(body, payloadProperties);

  updateApplicationPayload.bankInternalRefName = updateApplicationPayload.bankInternalRefName ?? '';
  updateApplicationPayload.additionalRefName = updateApplicationPayload.additionalRefName ?? '';

  try {
    const application = await api.updateApplication({ dealId, application: updateApplicationPayload, userToken });

    if (application.status === 422) {
      return res.render('partials/name-application.njk', {
        bankInternalRefName: updateApplicationPayload.bankInternalRefName,
        additionalRefName: updateApplicationPayload.additionalRefName,
        errors: validationErrorHandler(application.data),
      });
    }

    return res.redirect(`/gef/application-details/${application._id}`);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  nameApplication,
  createApplication,
  updateApplicationReferences,
};
