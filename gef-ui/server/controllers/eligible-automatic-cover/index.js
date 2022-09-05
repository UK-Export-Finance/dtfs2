const eligibleAutomaticCover = (req, res) => {
  const { params } = req;
  const { dealId } = params;

  res.render('partials/eligible-automatic-cover.njk', {
    dealId,
  });
};

module.exports = eligibleAutomaticCover;
