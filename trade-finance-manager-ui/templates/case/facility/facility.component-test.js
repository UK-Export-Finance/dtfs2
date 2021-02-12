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
      facilityProduct: {
        name: 'Bond Support Scheme',
      },
      coverEndDate: '1 Feb 2021',
      coveredPercentage: '10%',
      facilityValueExportCurrency: 'GBP 12,345.00',
      facilityValue: 'GBP 12,345.00',
      ukefExposure: 'GBP 1,234.00',
      bankFacilityReference: '123456',
      guaranteeFeePayableToUkef: '10%',
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('overview section', () => {

    it('should render facilityProduct', () => {
      wrapper.expectText('[data-cy="facility-product"]').toRead(params.facility.facilityProduct.name);
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

  describe('value and exposure section', () => {

    it('should render facilityValueExportCurrency', () => {
      wrapper.expectText('[data-cy="facility-value-export-currency"]').toRead(params.facility.facilityValueExportCurrency);
    });

    it('should render facilityValue', () => {
      wrapper.expectText('[data-cy="facility-value-gbp"]').toRead(params.facility.facilityValue);
    });

    it('should render UKEF cover / coveredPercentage', () => {
      wrapper.expectText('[data-cy="facility-ukef-cover"]').toRead(params.facility.coveredPercentage);
    });

    it('should render maximum ukefExposure', () => {
      wrapper.expectText('[data-cy="facility-maximum-ukef-exposure"]').toRead(params.facility.ukefExposure);
    });

  });

  describe('`facility pricing and risk` section', () => {

    it('should render guaranteeFeePayableToUkef', () => {
      wrapper.expectText('[data-cy="facility-guarantee-fee-payable-to-ukef"]').toRead(params.facility.guaranteeFeePayableToUkef);
    });

  });
});
