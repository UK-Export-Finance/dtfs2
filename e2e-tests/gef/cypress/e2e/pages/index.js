const { aboutExporter } = require('./about-exporter');
const { aboutFacility } = require('./about-facility');
const { aboutFacilityUnissued } = require('./unissued-facilities-about-facility');
const { applicationActivities } = require('./application-activities');
const { applicationDetails } = require('./application-details');
const { applicationAmendments } = require('./application-amendments');
const { applicationPreview } = require('./application-preview');
const { statusBanner } = require('./application-status-banner');
const { applicationSubmission } = require('./application-submission');
const { automaticCover } = require('./automatic-cover');
const { bankReviewDate } = require('./bank-review-date');
const { cloneDealPage } = require('./clone-deal');
const { companiesHouse } = require('./companies-house');
const { contact } = require('./contact');
const { coverStartDate } = require('./cover-start-date');
const { dashboardPage } = require('./dashboard-page');
const { enterExportersCorrAddress } = require('./enter-exporters-corr-address');
const { exportersAddress } = require('./exporters-address');
const { facilities } = require('./facilities');
const { facilityConfirmDeletion } = require('./facility-confirm-deletion');
const { facilityCurrency } = require('./facility-currency');
const { facilityEndDate } = require('./facility-end-date');
const { facilityGuarantee } = require('./facility-guarantee');
const { facilityValue } = require('./facility-value');
const { footer } = require('./footer');
const { header } = require('./header');
const { ineligibleAutomaticCover } = require('./ineligible-automatic-cover');
const { ineligibleGef } = require('./ineligible-gef');
const { landingPage } = require('./landingPage');
const { mandatoryCriteria } = require('./mandatory-criteria');
const { nameApplication } = require('./name-application');
const { providedFacility } = require('./provided-facility');
const { returnToMaker } = require('./return-to-maker');
const { securityDetails } = require('./security-details');
const { selectExportersCorrAddress } = require('./select-exporters-corr-address');
const { signInLink } = require('./login/sign-in-link');
const { submitToUkef } = require('./submit-to-ukef');
const { unissuedFacilityTable } = require('./unissued-facilities');

module.exports = {
  aboutExporter,
  aboutFacility,
  aboutFacilityUnissued,
  applicationActivities,
  applicationDetails,
  applicationAmendments,
  applicationPreview,
  applicationSubmission,
  automaticCover,
  bankReviewDate,
  cloneDealPage,
  companiesHouse,
  coverStartDate,
  dashboardPage,
  enterExportersCorrAddress,
  exportersAddress,
  facilities,
  facilityConfirmDeletion,
  facilityCurrency,
  facilityEndDate,
  facilityGuarantee,
  facilityValue,
  footer,
  header,
  ineligibleAutomaticCover,
  ineligibleGef,
  landingPage,
  mandatoryCriteria,
  nameApplication,
  providedFacility,
  returnToMaker,
  securityDetails,
  selectExportersCorrAddress,
  signInLink,
  statusBanner,
  submitToUkef,
  unissuedFacilityTable,
  contact,
};
