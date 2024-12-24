import statusBanner from '../../../e2e/pages/application-status-banner';
import applicationDetails from '../../../e2e/pages/application-details';
import { today } from '../../../../../e2e-fixtures/dateConstants';
import { submitButton } from '../../../e2e/partials';

/**
 * checkClonedDealBannerAndDeal
 * checks the banner and the deal fields on a gef deal which has been cloned
 * @param {String} dealName - name of the gef cloned deal
 * @param {String} facilityStatus - status of the facility section on the deal
 */
const checkClonedDealBannerAndDeal = (dealName, facilityStatus) => {
  statusBanner.bannerStatus().contains('Draft');
  statusBanner.bannerCheckedBy().contains('-');
  statusBanner.bannerUkefDealId().should('not.exist');
  statusBanner.bannerDateCreated().contains(today.dd_MMM_yyyy);

  applicationDetails.bankRefName().contains(dealName);
  applicationDetails.automaticCoverStatus().contains('Not started');
  applicationDetails.facilityStatus().contains(facilityStatus);
  applicationDetails.exporterStatus().contains('Completed');
  submitButton().should('not.exist');
};

export default checkClonedDealBannerAndDeal;
