const whatDoYouNeedToChange = async (req, res, next) => {
  try {
    return res.render('partials/amend-facility/what-do-you-need-to-change.njk', {});
  } catch (err) {
    console.error('Error rending what do you need to change template: ', { err });
    return next(err);
  }
};

module.exports = {
  whatDoYouNeedToChange,
};
