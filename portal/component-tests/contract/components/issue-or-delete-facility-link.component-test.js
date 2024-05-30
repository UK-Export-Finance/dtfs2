const {
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const componentRenderer = require('../../componentRenderer');
const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');

const component = 'contract/components/issue-or-delete-facility-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  const facilityName = 'Loan';

  describe('when viewed as a maker', () => {
    const user = { roles: [MAKER] };

    describe('with facility.canIssueOrEditIssueFacility', () => {
      const deal = { _id: '5f3ab3f705e6630007dcfb20' };
      const facility = {
        _id: '5f3ab3f705e6630007dcfb21',
        canIssueOrEditIssueFacility: true,
      };

      it('should render a link to issue facility page', () => {
        const wrapper = render({
          user,
          deal,
          facility,
          facilityName,
        });
        wrapper
          .expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
          .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/issue-facility`, 'Issue facility');
      });

      describe('with facility.issueFacilityDetailsStarted and facility.issueFacilityDetailsProvided', () => {
        it('should render a link to issue facility page with `Facility issued` text', () => {
          facility.issueFacilityDetailsStarted = true;
          facility.issueFacilityDetailsProvided = true;
          const wrapper = render({
            user,
            deal,
            facility,
            facilityName,
          });
          wrapper
            .expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/issue-facility`, 'Facility issued');
        });
      });
    });

    describe("when facility or deal status is Submitted/Ready for check/Acknowledged/Ready for Checker's approval", () => {
      describe('when facility.issueFacilityDetailsProvided', () => {
        const mockFacility = {
          _id: '5f3ab3f705e6630007dcfb22',
          issueFacilityDetailsProvided: true,
        };
        it('should render a link to submission details page with facility anchor', () => {
          const deals = [{ _id: '5f3ab3f705e6630007dcfb20', status: "Ready for Checker's approval" }];

          deals.forEach((deal) => {
            const wrapper = render({
              user,
              deal,
              facility: mockFacility,
              facilityName,
            });
            wrapper
              .expectLink(`[data-cy="${facilityName}-issue-facility-${mockFacility._id}"]`)
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
              user,
              deal,
              facility,
              facilityName,
            });
            wrapper
              .expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
              .toLinkTo(`/contract/${deal._id}/submission-details#${facilityName}-${facility._id}`, 'Facility issued');
          });
        });
      });

      describe('when facility.issueFacilityDetailsProvided is false', () => {
        const mockFacility = {
          _id: '5f3ab3f705e6630007dcfb22',
          issueFacilityDetailsProvided: false,
        };
        it('should NOT render any text', () => {
          const deals = [{ _id: '5f3ab3f705e6630007dcfb20', status: "Ready for Checker's approval" }];

          deals.forEach((deal) => {
            const wrapper = render({
              user,
              deal,
              facility: mockFacility,
              facilityName,
            });
            wrapper.expectText(`[data-cy="${facilityName}-issue-facility-${mockFacility._id}"]`).notToExist();
          });

          const facilities = [
            { _id: '5f3ab3f705e6630007dcfb24', status: 'Submitted', issueFacilityDetailsProvided: true },
            { _id: '5f3ab3f705e6630007dcfb25', status: 'Ready for check', issueFacilityDetailsProvided: true },
            { _id: '5f3ab3f705e6630007dcfb26', status: 'Acknowledged', issueFacilityDetailsProvided: true },
          ];

          const deal = { _id: '5f3ab3f705e6630007dcfb22' };

          facilities.forEach((facility) => {
            const wrapper = render({
              user,
              deal,
              facility,
              facilityName,
            });
            wrapper
              .expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
              .toLinkTo(`/contract/${deal._id}/submission-details#${facilityName}-${facility._id}`, 'Facility issued');
          });
        });
      });
    });

    describe("when deal has not been submitted, is editable, and has `Draft` or `Further Maker's input required` status", () => {
      it('should render a link to delete with text using Delete Name if name present', () => {
        const facility = { _id: '5f3ab3f705e6630007dcfb22', type: 'Loan', name: 'test name' };

        const facilityTableIndex = 1;

        const deals = [
          { _id: '5f3ab3f705e6630007dcfb21', status: 'Draft' },
          { _id: '5f3ab3f705e6630007dcfb22', status: "Further Maker's input required" },
        ];

        deals.forEach((deal) => {
          const wrapper = render({
            user,
            deal,
            facility,
            facilityName,
            facilityTableIndex,
            editable: true,
          });
          wrapper
            .expectLink(`[data-cy="${facilityName}-delete-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/delete`, `Delete ${facility.name}`);
          // add facility name / facility type tests
          wrapper.expectAriaLabel(`[data-cy="${facilityName}-delete-${facility._id}"]`).toEqual(`Delete ${facility.type} ${facility.name}`);
        });
      });

      it('should render a link to delete with text using Delete Type if name not present', () => {
        const facility = { _id: '5f3ab3f705e6630007dcfb22', type: 'Loan' };

        const facilityTableIndex = 1;

        const deals = [
          { _id: '5f3ab3f705e6630007dcfb21', status: 'Draft' },
          { _id: '5f3ab3f705e6630007dcfb22', status: "Further Maker's input required" },
        ];

        deals.forEach((deal) => {
          const wrapper = render({
            user,
            deal,
            facility,
            facilityName,
            facilityTableIndex,
            editable: true,
          });
          wrapper
            .expectLink(`[data-cy="${facilityName}-delete-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/delete`, `Delete ${facility.type.toLowerCase()}`);
          // add facility name / facility type tests
          wrapper.expectAriaLabel(`[data-cy="${facilityName}-delete-${facility._id}"]`).toEqual(`Delete ${facility.type} ${facilityTableIndex}`);
        });
      });
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed as %s', (nonMakerRole) => {
    const user = { roles: [nonMakerRole] };

    describe('with facility.canIssueOrEditIssueFacility', () => {
      const deal = { _id: '5f3ab3f705e6630007dcfb20' };
      const facility = {
        _id: '5f3ab3f705e6630007dcfb21',
        canIssueOrEditIssueFacility: true,
      };

      it('should NOT render any text', () => {
        const wrapper = render({
          user,
          deal,
          facility,
          facilityName,
        });
        wrapper.expectText(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`).notToExist();
      });

      describe('with facility.issueFacilityDetailsStarted and facility.issueFacilityDetailsProvided', () => {
        it('should NOT render a link to issue facility page with `Facility issued` text', () => {
          facility.issueFacilityDetailsStarted = true;
          facility.issueFacilityDetailsProvided = true;
          const wrapper = render({
            user,
            deal,
            facility,
            facilityName,
          });
          wrapper
            .expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/submission-details#${facilityName}-${facility._id}`, 'Facility issued');
        });
      });
    });

    describe("when facility or deal status is Submitted/Ready for check/Acknowledged/Ready for Checker's approval and facility.issueFacilityDetailsProvided", () => {
      it('should render a link to submission details page with facility anchor', () => {
        const mockFacility = {
          _id: '5f3ab3f705e6630007dcfb22',
          issueFacilityDetailsProvided: true,
        };

        const deals = [{ _id: '5f3ab3f705e6630007dcfb20', status: "Ready for Checker's approval" }];

        deals.forEach((deal) => {
          const wrapper = render({
            user,
            deal,
            facility: mockFacility,
            facilityName,
          });
          wrapper
            .expectLink(`[data-cy="${facilityName}-issue-facility-${mockFacility._id}"]`)
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
            user,
            deal,
            facility,
            facilityName,
          });
          wrapper
            .expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/submission-details#${facilityName}-${facility._id}`, 'Facility issued');
        });
      });
    });

    describe("when deal has not been submitted, is editable, and has `Draft` or `Further Maker's input required` status", () => {
      it('should NOT render a link to delete', () => {
        const facility = { _id: '5f3ab3f705e6630007dcfb22', type: 'Loan' };

        const facilityTableIndex = 1;

        const deals = [
          { _id: '5f3ab3f705e6630007dcfb21', status: 'Draft' },
          { _id: '5f3ab3f705e6630007dcfb22', status: "Further Maker's input required" },
        ];

        deals.forEach((deal) => {
          const wrapper = render({
            user,
            deal,
            facility,
            facilityName,
            facilityTableIndex,
            editable: true,
          });
          wrapper.expectLink(`[data-cy="${facilityName}-delete-${facility._id}"]`).notToExist();
        });
      });
    });
  });
});
