const componentRenderer = require('../../../../component-tests/componentRenderer');
const page = '../templates/case/parties/_macros/parties-bond-issuer-area.njk';
const render = componentRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    deal: {
      _id: '12345678',
      details: {
        submissionType: 'Automatic Inclusion Notice',
        bankSupplyContractID: 'contract-1',
        bankSupplyContractName: 'FirstContract',
        owningBank: {
          name: 'Lloyds',
          emails: ['xxx@yyy.com'],
        },
        maker: {
          firstname: 'John',
          surname: 'Doe',
          email: 'john.doe@exporter.com',
        },
      },
      facilities: []
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render heading', () => {
    wrapper.expectText('[data-cy="bond-issuer-heading"]').toRead('Bond issuer');
  });

  it('should render sub heading', () => {
    wrapper.expectText('[data-cy="bond-issuer-sub-heading"]').toRead('(if different to buyer)');
  });

  it('should render bond issuer facilities table', () => {
    wrapper.expectElement('[data-cy="bond-issuer-facilities-table"]').toExist();
  });
});
