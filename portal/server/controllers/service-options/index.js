const { getUserRoles } = require('../../helpers');

const getServiceOptions = async (req, res) => {
  const { user } = req.session;
  try {
    const { isMaker, isChecker, isPaymentOfficer, isAdmin, isReadOnly } = getUserRoles(user.roles);
    return res.render('service-options/service-options.njk', {
      user,
      canAccessPortal: isMaker || isChecker || isAdmin || isReadOnly,
      canAccessUtilisationReports: isPaymentOfficer,
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user });
  }
};

module.exports = {
  getServiceOptions,
};
