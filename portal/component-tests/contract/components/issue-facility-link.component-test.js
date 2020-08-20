const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/issue-facility-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  const mockDeals = [
    {
      _id: 1,
      details: {
        status: 'Acknowledged by UKEF',
        submissionType: 'Automatic Inclusion Notice',
      },
    },
    {
      _id: 2,
      details: {
        status: 'Ready for Checker\'s approval',
        submissionType: 'Manual Inclusion Notice',
      },
    },
    {
      _id: 3,
      details: {
        status: 'Accepted by UKEF (with conditions)',
        submissionType: 'Automatic Inclusion Notice',
      },
    },
    {
      _id: 4,
      details: {
        status: 'Accepted by UKEF (without conditions)',
        submissionType: 'Manual Inclusion Notice',
      },
    },
    {
      _id: 5,
      details: {
        status: 'Further Maker\'s input required',
        submissionType: 'Manual Inclusion Notice',
      },
    },
    {
      _id: 6,
      details: {
        status: 'Submitted',
        submissionType: 'Manual Inclusion Notice',
      },
    },
    {
      _id: 7,
      details: {
        status: 'Accepted by UKEF (with conditions)',
        submissionType: 'Manual Inclusion Application',
      },
    },
    {
      _id: 8,
      details: {
        status: 'Accepted by UKEF (without conditions)',
        submissionType: 'Manual Inclusion Application',
      },
    },
  ];

  describe('when deal status and submission type allows the issue facility', () => {
    const facilityName = 'loan';
    const deals = mockDeals;

    describe('when viewed by checker and facility.issueFacilityDetailsProvided', () => {
      it('should render a link to the facility on submision-details page', () => {
        const user = { roles: ['checker'] };
        const facility = {
          _id: '1234',
          facilityStage: 'Conditional',
          issueFacilityDetailsProvided: true,
        };

        for (const deal of deals) {
          const wrapper = render({ user, deal, facility, facilityName });
          wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/submission-details#${facilityName}-${facility._id}`, 'Facility issued');
        }
      });
    });

    describe('when viewed by `maker and checker` role and facility.issueFacilityDetailsProvided', () => {
      it('should render link to issue facility page', () => {
        const user = { roles: ['checker', 'maker'] };
        const facility = {
          _id: '1234',
          facilityStage: 'Conditional',
          issueFacilityDetailsProvided: true,
        };

        for (const deal of deals) {
          const wrapper = render({ user, deal, facility, facilityName });
          wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/issue-facility`, 'Issue facility');
        }
      });
    });

    describe('when viewed by maker', () => {
      const user = { roles: ['maker'] };

      describe('when facility.issueFacilityDetailsSubmitted and issueFacilityDetailsProvided is true', () => {
        it('should render link to facility preview page', () => {
          const facility = {
            _id: '1234',
            facilityStage: 'Conditional',
            issueFacilityDetailsSubmitted: true,
            issueFacilityDetailsProvided: true,
          };

          for (const deal of deals) {
            const wrapper = render({ user, deal, facility, facilityName });
            wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
              .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/preview`, 'Facility issued');
          }
        });
      });

      describe('when facility.issueFacilityDetailsSubmitted is false and issueFacilityDetailsProvided, issueFacilityDetailsStarted is true', () => {
        it('should render link to issue facility page', () => {
          const facility = {
            _id: '1234',
            facilityStage: 'Conditional',
            issueFacilityDetailsSubmitted: false,
            issueFacilityDetailsProvided: true,
            issueFacilityDetailsStarted: true,
          };

          for (const deal of deals) {
            const wrapper = render({ user, deal, facility, facilityName });
            wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
              .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/issue-facility`, 'Facility issued');
          }
        });
      });

      describe('when facility.issueFacilityDetailsSubmitted and issueFacilityDetailsStarted is false', () => {
        it('should render link to issue facility page with `Issue facility` text', () => {
          const facility = {
            _id: '1234',
            facilityStage: 'Conditional',
            issueFacilityDetailsSubmitted: false,
            issueFacilityDetailsStarted: false,
          };

          for (const deal of deals) {
            const wrapper = render({ user, deal, facility, facilityName });
            wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
              .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/issue-facility`, 'Issue facility');
          }
        });
      });
    });
  });

  describe('when deal status is NOT `Acknowledged by UKEF` or `Ready for Checker\'s approval', () => {
    const facilityName = 'loan';
    const deals = [
      {
        _id: 1,
        details: {
          status: 'Some other status',
        },
      },
      {
        _id: 2,
        details: {
          status: 'Test status',
        },
      },
    ];
    const facility = { _id: '1234' };

    it('should not render at all', () => {
      const user = { roles: ['maker', 'checker'] };
      for (const deal of deals) {
        const wrapper = render({ user, deal, facility, facilityName });
        wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
          .notToExist();
      }
    });

    describe('with params.editable', () => {
      it('should render delete link', () => {
        const user = { roles: ['maker', 'checker'] };
        const editable = true;

        for (const deal of deals) {
          const wrapper = render({ user, deal, facility, facilityName, editable });
          wrapper.expectLink(`[data-cy="${facilityName}-delete-${facility._id}"]`)
            .toLinkTo(`/contract/${deal._id}/${facilityName}/${facility._id}/delete`, 'Delete');
        }
      });
    });
  });

  describe('when deal previousStatus is `Draft`', () => {
    it('should not render at all', () => {
      const facilityName = 'loan';
      const dealsWithPreviousStatus = mockDeals;
      dealsWithPreviousStatus.map((deal) => {
        const d = deal;
        d.details.previousStatus = 'Draft';
        return d;
      });

      const facility = { _id: '1234' };

      const user = { roles: ['maker'] };
      for (const deal of dealsWithPreviousStatus) {
        const wrapper = render({ user, deal, facility, facilityName });
        wrapper.expectLink(`[data-cy="${facilityName}-issue-facility-${facility._id}"]`)
          .notToExist();
      }
    });
  });
});
