import { AssertionsWrapper } from '../assertionsWrapper.types';
import componentRenderer from '../componentRenderer';

const component = '../templates/_macros/amendments/amendment-summary-list.njk';
const render = componentRenderer(component);

const changeAmendmentDataCy = 'change-amendment-link';
const changeAmendmentHref = '/amendment';
const changeEligibilityDataCy = 'change-eligibility-link';
const changeEligibilityHref = '/eligibility';
const changeEffectiveDateDataCy = 'change-effective-date-link';
const changeEffectiveDateHref = '/effective-date';

describe(component, () => {
  let wrapper: AssertionsWrapper;

  beforeEach(() => {
    wrapper = render(getParams());
  });

  it('should render amendment summary list', () => {
    wrapper.expectElement('[data-cy="amendments-summary-list"]').toExist();
  });

  it('should render eligibility summary list', () => {
    wrapper.expectElement('[data-cy="eligibility-summary-list"]').toExist();
  });

  it('should render effective date summary list', () => {
    wrapper.expectElement('[data-cy="effective-date-summary-list"]').toExist();
  });

  it('should render provided `Change` amendment link', () => {
    wrapper.expectLink(`[data-cy="${changeAmendmentDataCy}"]`).toLinkTo(changeAmendmentHref, 'Change');
  });

  it('should render provided `Change` eligibility link', () => {
    wrapper.expectLink(`[data-cy="${changeEligibilityDataCy}"]`).toLinkTo(changeEligibilityHref, 'Change');
  });

  it('should render provided `Change` effective date link', () => {
    wrapper.expectLink(`[data-cy="${changeEffectiveDateDataCy}"]`).toLinkTo(changeEffectiveDateHref, 'Change');
  });

  function getParams() {
    return {
      amendmentRows: [
        {
          actions: {
            items: [
              {
                href: changeAmendmentHref,
                text: 'Change',
                attributes: {
                  'data-cy': changeAmendmentDataCy,
                },
              },
            ],
          },
          key: {
            text: 'Amendment',
          },
          value: {
            text: 'value',
          },
        },
      ],
      eligibilityRows: [
        {
          actions: {
            items: [
              {
                href: changeEligibilityHref,
                text: 'Change',
                attributes: {
                  'data-cy': changeEligibilityDataCy,
                },
              },
            ],
          },
          key: {
            text: 'Eligibility',
          },
          value: {
            text: 'value',
          },
        },
      ],
      effectiveDateRows: [
        {
          actions: {
            items: [
              {
                href: changeEffectiveDateHref,
                text: 'Change',
                attributes: {
                  'data-cy': changeEffectiveDateDataCy,
                },
              },
            ],
          },
          key: {
            text: 'Effective date',
          },
          value: {
            text: 'value',
          },
        },
      ],
    };
  }
});
