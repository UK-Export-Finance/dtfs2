const {
  DEAL_TYPE, DEAL_STATUS, SUBMISSION_TYPE: DEAL_SUBMISSION_TYPE, FACILITY_TYPE,
} = require('../../../e2e-fixtures/constants.fixture');

const DEAL_STAGE_TFM = {
  CONFIRMED: 'Confirmed',
  APPLICATION: 'Application',
  IN_PROGRESS_BY_UKEF: 'In progress',
  UKEF_APPROVED_WITH_CONDITIONS: 'Approved (with conditions)',
  UKEF_APPROVED_WITHOUT_CONDITIONS: 'Approved (without conditions)',
  DECLINED: 'Declined',
  ABANDONED: 'Abandoned',
  AMENDMENT_IN_PROGRESS: 'Amendment in progress',
};

const NOT_ADDED = {
  DASH: '-',
};

const PARTIES = {
  EXPORTER: 'exporter',
  BUYER: 'buyer',
  AGENT: 'agent',
  INDEMNIFIER: 'indemnifier',
  BOND_ISSUER: 'bond-issuer',
  BOND_BENEFICIARY: 'bond-beneficiary',
};

const PARTY_URN = {
  INVALID: '1234',
  VALID: '00307249',
  ANOTHER_VALID: '00307250',
};

const DISPLAY_USER_TEAMS = {
  PIM: 'Post issue management',
  UNDERWRITERS: 'Underwriters',
  RISK_MANAGERS: 'Risk managers',
  BUSINESS_SUPPORT: 'Business support group',
  UNDERWRITER_MANAGERS: 'Underwriter managers',
  UNDERWRITING_SUPPORT: 'Underwriting support',
  PDC_RECONCILE: 'PDC reconcile',
  PDC_READ: 'PDC read',
};

/**
 * Stores the alias keys which should be used to access
 * the values yielded from custom commands
 *
 * @example
 * // Custom cypress command which does something with the input and then yields a value
 * Cypress.Commands.add('insertAndYieldLength', (itemToInsert) => {
 *   cy.wrap(itemToInsert)
 *     .then((item) => {
 *       insertItem(item); // generic (external) function
 *     });
 *   cy.wrap(itemToInsert.length).as(ALIAS_KEY.INSERT_AND_YIELD_LENGTH);
 * });
 *
 * // Accessing the result of that command (in a test)
 * cy.insertAndYieldLength(itemToInsert);
 * cy.get(`@${ALIAS_KEY.INSERT_AND_YIELD_LENGTH}`)
 *   .then((length) => {
 *     // do something with length
 *   });
 *
 * @link https://docs.cypress.io/guides/core-concepts/variables-and-aliases#Aliases
 */
const ALIAS_KEY = {
  SUBMIT_MANY_DEALS: 'submittedDeals',
  SUBMIT_DEAL: 'submittedDeal',
};

module.exports = {
  DEAL_TYPE,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  FACILITY_TYPE,
  DEAL_STAGE_TFM,
  DISPLAY_USER_TEAMS,
  NOT_ADDED,
  PARTY_URN,
  PARTIES,
  ALIAS_KEY,
};
