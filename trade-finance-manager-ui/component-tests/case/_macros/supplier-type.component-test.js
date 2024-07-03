const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/case/_macros/supplier-type.njk';
const render = componentRenderer(component);

describe(component, () => {
  it('should render Exporter when supplier type = Exporter', () => {
    const wrapper = render('Exporter');
    wrapper.expectText('[data-cy="supplier-type"]').toRead('Exporter');
  });

  describe('should render "tier 1 exporter" when supplier type = "UK Supplier" ', () => {
    it('should render correct supplier type', () => {
      const wrapper = render('UK Supplier');
      wrapper.expectText('[data-cy="supplier-type"]').toRead('Tier 1 supplier');
    });
  });
});
