const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/issue-or-delete-facility-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe('when viewed a maker', () => {
    describe('with facility.canIssueOrEditIssueFacility', () => {
      const user = { roles: ['maker'] };
      const deal = { _id: '5f3ab3f705e6630007dcfb20' };
      const facility = {
        _id: '5f3ab3f705e6630007dcfb21',
        canIssueOrEditIssueFacility: true,
      };
      const facilityName = 'Loan';

      it('should render a link to issue facility page', () => {
        const wrapper = render({
          user, deal, facility, facilityName,
        });
        wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
          .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/issue-facility`, 'Issue facility');
      });

      describe('with facility.issueFacilityDetailsStarted and facility.issueFacilityDetailsProvided', () => {
        it('should render a link to issue facility page with `Facility issued` text', () => {
          facility.issueFacilityDetailsStarted = true;
          facility.issueFacilityDetailsProvided = true;
          const wrapper = render({
            user, deal, facility, facilityName,
          });
          wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/issue-facility`, 'Facility issued');
        });
      });
    });

    describe('when facility or deal status is Submitted/Ready for check/Acknowledged/Ready for Checker\'s approval and facility.issueFacilityDetailsProvided', () => {
      it('should render a link to submission details page with facility anchor', () => {
        const user = { roles: ['maker'] };
        const mockFacility = {
          _id: '5f3ab3f705e6630007dcfb22',
          issueFacilityDetailsProvided: true,
        };
        const facilityName = 'Loan';

        const deals = [
          { _id: '5f3ab3f705e6630007dcfb20', status: 'Ready for Checker\'s approval' },
        ];

        deals.forEach((deal) => {
          const wrapper = render({
            user, deal, facility: mockFacility, facilityName,
          });
          wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${mockFacility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/submission-details#${facilityName}-${mockFacility._id}`, 'Facility issued');
        });

        const facilities = [
          { _id: '5f3ab3f705e6630007dcfb24', status: 'Submitted', issueFacilityDetailsProvided: true },
          { _id: '5f3ab3f705e6630007dcfb25', status: 'Ready for check', issueFacilityDetailsProvided: true },
          { _id: '5f3ab3f705e6630007dcfb26', status: 'Acknowledged', issueFacilityDetailsProvided: true },
        ];

        const deal = { _id: '5f3ab3f705e6630007dcfb22' };

        facilities.forEach((facility) => {
          const wrapper = render({
            user, deal, facility, facilityName,
          });
          wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/submission-details#${facilityName}-${facility._id}`, 'Facility issued');
        });
      });
    });

    describe('when deal has not been submitted, is editable, and has `Draft` or `Further Maker\'s input required` status', () => {
      it('should render a link to delete', () => {
        const user = { roles: ['maker'] };
        const facility = { _id: '5f3ab3f705e6630007dcfb22' };
        const facilityName = 'Loan';
        const facilityTableIndex = 1;

        const deals = [
          { _id: '5f3ab3f705e6630007dcfb21', status: 'Draft' },
          { _id: '5f3ab3f705e6630007dcfb22', status: 'Further Maker\'s input required' },
        ];

        deals.forEach((deal) => {
          const wrapper = render({
            user, deal, facility, facilityName, facilityTableIndex, editable: true,
          });
          wrapper.expectLink(`[data-cy="${facilityName}-delete-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/delete`, 'Delete');

          wrapper.expectAriaLabel(`[data-cy="${facilityName}-delete-${facility._id}"]`)
            .toEqual(`Delete ${facilityName} ${facilityTableIndex}`);
        });
      });
    });
  });
});
