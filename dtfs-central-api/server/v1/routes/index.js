const bankRoutes = require('./bank-routes');
const portalRoutes = require('./portal-routes');
const tfmRoutes = require('./tfm-routes');
const userRoutes = require('./user-routes');
const utilisationReportsRoutes = require('./utilisation-reports-routes');
// Since import from TS file
const swaggerRoutes = require('./swagger-routes.ts').default;

module.exports = {
  bankRoutes,
  portalRoutes,
  tfmRoutes,
  userRoutes,
  utilisationReportsRoutes,
  swaggerRoutes,
};
