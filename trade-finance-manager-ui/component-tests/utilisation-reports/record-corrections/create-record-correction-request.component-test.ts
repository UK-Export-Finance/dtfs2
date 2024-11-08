import { aCreateRecordCorrectionRequestViewModel } from '../../../test-helpers/test-data/view-models';
import { pageRenderer } from '../../pageRenderer';

const page = '../templates/utilisation-reports/record-corrections/create-record-correction-request.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the main heading', () => {
    // Arrange
    const createRecordCorrectionRequestViewModel = aCreateRecordCorrectionRequestViewModel();
    createRecordCorrectionRequestViewModel.bank.name = 'My bank';
    createRecordCorrectionRequestViewModel.formattedReportPeriod = 'January 2024';

    const wrapper = render(createRecordCorrectionRequestViewModel);

    // Assert
    wrapper.expectText('h1').toRead('Record correction request');
    wrapper.expectText('span[data-cy="add-payment-heading-caption"]').toMatch(/My bank,/);
    wrapper.expectText('span[data-cy="add-payment-heading-caption"]').toMatch(/January 2024/);
  });

  it('should render the fee record summary block header with the provided fee record details', () => {
    // Arrange
    const feeRecord = {
      facilityId: '0012345678',
      exporter: 'Sample Company Ltd',
    };

    const createRecordCorrectionRequestViewModel = aCreateRecordCorrectionRequestViewModel();
    createRecordCorrectionRequestViewModel.user.firstName = 'Jay';
    createRecordCorrectionRequestViewModel.user.lastName = 'Doe';
    createRecordCorrectionRequestViewModel.feeRecord = feeRecord;

    const wrapper = render(createRecordCorrectionRequestViewModel);

    // Assert
    const feeRecordSummarySelector = '[data-cy="fee-record-summary-block-header"]';
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="facility-id"]`).toRead(feeRecord.facilityId);
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="exporter"]`).toRead(feeRecord.exporter);
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="requested-by"]`).toRead('Jay Doe');
  });
});
