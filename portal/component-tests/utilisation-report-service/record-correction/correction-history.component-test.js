const pageRenderer = require('../../pageRenderer');
const { aPendingCorrectionsViewModel } = require('../../../test-helpers/test-data/view-models');

const page = 'utilisation-report-service/record-correction/correction-history.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the main heading', () => {
    // Act
    const wrapper = render(aPendingCorrectionsViewModel());

    // Assert
    wrapper.expectText('[data-cy="main-heading"]').toRead('Record correction history');
  });

  describe('when there are no completed corrections', () => {
    const viewModel = {
      completedCorrections: [],
    };

    it('should render the "no corrections" text', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectText('[data-cy="no-corrections-text-line-1"]').toRead('There are no previous record correction requests.');
      wrapper
        .expectText('[data-cy="no-corrections-text-line-2"]')
        .toRead('Records will be automatically added to this page once they have been sent back to UKEF.');
    });

    it('should not render the correction history table', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement('[data-cy="correction-history-table"]').notToExist();
    });
  });

  describe('when there are completed corrections', () => {
    const viewModel = {
      completedCorrections: [
        {
          dateSent: {
            formattedDateSent: '01 Jan 2024',
            dataSortValue: 0,
          },
          exporter: 'Some exporter',
          formattedReasons: 'Facility ID is incorrect, Other',
          formattedPreviousValues: '11111111, -',
          formattedCorrectedValues: '22222222, -',
          formattedBankCommentary: 'Some bank commentary',
        },
      ],
    };

    it('should render the "corrections" text', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectText('[data-cy="corrections-text-line-1"]').toRead('Previous record correction requests are shown below.');
      wrapper.expectText('[data-cy="corrections-text-line-2"]').toRead('Records are automatically added to this page once they have been sent back to UKEF.');
    });

    it('should render the correction history table', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement('[data-cy="correction-history-table"]').toExist();
    });
  });
});
