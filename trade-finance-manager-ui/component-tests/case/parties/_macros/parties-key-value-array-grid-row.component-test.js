const { componentRenderer } = require('../../../componentRenderer');

const page = '../templates/case/parties/_macros/parties-key-value-array-grid-row.njk';
const render = componentRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    key: 'Address',
    values: ['AddressLine1', null, null, 'AddressTown', 'AddressPostcode'],
    dataCy: 'test-value-array',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render agent AddressLine1 in address', () => {
    wrapper.expectText(`[data-cy="${params.dataCy}"]`).toContain('AddressLine1');
  });
  it('should render agent agentAddressLine2 in address', () => {
    wrapper.expectText(`[data-cy="${params.dataCy}"]`).toContain('AddressTown');
  });
  it('should render agent agentAddressLine1 in address', () => {
    wrapper.expectText(`[data-cy="${params.dataCy}"]`).toContain('AddressPostcode');
  });
});
