const componentRenderer = require('../../../componentRenderer');

const component = 'utilisation-report-service/record-correction/_macros/correction-log-table.njk';
const render = componentRenderer(component, true);

describe(component, () => {
  const firstCompletedCorrection = {
    dateSent: {
      formattedDateSent: '01 Jan 2024',
      dataSortValue: 0,
    },
    exporter: 'Some exporter',
    formattedReasons: 'Facility ID is incorrect, Other',
    formattedPreviousValues: '11111111, -',
    formattedCorrectedValues: '22222222, -',
    formattedBankCommentary: 'Some bank commentary',
  };

  const secondCompletedCorrection = {
    dateSent: {
      formattedDateSent: '02 Jan 2024',
      dataSortValue: 1,
    },
    exporter: 'Another exporter',
    formattedReasons: 'Facility ID is incorrect, Utilisation is incorrect',
    formattedPreviousValues: '33333333, 123.45',
    formattedCorrectedValues: '44444444, 987.65',
    formattedBankCommentary: 'Some other bank commentary',
  };

  const firstRowSelector = 'tr:nth-of-type(1)';
  const secondRowSelector = 'tr:nth-of-type(2)';

  const viewModel = {
    completedCorrections: [firstCompletedCorrection, secondCompletedCorrection],
  };

  const tableHeaderSelector = (text) => `thead th:contains("${text}")`;

  it('renders 6 table headings', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement('table thead tr').toHaveCount(1);
    wrapper.expectElement('table thead th').toHaveCount(6);
  });

  it('renders the "date sent" heading with the aria-sort attribute set to descending', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement(tableHeaderSelector('Date sent')).toExist();
    wrapper.expectElement(tableHeaderSelector('Date sent')).toHaveAttribute('aria-sort', 'descending');
  });

  it('renders the "exporter" heading with the aria-sort attribute set to none', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement(tableHeaderSelector('Exporter')).toExist();
    wrapper.expectElement(tableHeaderSelector('Exporter')).toHaveAttribute('aria-sort', 'none');
  });

  it('renders the "reasons for correction", "correct record", "old record", and "correction notes" headings as not sortable', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement(tableHeaderSelector('Reason(s) for correction')).toExist();
    wrapper.expectElement(tableHeaderSelector('Reason(s) for correction')).notToHaveAttribute('aria-sort');

    wrapper.expectElement(tableHeaderSelector('Correct record')).toExist();
    wrapper.expectElement(tableHeaderSelector('Correct record')).notToHaveAttribute('aria-sort');

    wrapper.expectElement(tableHeaderSelector('Old record')).toExist();
    wrapper.expectElement(tableHeaderSelector('Old record')).notToHaveAttribute('aria-sort');

    wrapper.expectElement(tableHeaderSelector('Correction notes')).toExist();
    wrapper.expectElement(tableHeaderSelector('Correction notes')).notToHaveAttribute('aria-sort');
  });

  it('should render the corrections as rows within the table', () => {
    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement('tr').toHaveCount(3); // 2 completed corrections + 1 header row

    wrapper.expectText(`${firstRowSelector} [data-cy="correction-log-row--date-sent"]`).toRead(firstCompletedCorrection.dateSent.formattedDateSent);
    wrapper.expectText(`${firstRowSelector} [data-cy="correction-log-row--exporter"]`).toRead(firstCompletedCorrection.exporter);
    wrapper.expectText(`${firstRowSelector} [data-cy="correction-log-row--formatted-reasons"]`).toRead(firstCompletedCorrection.formattedReasons);
    wrapper
      .expectText(`${firstRowSelector} [data-cy="correction-log-row--formatted-corrected-values"]`)
      .toRead(firstCompletedCorrection.formattedCorrectedValues);
    wrapper
      .expectText(`${firstRowSelector} [data-cy="correction-log-row--formatted-previous-values"]`)
      .toRead(firstCompletedCorrection.formattedPreviousValues);
    wrapper.expectText(`${firstRowSelector} [data-cy="correction-log-row--bank-commentary"]`).toRead(firstCompletedCorrection.formattedBankCommentary);

    wrapper.expectText(`${secondRowSelector} [data-cy="correction-log-row--date-sent"]`).toRead(secondCompletedCorrection.dateSent.formattedDateSent);
    wrapper.expectText(`${secondRowSelector} [data-cy="correction-log-row--exporter"]`).toRead(secondCompletedCorrection.exporter);
    wrapper.expectText(`${secondRowSelector} [data-cy="correction-log-row--formatted-reasons"]`).toRead(secondCompletedCorrection.formattedReasons);
    wrapper
      .expectText(`${secondRowSelector} [data-cy="correction-log-row--formatted-corrected-values"]`)
      .toRead(secondCompletedCorrection.formattedCorrectedValues);
    wrapper
      .expectText(`${secondRowSelector} [data-cy="correction-log-row--formatted-previous-values"]`)
      .toRead(secondCompletedCorrection.formattedPreviousValues);
    wrapper.expectText(`${secondRowSelector} [data-cy="correction-log-row--bank-commentary"]`).toRead(secondCompletedCorrection.formattedBankCommentary);
  });

  it('should render the corrections "date sent" with the "data-sort-value" attribute', () => {
    // Arrange
    const completedCorrections = [
      {
        ...firstCompletedCorrection,
        dateSent: {
          formattedDateSent: '01 Jan 2024',
          dataSortValue: 0,
        },
      },
      {
        ...secondCompletedCorrection,
        dateSent: {
          formattedDateSent: '02 Jan 2024',
          dataSortValue: 1,
        },
      },
    ];

    // Act
    const wrapper = render({ completedCorrections });

    // Assert
    const firstCorrectionDateSentSelector = `${firstRowSelector} td:contains("${firstCompletedCorrection.dateSent.formattedDateSent}")`;

    wrapper.expectElement(firstCorrectionDateSentSelector).toExist();
    wrapper.expectElement(firstCorrectionDateSentSelector).toHaveAttribute('data-sort-value', firstCompletedCorrection.dateSent.dataSortValue.toString());

    const secondCorrectionDateSentSelector = `${secondRowSelector} td:contains("${secondCompletedCorrection.dateSent.formattedDateSent}")`;

    wrapper.expectElement(secondCorrectionDateSentSelector).toExist();
    wrapper.expectElement(secondCorrectionDateSentSelector).toHaveAttribute('data-sort-value', secondCompletedCorrection.dateSent.dataSortValue.toString());
  });
});
