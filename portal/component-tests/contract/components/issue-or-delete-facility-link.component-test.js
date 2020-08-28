const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/issue-or-delete-facility-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  describe('when viewed a maker', () => {

    describe('with facility.canIssueOrEditIssueFacility', () => {
      const user = { roles: ['maker'] };
      const deal = { _id: '1234' };
      const facility = {
        _id: '5678',
        canIssueOrEditIssueFacility: true,
      };
      const facilityName = 'loan';

      it('should render a link to issue facility page', () => {
        const wrapper = render({ user, deal, facility, facilityName });
        wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
          .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/issue-facility`, 'Issue facility');
      });

      describe('with facility.issueFacilityDetailsStarted', () => {
        it('should render a link to issue facility page with `Facility issued` text', () => {
          facility.issueFacilityDetailsStarted = true;
          const wrapper = render({ user, deal, facility, facilityName });
          wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/issue-facility`, 'Facility issued');
        });
      });
    });

    describe('when facility or deal status is Submitted/Ready for check/Acknowledged/Ready for Checker\'s approval and facility.issueFacilityDetailsProvided', () => {
      it('should render a link to submission details page with facility anchor', () => {
        const user = { roles: ['maker'] };
        const mockFacility = {
          _id: '5678',
          issueFacilityDetailsProvided: true,
        };
        const facilityName = 'loan';

        const deals = [
          { _id: '1', details: { status: 'Ready for Checker\'s approval' }},
        ];

        deals.forEach((deal) => {
          const wrapper = render({ user, deal, facility: mockFacility, facilityName });
          wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${mockFacility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/submission-details#${facilityName}-${mockFacility._id}`, 'Facility issued');
        });

        const facilities = [
          { _id: '1', status: 'Submitted', issueFacilityDetailsProvided: true },
          { _id: '2', status: 'Ready for check', issueFacilityDetailsProvided: true },
          { _id: '3', status: 'Acknowledged', issueFacilityDetailsProvided: true },
        ];

        const deal = { _id: '1234' };

        facilities.forEach((facility) => {
          const wrapper = render({ user, deal, facility, facilityName });
          wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/submission-details#${facilityName}-${facility._id}`, 'Facility issued');
        });
      });
    });

    describe('when deal has not been submitted, is editable, and has `Draft` or `Further Maker\'s input required` status', () => {
      it('should render a link to delete', () => {
        const user = { roles: ['maker'] };
        const facility = { _id: '5678' };
        const facilityName = 'loan';

        const deals = [
          { _id: '1', details: { status: 'Draft' } },
          { _id: '2', details: { status: 'Further Maker\'s input required' } },
        ];

        deals.forEach((deal) => {
          const wrapper = render({ user, deal, facility, facilityName, editable: true });
          wrapper.expectLink(`[data-cy="${facilityName}-delete-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/delete`, 'Delete');
        });
      });
    });
  });
});
