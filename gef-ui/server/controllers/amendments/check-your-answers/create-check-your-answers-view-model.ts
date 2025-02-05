import { PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { getAmendmentsUrl, getPreviousPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { CheckYourAnswersViewModel } from '../../../types/view-models/amendments/check-your-answers-view-model';
import { Facility } from '../../../types/facility';
import { Deal } from '../../../types/deal';
import { mapAmendmentToAmendmentSummaryListParams } from '../helpers/map-amendment-to-amendment-summary-view-model';

export const createCheckYourAnswersViewModel = ({
  amendment,
  facility,
  deal,
}: {
  amendment: PortalFacilityAmendmentWithUkefId;
  facility: Facility;
  deal: Deal;
}): CheckYourAnswersViewModel => ({
  exporterName: deal.exporter.companyName,
  facilityType: facility.type,
  cancelUrl: getAmendmentsUrl({ ...amendment, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
  previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.CHECK_YOUR_ANSWERS, amendment),
  amendmentSummaryListParams: mapAmendmentToAmendmentSummaryListParams(amendment),
});
