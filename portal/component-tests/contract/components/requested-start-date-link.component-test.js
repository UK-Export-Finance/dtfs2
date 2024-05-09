const {
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');

const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/requested-start-date-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  const facility = { _id: '5f3ab3f705e6630007dcfb22' };
  const facilityName = 'Loan';

  const deal = { _id: '5f3ab3f705e6630007dcfb20' };

  describe('when viewed as a maker', () => {
    const user = { roles: [MAKER] };

    describe('when hasConfirmedCoverStartDate is true', () => {
      const hasConfirmedCoverStartDate = true;

      it('should render a link and "Start date confirmed"', () => {
        const wrapper = render({
          user,
          deal,
          facility,
          facilityName,
          hasConfirmedCoverStartDate,
        });

        wrapper
          .expectLink(`[data-cy="${facilityName}-change-or-confirm-cover-start-date-${facility._id}"]`)
          .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/confirm-requested-cover-start-date`, 'Start date confirmed');
      });
    });

    describe('when hasNotConfirmedCoverStartDate is false', () => {
      const hasConfirmedCoverStartDate = false;
      it('should render a link and "Confirm start date"', () => {
        const wrapper = render({
          user,
          deal,
          facility,
          facilityName,
          hasConfirmedCoverStartDate,
        });

        wrapper
          .expectLink(`[data-cy="${facilityName}-change-or-confirm-cover-start-date-${facility._id}"]`)
          .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/confirm-requested-cover-start-date`, 'Confirm start date');
      });
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed with the role %s', (nonMakerRole) => {
    const user = { roles: [nonMakerRole] };

    describe('when hasConfirmedCoverStartDate is true', () => {
      const hasConfirmedCoverStartDate = true;

      it('should render no link and "Start date confirmed"', () => {
        const wrapper = render({
          user,
          deal,
          facility,
          facilityName,
          hasConfirmedCoverStartDate,
        });

        wrapper.expectText(`[data-cy="${facilityName}-change-or-confirm-cover-start-date-${facility._id}"]`).toRead('Start date confirmed');
      });
    });

    describe('when hasNotConfirmedCoverStartDate is false', () => {
      const hasConfirmedCoverStartDate = false;

      it('should render no link and "Start date not confirmed"', () => {
        const wrapper = render({
          user,
          deal,
          facility,
          facilityName,
          hasConfirmedCoverStartDate,
        });

        wrapper.expectText(`[data-cy="${facilityName}-change-or-confirm-cover-start-date-${facility._id}"]`).toRead('Start date not confirmed');
      });
    });
  });
});
