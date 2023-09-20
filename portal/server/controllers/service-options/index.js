const { getUserRoles } = require('../../helpers');

const getServiceOptions = async (req, res) => {
  const { user } = req.session;
  try {
    const { isMaker, isChecker } = getUserRoles(user.roles);
    const isPaymentOfficer = true;
    return res.render('service-options/service-options.njk', {
      isMaker,
      isChecker,
      isPaymentOfficer,
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

module.exports = {
  getServiceOptions,
};
