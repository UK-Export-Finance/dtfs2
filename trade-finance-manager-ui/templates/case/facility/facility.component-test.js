const pageRenderer = require('../../../component-tests/pageRenderer');

const page = '../templates/case/facility/facility.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    facility: {
      _id: '12345678',
      ukefFacilityID: '0040004833',
      facilityType: 'Performance Bond',
      facilityStage: 'Commitment',
      facilityProduct: 'BSS',
      coverEndDate: '1 Feb 2021',
      coveredPercentage: '10%',
      facilityValueExportCurrency: 'GBP 12,345.00',
      facilityValue: 'GBP 12,345.00',
      ukefExposure: 'GBP 1,234.00',
      bankFacilityReference: '123456'
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render facilityProduct', () => {
    wrapper.expectText('[data-cy="facility-product"]').toRead(params.facility.facilityProduct);
  });

  it('should render facilityType', () => {
    wrapper.expectText('[data-cy="facility-type"]').toRead(params.facility.facilityType);
  });

  it('should render facilityStage', () => {
    wrapper.expectText('[data-cy="facility-stage"]').toRead(params.facility.facilityStage);
  });

  it('should render bankFacilityReference', () => {
    wrapper.expectText('[data-cy="bank-facility-reference"]').toRead(params.facility.bankFacilityReference);
  });
});
