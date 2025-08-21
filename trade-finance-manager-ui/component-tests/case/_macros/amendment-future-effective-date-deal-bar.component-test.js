const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/case/amendments/_macros/amendment-future-effective-date-deal-bar.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  const ukefFacilityId = '10000013';
  const referenceNumber = '10000013-001';
  const effectiveDate = '25 September 2025';
  const href = '/case/10000013/facility/10000013#amendments';

  const ukefFacilityId1 = '10000014';
  const referenceNumber1 = '10000014-001';
  const effectiveDate1 = '26 September 2025';
  const href1 = '/case/10000014/facility/10000014#amendments';

  describe('when a future effective date amendment exists', () => {
    describe('when only one amendment exists', () => {
      const params = {
        hasFutureEffectiveDatePortalAmendments: true,
        formattedFutureEffectiveDatePortalAmendments: [
          {
            ukefFacilityId,
            referenceNumber,
            effectiveDate,
            href,
          },
        ],
      };

      it('should render the banner', () => {
        wrapper = render(params);

        wrapper
          .expectText(`[data-cy="amendment--future-effective-date-deal-bar-${ukefFacilityId}"]`)
          .toRead(`There is an amendment (${referenceNumber}) on Facility ID ${ukefFacilityId} effective on ${effectiveDate}. See amendment details`);
      });

      it('should render the link', () => {
        wrapper = render(params);

        wrapper.expectLink(`[data-cy="amendment--future-effective-date-deal-link-${ukefFacilityId}"]`).toLinkTo(href, 'See amendment details');
      });
    });

    describe('when 2 amendments exist', () => {
      const params = {
        hasFutureEffectiveDatePortalAmendments: true,
        formattedFutureEffectiveDatePortalAmendments: [
          {
            ukefFacilityId,
            referenceNumber,
            effectiveDate,
            href,
          },
          {
            ukefFacilityId: ukefFacilityId1,
            referenceNumber: referenceNumber1,
            effectiveDate: effectiveDate1,
            href: href1,
          },
        ],
      };

      it('should render multiple banners', () => {
        wrapper = render(params);

        wrapper
          .expectText(`[data-cy="amendment--future-effective-date-deal-bar-${ukefFacilityId}"]`)
          .toRead(`There is an amendment (${referenceNumber}) on Facility ID ${ukefFacilityId} effective on ${effectiveDate}. See amendment details`);

        wrapper
          .expectText(`[data-cy="amendment--future-effective-date-deal-bar-${ukefFacilityId1}"]`)
          .toRead(`There is an amendment (${referenceNumber1}) on Facility ID ${ukefFacilityId1} effective on ${effectiveDate1}. See amendment details`);
      });

      it('should render multiple links', () => {
        wrapper = render(params);

        wrapper.expectLink(`[data-cy="amendment--future-effective-date-deal-link-${ukefFacilityId}"]`).toLinkTo(href, 'See amendment details');

        wrapper.expectLink(`[data-cy="amendment--future-effective-date-deal-link-${ukefFacilityId1}"]`).toLinkTo(href1, 'See amendment details');
      });
    });
  });

  describe('when a future effective date amendment does not exist', () => {
    const params = {
      hasFutureEffectiveDatePortalAmendments: false,
      formattedFutureEffectiveDatePortalAmendments: [],
    };

    it('should not render the banner', () => {
      wrapper = render(params);

      wrapper.expectText(`[data-cy="amendment--future-effective-date-deal-bar-${ukefFacilityId}"]`).notToExist();
    });

    it('should not render the link', () => {
      wrapper = render(params);

      wrapper.expectLink(`[data-cy="amendment--future-effective-date-deal-link-${ukefFacilityId}"]`).notToExist();
    });
  });
});
