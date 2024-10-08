const { componentRenderer } = require('../../../componentRenderer');

const page = '../templates/case/parties/_macros/parties-key-value-grid-row.njk';
const render = componentRenderer(page);

describe(page, () => {
  let wrapper;

  describe('when there is a value', () => {
    const params = {
      key: 'my key',
      value: 'my value',
      dataCy: 'data-cy',
    };

    beforeEach(() => {
      wrapper = render(params);
    });

    it('should render key value pair', () => {
      wrapper.expectText(`[data-cy="${params.dataCy}"]`).toRead(params.value);
    });
  });

  describe('when there is no value', () => {
    const params = {
      key: 'my key',
      dataCy: 'data-cy',
    };

    beforeEach(() => {
      wrapper = render(params);
    });

    it('should render a dash', () => {
      wrapper.expectText(`[data-cy="${params.dataCy}"]`).toRead('-');
    });
  });
});
