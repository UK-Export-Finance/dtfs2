import pageRenderer from '../../pageRenderer';

const page = 'partials/amendments/application-amendments.njk';
const render = pageRenderer(page);

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

describe(page, () => {
  const applicationAmendmentsOnDeal = {
    referenceNumber: '001234538-001',
    dealId,
    facilityId,
    amendmentId,
    effectiveDate: '25/07/2025',
    hasFutureEffectiveDate: true,
    type: 'PORTAL',
    amendmentRows: [
      {
        key: {
          text: 'Facility ID',
        },
        value: {
          text: '001238765',
        },
      },
      {
        key: {
          text: 'Facility type',
        },
        value: {
          text: 'Cash facility 1',
        },
      },
    ],
  };

  const params = {
    applicationAmendmentsOnDeal,
  };

  it('should render the tab with heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="tab-heading"]').toContain('Amendments');
  });

  it("should render tab with no amendments if doesn't exist any amendments", () => {
    params.applicationAmendmentsOnDeal.amendmentRows = [];
    const wrapper = render(params);

    wrapper.expectText('[data-cy="no-amendments"]').toContain('There are no amendments to display.');
  });
});
