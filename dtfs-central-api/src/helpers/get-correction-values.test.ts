import { CURRENCY, RECORD_CORRECTION_REASON, RecordCorrectionReason, RecordCorrectionValues } from '@ukef/dtfs2-common';
import { CorrectionValueGetter, getCorrectionValues } from './get-correction-values';

describe('getCorrectionValues', () => {
  type OriginType = {
    mock: string;
  };

  const mockOrigin: OriginType = { mock: 'mock' };

  const mockReportedCurrency = CURRENCY.GBP;
  const mockFacilityId = '12345';
  const mockUtilisation = 0.5;
  const mockReportedFee = 9000;

  const mockReportedCurrencyGetter = jest.fn();
  const mockFacilityIdGetter = jest.fn();
  const mockUtilisationGetter = jest.fn();
  const mockReportedFeeGetter = jest.fn();
  const mockOtherGetter = jest.fn();

  const mockValueGetters: Record<RecordCorrectionReason, CorrectionValueGetter<OriginType>> = {
    [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT]: mockReportedCurrencyGetter,
    [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT]: mockFacilityIdGetter,
    [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT]: mockUtilisationGetter,
    [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT]: mockReportedFeeGetter,
    [RECORD_CORRECTION_REASON.OTHER]: mockOtherGetter,
  };

  beforeEach(() => {
    mockReportedCurrencyGetter.mockReturnValue({ feesPaidToUkefForThePeriodCurrency: mockReportedCurrency });
    mockFacilityIdGetter.mockReturnValue({ facilityId: mockFacilityId });
    mockUtilisationGetter.mockReturnValue({ facilityUtilisation: mockUtilisation });
    mockReportedFeeGetter.mockReturnValue({ feesPaidToUkefForThePeriod: mockReportedFee });
    mockOtherGetter.mockReturnValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return values with all fields set to null when no reasons are provided', () => {
    // Arrange
    const reasons: RecordCorrectionReason[] = [];

    // Act
    const result = getCorrectionValues<OriginType>(mockOrigin, reasons, mockValueGetters);

    // Assert
    const expected: RecordCorrectionValues = {
      feesPaidToUkefForThePeriod: null,
      feesPaidToUkefForThePeriodCurrency: null,
      facilityId: null,
      facilityUtilisation: null,
    };

    expect(result).toEqual(expected);
  });

  it('should set correction values to the value provided by the value getters for the given reasons', () => {
    // Arrange
    const reasons = [RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT, RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];

    // Act
    const result = getCorrectionValues(mockOrigin, reasons, mockValueGetters);

    // Assert
    const expected: RecordCorrectionValues = {
      feesPaidToUkefForThePeriod: null,
      feesPaidToUkefForThePeriodCurrency: mockReportedCurrency,
      facilityId: mockFacilityId,
      facilityUtilisation: null,
    };

    expect(result).toEqual(expected);
  });

  it('should override undefined values provided by value getters with null in resulting object', () => {
    // Arrange
    const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

    mockReportedFeeGetter.mockReturnValue({ feesPaidToUkefForThePeriod: undefined });

    // Act
    const result = getCorrectionValues(mockOrigin, reasons, mockValueGetters);

    // Assert
    const expected: RecordCorrectionValues = {
      feesPaidToUkefForThePeriod: null,
      feesPaidToUkefForThePeriodCurrency: null,
      facilityId: null,
      facilityUtilisation: null,
    };

    expect(result).toEqual(expected);
  });

  it('should not override zero values provided by value getters with null in resulting object', () => {
    // Arrange
    const reasons = [RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

    mockReportedFeeGetter.mockReturnValue({ feesPaidToUkefForThePeriod: 0 });

    // Act
    const result = getCorrectionValues(mockOrigin, reasons, mockValueGetters);

    // Assert
    const expected: RecordCorrectionValues = {
      feesPaidToUkefForThePeriod: 0,
      feesPaidToUkefForThePeriodCurrency: null,
      facilityId: null,
      facilityUtilisation: null,
    };

    expect(result).toEqual(expected);
  });
});
