const { DB_COLLECTIONS } = require('./db-collections');
const DEALS = require('./deals');
const FACILITIES = require('./facilities');
const ROUTES = require('./routes');
const AMENDMENT = require('./amendments');
const PAYLOAD = require('./payloads');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('./utilisation-report-reconciliation-status');
const { UTILISATION_REPORT_HEADERS } = require('./utilisation-report-headers');
const { CURRENCIES } = require('./currencies');

module.exports = {
  DB_COLLECTIONS,
  DEALS,
  FACILITIES,
  ROUTES,
  AMENDMENT,
  PAYLOAD,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UTILISATION_REPORT_HEADERS,
  CURRENCIES,
};
