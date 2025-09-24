/**
 * Controller to render the ineligible automatic cover.
 *
 * @async
 * @function ineligibleAutomaticCover
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Renders the ineligible-automatic-cover template
 */
const ineligibleAutomaticCover = async (req, res) => {
  const { params } = req;
  const { dealId } = params;

  res.render('partials/ineligible-automatic-cover.njk', {
    dealId,
  });
};

module.exports = ineligibleAutomaticCover;
