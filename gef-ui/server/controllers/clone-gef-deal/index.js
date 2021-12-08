const { validationErrorHandler, isTrueSet, isEmpty } = require('../../utils/helpers');
const api = require('../../services/api');

const cloneDealCreateApplication = async (req, res, next) => {
  const { body, session } = req;
  const { _id: userId, bank: { id: bankId } } = session.user;

  try {
    //  console.log(req);
    const application = await api.cloneApplication({
      applicationId: req.params.applicationId,
      ...body,
      userId,
      bankId,
    });
    //  console.log(application);
    console.log('🚀 ~ file: index.js ~ line 17 ~ cloneDealCreateApplication ~ application', application);

    //  // Validation errors
    //  if (application.status === 422) {
    //    return res.render('partials/name-application.njk', {
    //      bankInternalRefName: body.bankInternalRefName,
    //      additionalRefName: body.additionalRefName,
    //      errors: validationErrorHandler(application.data),
    //    });
    //  }

    return res.redirect(`/gef/application-details/${application.applicationId}`);
  } catch (err) {
    return next(err);
  }
};

const cloneDealValidateMandatoryCriteria = async (req, res) => {
  const { body } = req;
  const { mandatoryCriteria } = body;

  try {
    const criteria = await api.getMandatoryCriteria();

    if (isEmpty(mandatoryCriteria)) {
      const mandatoryError = {
        errRef: 'confirm',
        errMsg: 'Select if the mandatory criteria will be true or false on the date that cover starts',
      };

      return res.render('partials/mandatory-criteria.njk', {
        errors: validationErrorHandler(mandatoryError),
        criteria,
      });
    }

    if (isTrueSet(mandatoryCriteria)) {
      return res.redirect('clone/name-application');
    }

    return res.redirect('/gef/ineligible-gef');
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const cloneDealNameApplication = async (req, res) => {
  const viewProps = {};

  return res.render('partials/name-application.njk', viewProps);
};

module.exports = { cloneDealValidateMandatoryCriteria, cloneDealNameApplication, cloneDealCreateApplication };
