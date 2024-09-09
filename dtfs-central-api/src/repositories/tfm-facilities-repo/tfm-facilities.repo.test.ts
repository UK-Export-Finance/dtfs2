import { ObjectId } from 'mongodb';
import { ZodError } from 'zod';
import { ParsedTfmFacility, RawTfmFacility, TfmFacilitiesRepo } from './tfm-facilities.repo';

describe('tfm-facilities-repo', () => {
  describe('TfmFacilitiesRepo.validateAndParseFindOneResult', () => {
    const aValidTfmFacilityDocumentFacilitySnapshotResult = () => ({
      _id: new ObjectId(),
      dealId: new ObjectId(),
      type: 'A type',
      hasBeenIssued: true,
      name: 'A name',
      shouldCoverStartOnSubmission: true,
      coverStartDate: null,
      coverEndDate: null,
      issueDate: null,
      monthsOfCover: 12,
      details: [],
      detailsOther: '',
      value: 9000,
      coverPercentage: 12,
      interestPercentage: 6,
      ukefFacilityId: '12345678',
      dayCountBasis: 365,
    });

    const aValidTfmFacilityDocument = () => ({
      _id: new ObjectId(),
      facilitySnapshot: aValidTfmFacilityDocumentFacilitySnapshotResult(),
    });

    it('throws an error when the input is an empty object', () => {
      // Arrange
      const input = {} as unknown as RawTfmFacility;

      // Act / Assert
      expect(() => TfmFacilitiesRepo.validateAndParseFindOneResult(input)).toThrow(ZodError);
    });

    it("throws an error when the '_id' field is not a valid object id", () => {
      // Arrange
      const input = { ...aValidTfmFacilityDocument(), _id: 123 } as unknown as RawTfmFacility;

      // Act / Assert
      expect(() => TfmFacilitiesRepo.validateAndParseFindOneResult(input)).toThrow(ZodError);
    });

    it("throws an error when the 'facilitySnapshot' field is undefined", () => {
      // Arrange
      const input = { ...aValidTfmFacilityDocument(), facilitySnapshot: undefined } as unknown as RawTfmFacility;

      // Act / Assert
      expect(() => TfmFacilitiesRepo.validateAndParseFindOneResult(input)).toThrow(ZodError);
    });

    const REQUIRED_FACILITY_SNAPSHOT_FIELDS: (keyof ParsedTfmFacility['facilitySnapshot'])[] = [
      '_id',
      'dealId',
      'type',
      'hasBeenIssued',
      'name',
      'shouldCoverStartOnSubmission',
      'coverStartDate',
      'coverEndDate',
      'issueDate',
      'monthsOfCover',
      'details',
      'detailsOther',
      'value',
      'coverPercentage',
      'interestPercentage',
      'ukefFacilityId',
      'dayCountBasis',
    ];
    it.each(REQUIRED_FACILITY_SNAPSHOT_FIELDS)("throws an error when the 'facilitySnapshot.%s' field is missing", (field) => {
      // Arrange
      const input = {
        ...aValidTfmFacilityDocument(),
        facilitySnapshot: {
          ...aValidTfmFacilityDocumentFacilitySnapshotResult(),
          [field]: undefined,
        },
      };

      // Act / Assert
      expect(() => TfmFacilitiesRepo.validateAndParseFindOneResult(input)).toThrow(ZodError);
    });

    const NULLABLE_FACILITY_SNAPSHOT_FIELDS: (keyof ParsedTfmFacility['facilitySnapshot'])[] = ['coverStartDate', 'coverEndDate', 'issueDate', 'monthsOfCover'];
    it.each(NULLABLE_FACILITY_SNAPSHOT_FIELDS)(
      "does not throw an error when the 'facilitySnapshot.%s' field is null and returns the object with the same field",
      (field) => {
        // Arrange
        const input = {
          ...aValidTfmFacilityDocument(),
          facilitySnapshot: {
            ...aValidTfmFacilityDocumentFacilitySnapshotResult(),
            [field]: null,
          },
        };

        // Act / Assert
        const result = TfmFacilitiesRepo.validateAndParseFindOneResult(input);
        expect(result.facilitySnapshot[field]).toBeNull();
      },
    );

    it('does not throw an error when the input contains an extra field and does not return the extra field in the result', () => {
      // Arrange
      const input = {
        ...aValidTfmFacilityDocument(),
        someOtherField: 'Some other value',
      };

      // Act / Assert
      const result = TfmFacilitiesRepo.validateAndParseFindOneResult(input);
      expect(result).not.toHaveProperty('someOtherField');
    });

    it("does not throw an error when the 'facilitySnapshot' object contains an extra field and does not return the extra field in the result", () => {
      // Arrange
      const input = {
        ...aValidTfmFacilityDocument(),
        facilitySnapshot: {
          ...aValidTfmFacilityDocumentFacilitySnapshotResult(),
          someOtherField: 'Some other value',
        },
      };

      // Act / Assert
      const result = TfmFacilitiesRepo.validateAndParseFindOneResult(input);
      expect(result.facilitySnapshot).not.toHaveProperty('someOtherField');
    });

    const FACILITY_SNAPSHOT_DATE_FIELDS: (keyof ParsedTfmFacility['facilitySnapshot'])[] = ['coverStartDate', 'coverEndDate', 'issueDate'];
    it.each(FACILITY_SNAPSHOT_DATE_FIELDS)("coerces the 'facilitySnapshot.%s.$date' field to a Date object when the value is a timestamp", (field) => {
      // Arrange
      const date = new Date();
      const input = {
        ...aValidTfmFacilityDocument(),
        facilitySnapshot: {
          ...aValidTfmFacilityDocumentFacilitySnapshotResult(),
          [field]: { $date: date.getTime() },
        },
      };

      // Act / Assert
      const result = TfmFacilitiesRepo.validateAndParseFindOneResult(input);
      expect(result.facilitySnapshot[field]).toEqual({ $date: date });
    });
  });
});
