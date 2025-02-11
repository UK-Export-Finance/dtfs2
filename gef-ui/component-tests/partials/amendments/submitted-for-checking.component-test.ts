import pageRenderer from '../../pageRenderer';
import { SubmittedForCheckingViewModel } from '../../../server/types/view-models/amendments/submitted-for-checking-view-model.ts';

const page = 'partials/amendments/submitted-for-checking.njk';
const render = pageRenderer(page);

describe(page, () => {
  const returnLink = '/dashboard/deals';

  const params: SubmittedForCheckingViewModel = {
    returnLink,
  };

  it('should render the confirmation panel', () => {
    const wrapper = render(params);

    wrapper.expectText('[data-cy="submitted-for-checking-confirmation-panel"]').toContain('Amendment submitted for checking at your bank');
  });

  it(`should render the return link`, () => {
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="return-link"]').toLinkTo(returnLink, 'Return to all applications and notices');
  });
});
