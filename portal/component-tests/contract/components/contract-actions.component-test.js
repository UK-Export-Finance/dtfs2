const {
  ROLES: { MAKER, CHECKER },
} = require('@ukef/dtfs2-common');
const { NON_MAKER_OR_CHECKER_ROLES } = require('../../../test-helpers/common-role-lists');

const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/contract-actions.njk';
const render = componentRenderer(component);

describe(component, () => {
  const draftAndFurtherInputRequiredDeals = [
    { _id: 1, status: 'Draft', submissionType: 'Draft submission' },
    { _id: 2, status: "Further Maker's input required", submissionType: "Further Maker's input required submission" },
  ];

  const readyForCheckerApprovalDeals = [{ _id: 3, status: "Ready for Checker's approval", submissionType: "Ready for Checker's approval submission" }];

  const otherDeals = [
    { _id: 4, status: 'Rejected by UKEF', submissionType: 'Rejected by UKEF submission' },
    { _id: 5, status: 'Abandoned', submissionType: 'Abandoned submission' },
    { _id: 6, status: 'Acknowledged', submissionType: 'Acknowledged submission' },
    {
      _id: 7,
      status: 'Accepted by UKEF (without conditions)',
      submissionType: 'Accepted by UKEF (without conditions) submission',
    },
    {
      _id: 8,
      status: 'Accepted by UKEF (with conditions)',
      submissionType: 'Accepted by UKEF (with conditions) submission',
    },
    { _id: 9, status: 'Submitted', submissionType: 'Submitted submission' },
    { _id: 10, status: 'In progress by UKEF', submissionType: 'In progress by UKEF submission' },
  ];

  describe('when viewed by a maker', () => {
    const user = { roles: [MAKER] };

    describe('When isEveryDealFormComplete is true', () => {
      const isEveryDealFormComplete = true;

      it('should render proceed to submit link', () => {
        for (const deal of draftAndFurtherInputRequiredDeals) {
          const wrapper = render({ user, isEveryDealFormComplete, deal });
          wrapper.expectText('[data-cy="canProceed"]').toRead(`You may now proceed to submit an ${deal.submissionType}.`);
        }
      });

      it('should be disabled for deals in all other states', () => {
        for (const deal of [...readyForCheckerApprovalDeals, ...otherDeals]) {
          const wrapper = render({ user, isEveryDealFormComplete, deal });
          wrapper.expectText('[data-cy="canProceed"]').notToExist();
        }
      });
    });

    describe('When isEveryDealFormComplete is false', () => {
      const isEveryDealFormComplete = false;

      it('should render please complete all form sections', () => {
        for (const deal of [...draftAndFurtherInputRequiredDeals]) {
          const wrapper = render({ user, isEveryDealFormComplete, deal });
          wrapper.expectText('[data-cy="canProceed"]').toRead('Please complete all form sections in order to submit your Supply Contract.');
        }
      });
    });
  });

  describe('when viewed by a checker', () => {
    const user = { roles: [CHECKER] };

    describe('When isEveryDealFormComplete is true', () => {
      const isEveryDealFormComplete = true;

      it('should render proceed to submit link', () => {
        for (const deal of readyForCheckerApprovalDeals) {
          const wrapper = render({ user, isEveryDealFormComplete, deal });
          wrapper.expectText('[data-cy="canProceed"]').toRead(`You may now proceed to submit an ${deal.submissionType}.`);
        }
      });

      it('should be disabled for deals in all other states', () => {
        for (const deal of [...draftAndFurtherInputRequiredDeals, ...otherDeals]) {
          const wrapper = render({ user, isEveryDealFormComplete, deal });
          wrapper.expectText('[data-cy="canProceed"]').notToExist();
        }
      });
    });

    describe('When isEveryDealFormComplete is false', () => {
      const isEveryDealFormComplete = false;

      it('should be disabled for deals in any state', () => {
        for (const deal of [...readyForCheckerApprovalDeals, ...draftAndFurtherInputRequiredDeals, ...otherDeals]) {
          const wrapper = render({ user, isEveryDealFormComplete, deal });
          wrapper.expectText('[data-cy="canProceed"]').notToExist();
        }
      });
    });
  });

  describe.each(NON_MAKER_OR_CHECKER_ROLES)('when viewed with the role %s', (otherRole) => {
    const user = { roles: otherRole };
    describe.each([true, false])('when isEveryDealFormComplete is %s', (isEveryDealFormComplete) => {
      it('should be disabled for deals in any state', () => {
        for (const deal of [...readyForCheckerApprovalDeals, ...draftAndFurtherInputRequiredDeals, ...otherDeals]) {
          const wrapper = render({ user, isEveryDealFormComplete, deal });
          wrapper.expectText('[data-cy="canProceed"]').notToExist();
        }
      });
    });
  });
});
