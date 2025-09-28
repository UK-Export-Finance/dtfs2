const { validationErrorHandler, isTrueSet, isEmpty } = require('../../utils/helpers');
const api = require('../../services/api');

/**
 * Controller to render mandatory criteria page
 * @async
 * @function getMandatoryCriteria
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Renders the mandatory criteria page or an error page.
 */
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

/**
 * Controller to handle validating and saving mandatory criteria answers
 * @async
 * @function validateMandatoryCriteria
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
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
