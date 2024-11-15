const ineligibleAutomaticCover = async (req, res) => {
  const { params } = req;
  const { dealId } = params;

  res.render('_partials/ineligible-automatic-cover.njk', {
    dealId,
  });
};

module.exports = ineligibleAutomaticCover;
