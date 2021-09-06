const ineligibleAutomaticCover = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;

  res.render('partials/ineligible-automatic-cover.njk', {
    applicationId,
  });
};

module.exports = ineligibleAutomaticCover;
