const eligibleAutomaticCover = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;

  res.render('partials/eligible-automatic-cover.njk', {
    applicationId,
  });
};

module.exports = eligibleAutomaticCover;
