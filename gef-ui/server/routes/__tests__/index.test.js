import mandatoryCriteriaRoutes from '../mandatory-criteria';
import nameApplicationRoutes from '../name-application';
import eligibleAutomaticCoverRoutes from '../eligible-automatic-cover';
import automaticCoverRoutes from '../automatic-cover';
import applicationDetailsRoutes from '../application-details';
import applicationAbandonRoutes from '../application-abandon';
import applicationSubmissionRoutes from '../application-submission';
import submitToUkefRoutes from '../submit-to-ukef';
import reviewDecisionRoutes from '../review-decision';
import coverStartDateRoutes from '../cover-start-date';
import confirmCoverStartDateRoutes from '../confirm-cover-start-date';
import companiesHouseRoutes from '../companies-house';
import exportersAddressRoutes from '../exporters-address';
import enterExportersCorrespondenceAddressRoutes from '../enter-exporters-correspondence-address';
import selectExportersCorrespondenceAddressRoutes from '../select-exporters-correspondence-address';
import aboutExporter from '../about-exporter';
import facilities from '../facilities';
import aboutFacility from '../about-facility';
import providedFacility from '../provided-facility';
import facilityCurrency from '../facility-currency';
import facilityValue from '../facility-value';
import facilityGuarantee from '../facility-guarantee';
import facilityConfirmDeletion from '../facility-confirm-deletion';
import returnToMaker from '../return-to-maker';
import portalActivities from '../application-activities';
import downloadFiles from '../downloadFile';
import cloneGefDeal from '../clone-gef-deal';
import unissuedFacilities from '../unissued-facilities';
import securityDetails from '../security-details';

const useSpy = jest.fn();
jest.doMock('express', () => ({
  Router() {
    return {
      use: useSpy,
    };
  },
}));

describe('Routes', () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    require('../index');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup all routes', () => {
    expect(useSpy).toHaveBeenCalledWith(mandatoryCriteriaRoutes);
    expect(useSpy).toHaveBeenCalledWith(nameApplicationRoutes);
    expect(useSpy).toHaveBeenCalledWith(eligibleAutomaticCoverRoutes);
    expect(useSpy).toHaveBeenCalledWith(automaticCoverRoutes);
    expect(useSpy).toHaveBeenCalledWith(applicationDetailsRoutes);
    expect(useSpy).toHaveBeenCalledWith(applicationAbandonRoutes);
    expect(useSpy).toHaveBeenCalledWith(applicationSubmissionRoutes);
    expect(useSpy).toHaveBeenCalledWith(submitToUkefRoutes);
    expect(useSpy).toHaveBeenCalledWith(reviewDecisionRoutes);
    expect(useSpy).toHaveBeenCalledWith(coverStartDateRoutes);
    expect(useSpy).toHaveBeenCalledWith(confirmCoverStartDateRoutes);
    expect(useSpy).toHaveBeenCalledWith(companiesHouseRoutes);
    expect(useSpy).toHaveBeenCalledWith(exportersAddressRoutes);
    expect(useSpy).toHaveBeenCalledWith(enterExportersCorrespondenceAddressRoutes);
    expect(useSpy).toHaveBeenCalledWith(selectExportersCorrespondenceAddressRoutes);
    expect(useSpy).toHaveBeenCalledWith(aboutExporter);
    expect(useSpy).toHaveBeenCalledWith(facilities);
    expect(useSpy).toHaveBeenCalledWith(aboutFacility);
    expect(useSpy).toHaveBeenCalledWith(providedFacility);
    expect(useSpy).toHaveBeenCalledWith(facilityCurrency);
    expect(useSpy).toHaveBeenCalledWith(facilityValue);
    expect(useSpy).toHaveBeenCalledWith(facilityGuarantee);
    expect(useSpy).toHaveBeenCalledWith(facilityConfirmDeletion);
    expect(useSpy).toHaveBeenCalledWith(returnToMaker);
    expect(useSpy).toHaveBeenCalledWith(portalActivities);
    expect(useSpy).toHaveBeenCalledWith(downloadFiles);
    expect(useSpy).toHaveBeenCalledWith(cloneGefDeal);
    expect(useSpy).toHaveBeenCalledWith(unissuedFacilities);
    expect(useSpy).toHaveBeenCalledWith(securityDetails);
  });
});
