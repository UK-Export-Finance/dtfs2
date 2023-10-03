const { validationErrorHandler, isTrueSet, isEmpty } = require('../../utils/helpers');
const api = require('../../services/api');

const getMandatoryCriteria = async (req, res) => {
  try {
    const { userToken } = req.session;
    const criteria = await api.getMandatoryCriteria({ userToken });

    return res.render('partials/mandatory-criteria.njk', {
      criteria,
    });
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateMandatoryCriteria = async (req, res) => {
  const { userToken } = req.session;
  const { mandatoryCriteria } = req.body;

  try {
    const criteria = await api.getMandatoryCriteria({ userToken });

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
      return res.redirect('name-application');
    }

    return res.redirect('/gef/ineligible-gef');
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  getMandatoryCriteria,
  validateMandatoryCriteria,
};
