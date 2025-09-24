/**
 * Renders the ineligible gef page
 *
 * @async
 * @function ineligibleGef
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Renders the ineligible gef page
 */
const ineligibleGef = async (req, res) => res.render('partials/ineligible-gef.njk');

module.exports = ineligibleGef;
