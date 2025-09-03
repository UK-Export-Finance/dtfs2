const { validationErrorHandler } = require('../../helpers');

exports.getSchemeType = (req, res) => {
  res.render('select-scheme.njk', {
    user: req.session.user,
  });
};

exports.postSchemeType = (req, res) => {
  const { scheme } = req.body;

  switch (scheme) {
    case 'bss':
      return res.redirect('/before-you-start');
    case 'gef':
      return res.redirect('/gef/mandatory-criteria');
    default:
      return res.render('select-scheme.njk', {
        errors: validationErrorHandler({
          errMsg: 'Select which scheme you want to apply for',
          errRef: 'scheme',
        }),
      });
  }
};
