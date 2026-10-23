const bankRoutes = require('./bank-routes');
const portalRoutes = require('./portal-routes');
const tfmRoutes = require('./tfm-routes');
const userRoutes = require('./user-routes');
const utilisationReportsRoutes = require('./utilisation-reports-routes');
const { swaggerRouter } = require('./swagger-routes.ts');

module.exports = {
  bankRoutes,
  portalRoutes,
  tfmRoutes,
  userRoutes,
  utilisationReportsRoutes,
  swaggerRouter,
};
