import { RECORD_CORRECTION_DISPLAY_STATUS, RECORD_CORRECTION_STATUS, UTILISATION_REPORT_STATUS_TAG_COLOURS } from '@ukef/dtfs2-common';
import { RecordCorrectionRowViewModel, RecordCorrectionsViewModel } from '../../../server/types/view-models';
import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/record-correction-table.njk';
const render = componentRenderer(component, true);

describe(component, () => {
  const aRecordCorrectionRowViewModel = (): RecordCorrectionRowViewModel => ({
    correctionId: 1,
    feeRecordId: 2,
    exporter: 'Test exporter',
    reasons: 'Other',
    dateSent: '01 Jan 2024',
    status: RECORD_CORRECTION_STATUS.SENT,
    displayStatus: RECORD_CORRECTION_DISPLAY_STATUS.SENT,
    formattedOldRecords: '-',
    formattedCorrectRecords: '-',
  });

  const aRecordCorrectionsViewModel = (): RecordCorrectionsViewModel => ({
    recordCorrectionRows: [aRecordCorrectionRowViewModel()],
  });

  const getWrapper = (viewModel: RecordCorrectionsViewModel = aRecordCorrectionsViewModel()) => render(viewModel);

  const tableHeaderSelector = (text: string) => `thead th:contains("${text}")`;

  it('should render the date sent and exporter headings with the aria-sort attribute set to none', () => {
    const wrapper = getWrapper();

    wrapper.expectElement(tableHeaderSelector('Date sent')).toExist();
    wrapper.expectElement(tableHeaderSelector('Date sent')).toHaveAttribute('aria-sort', 'none');

    wrapper.expectElement(tableHeaderSelector('Exporter')).toExist();
    wrapper.expectElement(tableHeaderSelector('Exporter')).toHaveAttribute('aria-sort', 'none');
  });

  it('should render the correction reason, corrected values, old values, and status headings with the aria-sort attribute set to none', () => {
    const wrapper = getWrapper();

    wrapper.expectElement(tableHeaderSelector('Reason for record correction')).toExist();

    wrapper.expectElement(tableHeaderSelector('Correct record')).toExist();

    wrapper.expectElement(tableHeaderSelector('Old record')).toExist();

    wrapper.expectElement(tableHeaderSelector('Status')).toExist();
  });

  it('should render a row for each record correction', () => {
    const recordCorrectionRows: RecordCorrectionRowViewModel[] = [
      {
        ...aRecordCorrectionRowViewModel(),
        correctionId: 1,
      },
      {
        ...aRecordCorrectionRowViewModel(),
        correctionId: 2,
      },
    ];

    const wrapper = getWrapper({ ...aRecordCorrectionsViewModel(), recordCorrectionRows });

    wrapper.expectElement(`tr`).toHaveCount(recordCorrectionRows.length + 1); // including table header

    recordCorrectionRows.forEach(({ correctionId }) => {
      const rowSelector = `[data-cy="record-correction-log-table-row-${correctionId}"]`;

      wrapper.expectElement(rowSelector).toExist();
    });
  });

  it('should render the "date sent" value for a record correction', () => {
    const correctionId = 1;
    const dateSent = '10 Feb 2024';

    const recordCorrectionRows: RecordCorrectionRowViewModel[] = [
      {
        ...aRecordCorrectionRowViewModel(),
        correctionId,
        dateSent,
      },
    ];

    const wrapper = getWrapper({ ...aRecordCorrectionsViewModel(), recordCorrectionRows });

    wrapper.expectText(`[data-cy="record-correction-log-table-row-${correctionId}-date-sent"]`).toRead(dateSent);
  });

  it('should render the "exporter" value as a link to the "record correction log details" screen for a record correction', () => {
    const correctionId = 1;
    const exporter = 'An exporter';

    const recordCorrectionRows: RecordCorrectionRowViewModel[] = [
      {
        ...aRecordCorrectionRowViewModel(),
        correctionId,
        exporter,
      },
    ];

    const wrapper = getWrapper({ ...aRecordCorrectionsViewModel(), recordCorrectionRows });

    wrapper
      .expectLink(`[data-cy="record-correction-log-table-row-${correctionId}-exporter"] a`)
      .toLinkTo(`/utilisation-reports/record-correction-log-details/${correctionId}`, exporter);
  });

  it('should render the "reasons" value for a record correction', () => {
    const correctionId = 1;
    const reasons = 'Some reasons';

    const recordCorrectionRows: RecordCorrectionRowViewModel[] = [
      {
        ...aRecordCorrectionRowViewModel(),
        correctionId,
        reasons,
      },
    ];

    const wrapper = getWrapper({ ...aRecordCorrectionsViewModel(), recordCorrectionRows });

    wrapper.expectText(`[data-cy="record-correction-log-table-row-${correctionId}-reasons"]`).toRead(reasons);
  });

  it('should render the "correct record" value for a record correction', () => {
    const correctionId = 1;
    const formattedCorrectRecords = 'Correct record value';

    const recordCorrectionRows: RecordCorrectionRowViewModel[] = [
      {
        ...aRecordCorrectionRowViewModel(),
        correctionId,
        formattedCorrectRecords,
      },
    ];

    const wrapper = getWrapper({ ...aRecordCorrectionsViewModel(), recordCorrectionRows });

    wrapper.expectText(`[data-cy="record-correction-log-table-row-${correctionId}-correct-record"]`).toRead(formattedCorrectRecords);
  });

  it('should render the "old record" value for a record correction', () => {
    const correctionId = 1;
    const formattedOldRecords = 'Old record value';

    const recordCorrectionRows: RecordCorrectionRowViewModel[] = [
      {
        ...aRecordCorrectionRowViewModel(),
        correctionId,
        formattedOldRecords,
      },
    ];

    const wrapper = getWrapper({ ...aRecordCorrectionsViewModel(), recordCorrectionRows });

    wrapper.expectText(`[data-cy="record-correction-log-table-row-${correctionId}-old-record"]`).toRead(formattedOldRecords);
  });

  it(`should render the "status" value for a record correction when status is ${RECORD_CORRECTION_STATUS.SENT}`, () => {
    const correctionId = 1;
    const status = RECORD_CORRECTION_STATUS.SENT;
    const displayStatus = RECORD_CORRECTION_DISPLAY_STATUS.SENT;

    const recordCorrectionRows: RecordCorrectionRowViewModel[] = [
      {
        ...aRecordCorrectionRowViewModel(),
        correctionId,
        status,
        displayStatus,
      },
    ];

    const wrapper = getWrapper({ ...aRecordCorrectionsViewModel(), recordCorrectionRows, statusTagColours: UTILISATION_REPORT_STATUS_TAG_COLOURS });

    const selector = `[data-cy="record-correction-log-table-row-${correctionId}-status"] [data-cy="record-correction-status"]`;

    wrapper.expectText(selector).toRead(displayStatus);
    wrapper.expectElement(selector).toHaveAttribute('class', 'govuk-tag govuk-tag--grey govuk-!-text-align-left');
  });

  it(`should render the "status" value for a record correction when status is ${RECORD_CORRECTION_STATUS.RECEIVED}`, () => {
    const correctionId = 1;
    const status = RECORD_CORRECTION_STATUS.RECEIVED;
    const displayStatus = RECORD_CORRECTION_DISPLAY_STATUS.RECEIVED;

    const recordCorrectionRows: RecordCorrectionRowViewModel[] = [
      {
        ...aRecordCorrectionRowViewModel(),
        correctionId,
        status,
        displayStatus,
      },
    ];

    const wrapper = getWrapper({ ...aRecordCorrectionsViewModel(), recordCorrectionRows, statusTagColours: UTILISATION_REPORT_STATUS_TAG_COLOURS });

    const selector = `[data-cy="record-correction-log-table-row-${correctionId}-status"] [data-cy="record-correction-status"]`;

    wrapper.expectText(selector).toRead(displayStatus);
    wrapper.expectElement(selector).toHaveAttribute('class', 'govuk-tag govuk-tag--green govuk-!-text-align-left');
  });
});
