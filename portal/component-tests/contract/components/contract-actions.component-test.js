const { MAKER, CHECKER, ADMIN, READ_ONLY } = require('../../../server/constants/roles');

const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/contract-actions.njk';
const render = componentRenderer(component);

describe(component, () => {
  const otherRoles = [READ_ONLY, ADMIN];

  const draftAndFurtherInputRequiredDeals = [
    { _id: 1, status: 'Draft', submissionType: 'Draft submission' },
    { _id: 2, status: "Further Maker's input required", submissionType: "Further Maker's input required submission" },
  ];

  const readyForCheckerApprovalDeals = [{ _id: 3, status: "Ready for Checker's approval", submissionType: "Ready for Checker's approval submission" }];

  const otherDeals = [
    { _id: 4, status: 'Rejected by UKEF', submissionType: 'Rejected by UKEF submission' },
    { _id: 5, status: 'Abandoned', submissionType: 'Abandoned submission' },
    { _id: 6, status: 'Acknowledged', submissionType: 'Acknowledged submission' },
    { _id: 7, status: 'Accepted by UKEF (without conditions)', submissionType: 'Accepted by UKEF (without conditions) submission' },
    { _id: 8, status: 'Accepted by UKEF (with conditions)', submissionType: 'Accepted by UKEF (with conditions) submission' },
    { _id: 9, status: 'Rejected by UKEF', submissionType: 'Rejected by UKEF submission' },
    { _id: 10, status: 'Submitted', submissionType: 'Submitted submission' },
    { _id: 11, status: 'In progress by UKEF', submissionType: 'In progress by UKEF submission' },
  ];

  function makerRoleTests() {
    const user = { roles: [MAKER] };

    describe('When dealFormsCompleted is true', () => {
      const dealFormsCompleted = true;

      it('should render proceed to submit link', () => {
        for (const deal of draftAndFurtherInputRequiredDeals) {
          const wrapper = render({ user, dealFormsCompleted, deal });
          wrapper.expectText('[data-cy="canProceed"]').toRead(`You may now proceed to submit an ${deal.submissionType}.`);
        }
      });

      it('should be disabled for deals in all other states', () => {
        for (const deal of [...readyForCheckerApprovalDeals, ...otherDeals]) {
          const wrapper = render({ user, dealFormsCompleted, deal });
          wrapper.expectText('[data-cy="canProceed"]').notToExist();
        }
      });
    });

    describe('When dealFormsCompleted is false', () => {
      const dealFormsCompleted = false;

      it('should render please complete all form sections', () => {
        for (const deal of draftAndFurtherInputRequiredDeals) {
          const wrapper = render({ user, dealFormsCompleted, deal });
          wrapper.expectText('[data-cy="canProceed"]').toRead('Please complete all form sections in order to submit your Supply Contract.');
        }
      });

      it('should be disabled for deals in all other states', () => {
        for (const deal of [...readyForCheckerApprovalDeals, ...otherDeals]) {
          const wrapper = render({ user, dealFormsCompleted, deal });
          wrapper.expectText('[data-cy="canProceed"]').notToExist();
        }
      });
    });
  }
  
  function checkerRoleTests() {
    const user = { roles: [CHECKER] };

    describe('When dealFormsCompleted is true', () => {
      const dealFormsCompleted = true;

      it('should render proceed to submit link', () => {
        for (const deal of readyForCheckerApprovalDeals) {
          const wrapper = render({ user, dealFormsCompleted, deal });
          wrapper.expectText('[data-cy="canProceed"]').toRead(`You may now proceed to submit an ${deal.submissionType}.`);
        }
      });

      it('should be disabled for deals in all other states', () => {
        for (const deal of [...draftAndFurtherInputRequiredDeals, ...otherDeals]) {
          const wrapper = render({ user, dealFormsCompleted, deal });
          wrapper.expectText('[data-cy="canProceed"]').notToExist();
        }
      });
    });

    describe('When dealFormsCompleted is false', () => {
      const dealFormsCompleted = false;

      it('should be disabled for deals in any state', () => {
        for (const deal of [...readyForCheckerApprovalDeals, ...draftAndFurtherInputRequiredDeals, ...otherDeals]) {
          const wrapper = render({ user, dealFormsCompleted, deal });
          wrapper.expectText('[data-cy="canProceed"]').notToExist();
        }
      });
    });
  }
  
  function otherRoleTests(otherRole) {
    const user = { roles: otherRole };
    describe.each([true, false])('when dealFormsCompleted is %s', (dealFormsCompleted) => {
      it('should be disabled for deals in any state', () => {
        for (const deal of [...readyForCheckerApprovalDeals, ...draftAndFurtherInputRequiredDeals, ...otherDeals]) {
          const wrapper = render({ user, dealFormsCompleted, deal });
          wrapper.expectText('[data-cy="canProceed"]').notToExist();
        }
      });
    });
  }

  describe('when viewed by a maker', () => {
    makerRoleTests();
  });

  describe('when viewed by a checker', () => {
    checkerRoleTests();
  });

  describe.each(otherRoles)('when viewed with the role %s', (otherRole) => {
    otherRoleTests(otherRole);
  });
});
