const eligibleAutomaticCover = async (req, res) => {
  const { params } = req;
  const { dealId } = params;

  res.render('_partials/eligible-automatic-cover.njk', {
    dealId,
  });
};

module.exports = eligibleAutomaticCover;
