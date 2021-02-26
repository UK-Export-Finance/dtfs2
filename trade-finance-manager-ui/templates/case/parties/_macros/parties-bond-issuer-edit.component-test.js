const pageRenderer = require('../../../../component-tests/componentRenderer');

const page = '../templates/case/parties/_macros/parties-bond-issuer-edit.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  describe('bond issuer edit', () => {
    const params = {
      bondType: 'bond issuer',
      bond: {
        _id: '123',
        facilitySnapshot: {
          _id: '123',
          ukefFacilityID: '0040004833',
          ukefFacilityType: 'bond',
          bondIssuer: 'test bond issuer',
        },
        tfm: {
          bondIssuerPartyUrn: '1234-test',
        },
      },
    };

    beforeEach(() => {
      wrapper = render(params);
    });

    it('should render bond issuer name', () => {
      wrapper
        .expectText('[data-cy="bond-issuer-name"]')
        .toContain(params.bond.facilitySnapshot.bondIssuer);
    });

    it('should render bond issuer urn input', () => {
      wrapper
        .expectInput('[data-cy="urn-input"]')
        .toHaveValue(params.bond.tfm.bondIssuerPartyUrn);
    });
  });
});
