const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/case/amendments/_macros/amendment-future-effective-date-facility-bar.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  describe('when a future effective date amendment exists', () => {
    it('should render the banner', () => {
      const params = {
        futureEffectiveDatePortalAmendment: {
          ukefFacilityId: '10000013',
          referenceNumber: '10000013-001',
          effectiveDate: '25 September 2025',
        },
      };

      wrapper = render(params);

      wrapper
        .expectText('[data-cy="amendment--future-effective-date-facility-bar"]')
        .toRead(
          `Amendment ${params.futureEffectiveDatePortalAmendment.referenceNumber} is effective on ${params.futureEffectiveDatePortalAmendment.effectiveDate}.`,
        );
    });
  });

  describe('when a future effective date amendment does not exist', () => {
    it('should not render the banner', () => {
      const params = {
        futureEffectiveDatePortalAmendment: undefined,
      };

      wrapper = render(params);

      wrapper.expectText('[data-cy="amendment--future-effective-date-facility-bar"]').notToExist();
    });
  });
});
