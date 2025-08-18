const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/case/amendments/_macros/amendment-future-effective-date-facility-bar.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  describe('when a future effective date amendment exists and isOnAmendmentTab is not passed', () => {
    it('should render the facility banner', () => {
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

    it('should not render the amendment tab bar', () => {
      const params = {
        futureEffectiveDatePortalAmendment: {
          ukefFacilityId: '10000013',
          referenceNumber: '10000013-001',
          effectiveDate: '25 September 2025',
        },
      };

      wrapper = render(params);

      wrapper.expectText(`[data-cy="amendment--future-effective-date-amendment-bar"]`).notToExist();
    });
  });

  describe('when a future effective date amendment exists and isOnAmendmentTab is true', () => {
    it('should render the amendment banner', () => {
      const params = {
        futureEffectiveDatePortalAmendment: {
          ukefFacilityId: '10000013',
          referenceNumber: '10000013-001',
          effectiveDate: '25 September 2025',
        },
        isOnAmendmentTab: true,
      };

      wrapper = render(params);

      wrapper
        .expectText('[data-cy="amendment--future-effective-date-amendment-bar"]')
        .toRead(
          `Amendment ${params.futureEffectiveDatePortalAmendment.referenceNumber} is effective on ${params.futureEffectiveDatePortalAmendment.effectiveDate}.`,
        );
    });

    it('should not render the facility bar', () => {
      const params = {
        futureEffectiveDatePortalAmendment: {
          ukefFacilityId: '10000013',
          referenceNumber: '10000013-001',
          effectiveDate: '25 September 2025',
        },
        isOnAmendmentTab: true,
      };

      wrapper = render(params);

      wrapper.expectText(`[data-cy="amendment--future-effective-date-facility-bar"]`).notToExist();
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
