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
          ukefFacilityId: '0040004833',
          ukefFacilityType: 'Bond',
          bondIssuer: 'test bond issuer',
        },
        tfm: {
          bondIssuerPartyUrn: '1234-test',
        },
      },
      index: 1,
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
        .expectInput('[data-cy="urn-input-1"]')
        .toHaveValue(params.bond.tfm.bondIssuerPartyUrn);
    });
  });
});
