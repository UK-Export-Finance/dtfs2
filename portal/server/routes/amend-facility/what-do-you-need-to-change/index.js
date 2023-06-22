const whatDoYouNeedToChange = async (req, res, next) => {
  try {
    return res.render('amend-facility/what-do-you-need-to-change.njk', {});
  } catch (err) {
    console.error('Error rendering what do you need to change template: ', { err });
    return next(err);
  }
};

module.exports = {
  whatDoYouNeedToChange,
};
