import { GetCompletedFeeRecordCorrectionsResponseBody } from '../../../../api-response-types';
import { CompletedCorrectionViewModel } from '../../../../types/view-models/record-correction/record-correction-log';
import { getFormattedDateSent, mapCompletedCorrectionsToViewModel } from './helpers';

describe('record-correction-log helpers', () => {
  describe('getFormattedDateSent', () => {
    describe('when a valid iso date string is provided', () => {
      it('should format the date in the correct format', () => {
        // Arrange
        const dateSent = '2024-02-01T12:30:00.000';

        // Act
        const formattedDate = getFormattedDateSent(dateSent);

        // Assert
        expect(formattedDate).toBe('01 Feb 2024');
      });
    });

    describe('when an invalid date is provided', () => {
      it('should throw an error', () => {
        // Arrange
        const dateSent = 'invalid-date';

        // Act & Assert
        expect(() => getFormattedDateSent(dateSent)).toThrow();
      });
    });
  });

  describe('mapCompletedCorrectionsToViewModel', () => {
    it('should return an empty array if no completed corrections are provided', () => {
      // Arrange
      const completedCorrections: GetCompletedFeeRecordCorrectionsResponseBody = [];

      // Act
      const viewModel = mapCompletedCorrectionsToViewModel(completedCorrections);

      // Assert
      expect(viewModel).toEqual([]);
    });

    it('should map completed corrections to view model', () => {
      // Arrange
      const firstCompletedCorrection = {
        id: 1,
        dateSent: new Date('2024-02-01').toISOString(),
        exporter: 'Exporter A',
        formattedReasons: 'Facility ID is incorrect',
        formattedPreviousValues: '11111111',
        formattedCorrectedValues: '22222222',
        bankCommentary: 'Bank commentary A',
      };

      const secondCompletedCorrection = {
        id: 2,
        dateSent: new Date('2024-03-17').toISOString(),
        exporter: 'Exporter B',
        formattedReasons: 'Utilisation is incorrect',
        formattedPreviousValues: '123.45',
        formattedCorrectedValues: '987.65',
      };

      const completedCorrections: GetCompletedFeeRecordCorrectionsResponseBody = [firstCompletedCorrection, secondCompletedCorrection];

      // Act
      const viewModel = mapCompletedCorrectionsToViewModel(completedCorrections);

      // Assert
      const expectedViewModel: CompletedCorrectionViewModel[] = [
        {
          dateSent: {
            formattedDateSent: '01 Feb 2024',
            dataSortValue: 0,
          },
          exporter: firstCompletedCorrection.exporter,
          formattedReasons: firstCompletedCorrection.formattedReasons,
          formattedPreviousValues: firstCompletedCorrection.formattedPreviousValues,
          formattedCorrectedValues: firstCompletedCorrection.formattedCorrectedValues,
          formattedBankCommentary: firstCompletedCorrection.bankCommentary,
        },
        {
          dateSent: {
            formattedDateSent: '17 Mar 2024',
            dataSortValue: 1,
          },
          exporter: secondCompletedCorrection.exporter,
          formattedReasons: secondCompletedCorrection.formattedReasons,
          formattedPreviousValues: secondCompletedCorrection.formattedPreviousValues,
          formattedCorrectedValues: secondCompletedCorrection.formattedCorrectedValues,
          formattedBankCommentary: '-',
        },
      ];

      expect(viewModel).toEqual(expectedViewModel);
    });

    it('should map the completed correction "date sent" to a formatted date sent sorted by date ascending', () => {
      // Arrange
      const aCompletedCorrection = () => ({
        id: 1,
        dateSent: new Date('2024-02-01').toISOString(),
        exporter: 'An exporter',
        formattedReasons: 'Other',
        formattedPreviousValues: '-',
        formattedCorrectedValues: '-',
        formattedBankCommentary: 'Some bank commentary',
      });

      const completedCorrections: GetCompletedFeeRecordCorrectionsResponseBody = [
        {
          ...aCompletedCorrection(),
          id: 1,
          dateSent: new Date('2024-06-01').toISOString(), // '01 Jun 2024', dataSortValue = 3
        },
        {
          ...aCompletedCorrection(),
          id: 2,
          dateSent: new Date('2024-07-28').toISOString(), // '28 Jul 2024', dataSortValue = 5
        },
        {
          ...aCompletedCorrection(),
          id: 3,
          dateSent: new Date('2024-03-14').toISOString(), // '14 Mar 2024', dataSortValue = 0
        },
        {
          ...aCompletedCorrection(),
          id: 4,
          dateSent: new Date('2024-05-07').toISOString(), // '07 May 2024', dataSortValue = 2
        },
        {
          ...aCompletedCorrection(),
          id: 5,
          dateSent: new Date('2024-04-01').toISOString(), // '01 Apr 2024', dataSortValue = 1
        },
        {
          ...aCompletedCorrection(),
          id: 6,
          dateSent: new Date('2024-06-21').toISOString(), // '21 Jun 2024', dataSortValue = 4
        },
      ];

      // Act
      const viewModel = mapCompletedCorrectionsToViewModel(completedCorrections);

      // Assert
      expect(viewModel).toHaveLength(6);

      const expectedMappedDateSentValues = [
        { formattedDateSent: '01 Jun 2024', dataSortValue: 3 },
        { formattedDateSent: '28 Jul 2024', dataSortValue: 5 },
        { formattedDateSent: '14 Mar 2024', dataSortValue: 0 },
        { formattedDateSent: '07 May 2024', dataSortValue: 2 },
        { formattedDateSent: '01 Apr 2024', dataSortValue: 1 },
        { formattedDateSent: '21 Jun 2024', dataSortValue: 4 },
      ];

      expect(viewModel.map(({ dateSent }) => dateSent)).toEqual(expectedMappedDateSentValues);
    });
  });
});
