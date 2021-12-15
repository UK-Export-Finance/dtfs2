const api = require('../../services/api');

exports.validateUser = async (req, res, next) => {
  const { dealId } = req.params;
  console.log('reqqqqqqqqqqq ', req);
  const payload = {
    userId: req.session.user._id,
    bankId: req.session.user.bank.id,
  };

  const validate = await api.validateUser(dealId, payload);
  console.log('we are validating', validate);
  //   return next();
  //   if (userToken && await api.validateToken(userToken)) {
  //     return next();
  //   }

//   return req.session.destroy(() => {
//     res.redirect('/');
//   });
};
