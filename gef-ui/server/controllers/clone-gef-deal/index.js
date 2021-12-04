const { validationErrorHandler, isTrueSet, isEmpty } = require('../../utils/helpers');
const api = require('../../services/api');

exports.cloneDealCreateApplication = async (req, res, next) => {
  const { body, session } = req;
  const { _id: userId, bank: { id: bankId } } = session.user;

  try {
    const application = await api.cloneApplication({
      applicationId: req.params.applicationId,
      ...body,
      userId,
      bankId,
    });

    return res.redirect(`/gef/application-details/${application.applicationId}`);
  } catch (err) {
    return next(err);
  }
};

exports.cloneDealValidateMandatoryCriteria = async (req, res) => {
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

exports.cloneDealNameApplication = async (req, res) => res.render('partials/name-application.njk', {});
