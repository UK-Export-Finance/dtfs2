const { componentRenderer } = require('../../../componentRenderer');

const page = '../templates/case/parties/_macros/parties-edit-unique-reference-link.njk';
const render = componentRenderer(page);

describe(page, () => {
  it('should render link with correct url', () => {
    const params = {
      dealId: '123',
      type: 'exporter',
    };
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="edit-party-link"]').toLinkTo(`/case/${params.dealId}/parties/${params.type}`, 'Add or edit unique reference number');
  });

  it('should render link with correct url and link text', () => {
    const linkText = 'override link text';
    const params = {
      dealId: '123',
      type: 'exporter',
      linkText,
    };
    const wrapper = render(params);

    wrapper.expectLink('[data-cy="edit-party-link"]').toLinkTo(`/case/${params.dealId}/parties/${params.type}`, linkText);
  });
});
