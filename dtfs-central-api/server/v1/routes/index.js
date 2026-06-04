const bankRoutes = require('./bank-routes');
const portalBankListRoutes = require('./portal-bank-list-routes');
const portalRoutes = require('./portal-routes');
const tfmRoutes = require('./tfm-routes');
const userRoutes = require('./user-routes');
const utilisationReportsRoutes = require('./utilisation-reports-routes');
// Since import from TS file
const swaggerRoutes = require('./swagger-routes.ts').default;

module.exports = {
  bankRoutes,
  portalBankListRoutes,
  portalRoutes,
  tfmRoutes,
  userRoutes,
  utilisationReportsRoutes,
  swaggerRoutes,
};
