import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import pageRenderer from '../../pageRenderer';
import { ManualApprovalNeededViewModel } from '../../../server/types/view-models/amendments/ManualApprovalNeededViewModel.ts';

const page = 'partials/amendments/manual-approval-needed.njk';
const render = pageRenderer(page);

describe(page, () => {
  const exporterName = 'exporterName';
  const previousPage = 'previousPage';
  const amendmentFormEmail = 'test@email.com';
  const returnLink = '/dashboard/deals';
  const facilityType = FACILITY_TYPE.CASH;

  const params: ManualApprovalNeededViewModel = {
    exporterName,
    previousPage,
    facilityType,
    amendmentFormEmail,
    returnLink,
  };

  it('should render the page heading', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="page-heading"]').toContain('This amendment cannot be automatically approved');
  });

  it(`should render the 'Back' link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="back-link"]').toLinkTo(previousPage, 'Back');
  });

  it('should render the exporter name and facility type in the heading caption', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="heading-caption"]').toRead(`${exporterName}, ${facilityType} facility`);
  });

  it(`should render the return link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="return-link"]').toLinkTo(returnLink, 'Return to all applications and notices');
  });

  it(`should render the form email address`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="form-email-link"]').toLinkTo(`mailTo:${amendmentFormEmail}`, amendmentFormEmail);
  });
});
