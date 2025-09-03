const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/edit-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  let params = {
    editable: true,
    href: '/test',
    dataCy: 'test-link',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render a link with correct link, data-cy attribute and text', () => {
    wrapper.expectLink(`[data-cy="${params.dataCy}"]`).toLinkTo(params.href, 'edit');
  });

  describe('when params.editable is NOT true', () => {
    it('should not render', () => {
      params = {
        editable: false,
        href: '/test',
        dataCy: 'test-link',
      };

      wrapper = render(params);

      wrapper.expectLink(`[data-cy="${params.dataCy}"]`).notToExist();
    });
  });
});
