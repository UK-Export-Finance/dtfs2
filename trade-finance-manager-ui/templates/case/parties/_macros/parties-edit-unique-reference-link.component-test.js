const pageRenderer = require('../../../../component-tests/componentRenderer');

const page = '../templates/case/parties/_macros/parties-edit-unique-reference-link.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    dealId: '123',
    type: 'exporter',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render link with correct url', () => {
    wrapper.expectLink('[data-cy="edit-party-link"]').toLinkTo(
      `/case/${params.dealId}/parties/${params.type}`,
      'Add or edit unique reference number',
    );
  });
});
