import { SummaryListRow } from '@ukef/dtfs2-common';
import componentRenderer from '../componentRenderer';

const component = '../templates/_macros/amendments/submitted-amendment-summary-list.njk';
const render = componentRenderer(component);

const changeAmendmentDataCy = 'amendment-details-link';
const changeAmendmentHref = (params: { dealId: string; facilityId: string; amendmentId: string; amendmentRows: SummaryListRow[] }) =>
  `/gef/application-details/${params.dealId}/amendment-details/?amendmentId=${params.amendmentId}&facilityId=${params.facilityId}`;

describe(component, () => {
  const params = getParams();

  it('should render the information banner for future effective date', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="facility-information-banner"]').toExist();
  });

  it('should render submitted amendment summary list', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="submitted-amendment-summary-list"]').toExist();
  });

  it('should render provided `See further details` amendment link', () => {
    const wrapper = render(params);

    wrapper.expectLink(`[data-cy="${changeAmendmentDataCy}"]`).toLinkTo(changeAmendmentHref(params), 'See further details');
  });

  function getParams() {
    return {
      dealId: '123',
      facilityId: '234',
      amendmentId: '456',
      type: 'PORTAL',
      effectiveDate: '25/07/2025',
      hasFutureEffectiveDate: true,
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
  }
});
