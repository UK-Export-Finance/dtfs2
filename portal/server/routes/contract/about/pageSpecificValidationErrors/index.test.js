import { supplierValidationErrors, buyerValidationErrors, financialPageValidationErrors, aboutSupplyContractPreviewValidationErrors } from '.';
import FIELDS from '../pageFields';
import { pageSpecificValidationErrors } from '../../../../helpers/pageSpecificValidationErrors';

describe('about supply contract page specific validation errors', () => {
  const mockErrors = {
    someField: { order: '1', text: 'Field is required' },
    otherField: { order: '2', text: 'Field is required' },
  };

  describe('supplierValidationErrors', () => {
    it('should return pageSpecificValidationErrors result', () => {
      const mockErrorList = {
        ...mockErrors,
        [FIELDS.SUPPLIER.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = supplierValidationErrors(mockValidationErrors, {});

      const expected = pageSpecificValidationErrors(mockValidationErrors, FIELDS.SUPPLIER, {});
      expect(result).toEqual(expected);
    });
  });

  describe('buyerValidationErrors', () => {
    it('should return pageSpecificValidationErrors result', () => {
      const mockErrorList = {
        ...mockErrors,
        [FIELDS.BUYER.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = buyerValidationErrors(mockValidationErrors, {});

      const expected = pageSpecificValidationErrors(mockValidationErrors, FIELDS.BUYER, {});
      expect(result).toEqual(expected);
    });
  });

  describe('financialPageValidationErrors', () => {
    it('should return pageSpecificValidationErrors result', () => {
      const mockErrorList = {
        ...mockErrors,
        [FIELDS.FINANCIAL.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const result = financialPageValidationErrors(mockValidationErrors, {});

      const expected = pageSpecificValidationErrors(mockValidationErrors, FIELDS.FINANCIAL, {});
      expect(result).toEqual(expected);
    });
  });

  describe('aboutSupplyContractPreviewValidationErrors', () => {
    it('should add `hrefRoot` to each required field error with link to relevant page', () => {
      const mockErrorList = {
        [FIELDS.SUPPLIER.REQUIRED_FIELDS[0]]: { order: '1', text: 'Field is required' },
        [FIELDS.SUPPLIER.REQUIRED_FIELDS[1]]: { order: '2', text: 'Field is required' },
        [FIELDS.BUYER.REQUIRED_FIELDS[0]]: { order: '3', text: 'Field is required' },
        [FIELDS.BUYER.REQUIRED_FIELDS[1]]: { order: '4', text: 'Field is required' },
        [FIELDS.FINANCIAL.REQUIRED_FIELDS[0]]: { order: '5', text: 'Field is required' },
        [FIELDS.FINANCIAL.REQUIRED_FIELDS[1]]: { order: '6', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };

      const mockDealId = '123';

      const result = aboutSupplyContractPreviewValidationErrors(mockValidationErrors, mockDealId);

      const expected = {
        errorList: {
          [FIELDS.SUPPLIER.REQUIRED_FIELDS[0]]: {
            order: '1',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/about/supplier`,
          },
          [FIELDS.SUPPLIER.REQUIRED_FIELDS[1]]: {
            order: '2',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/about/supplier`,
          },
          [FIELDS.BUYER.REQUIRED_FIELDS[0]]: {
            order: '3',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/about/buyer`,
          },
          [FIELDS.BUYER.REQUIRED_FIELDS[1]]: {
            order: '4',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/about/buyer`,
          },
          [FIELDS.FINANCIAL.REQUIRED_FIELDS[0]]: {
            order: '5',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/about/financial`,
          },
          [FIELDS.FINANCIAL.REQUIRED_FIELDS[1]]: {
            order: '6',
            text: 'Field is required',
            hrefRoot: `/contract/${mockDealId}/about/financial`,
          },
        },
        count: mockErrorList.length,
      };

      expect(result).toEqual(expected);
    });

    describe('when there is no validationErrors.errorList passed', () => {
      it('should return validationErrors object', () => {
        const mockValidationErrors = {};
        const result = aboutSupplyContractPreviewValidationErrors(mockValidationErrors);
        expect(result).toEqual(mockValidationErrors);
      });
    });
  });
});
