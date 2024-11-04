import {
  PORTAL_USER_ROLES as USER_ROLES,
  PORTAL_USER_SIGN_IN_TOKENS as SIGN_IN_TOKENS,
  DEAL_TYPE,
  DEAL_STATUS,
  SUBMISSION_TYPE,
  FACILITY_TYPE,
  FACILITY_STAGE,
} from '../../../e2e-fixtures';

const SECTION_STATUS = {
  NOT_STARTED: 'Not started',
  COMPLETED: 'Completed',
  INCOMPLETE: 'Incomplete',
};

const INDUSTRY_SECTOR_CODES = {
  INFORMATION: '1009',
  BUSINESS: '62012',
};

const DB_COLLECTIONS = {
  UTILISATION_REPORTS: 'utilisationReports',
};

/**
 * For use with date-fns format method.
 *
 * e.g. '1st February 2024'
 *
 * {@link https://date-fns.org/v3.3.1/docs/format}
 */
const LONG_FORM_DATE_FORMAT = 'do MMMM yyyy';

export default {
  DEALS: {
    DEAL_TYPE,
    DEAL_STATUS,
    SUBMISSION_TYPE,
    SECTION_STATUS,
  },
  FACILITY: {
    FACILITY_TYPE,
    FACILITY_STAGE,
  },
  INDUSTRY_SECTOR_CODES,
  USER_ROLES,
  SIGN_IN_TOKENS,
  DB_COLLECTIONS,
  LONG_FORM_DATE_FORMAT,
};
