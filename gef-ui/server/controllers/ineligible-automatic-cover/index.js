const ineligibleAutomaticCover = (req, res) => {
  const { params } = req;
  const { dealId } = params;

  res.render('partials/ineligible-automatic-cover.njk', {
    dealId,
  });
};

module.exports = ineligibleAutomaticCover;
