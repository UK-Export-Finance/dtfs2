/**
 * Controller to render the eligible automatic cover.
 *
 * @async
 * @function ineligibleAutomaticCover
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Renders the eligible-automatic-cover template
 */
const eligibleAutomaticCover = async (req, res) => {
  const { params } = req;
  const { dealId } = params;

  res.render('partials/eligible-automatic-cover.njk', {
    dealId,
  });
};

module.exports = eligibleAutomaticCover;
