import { aCreateRecordCorrectionRequestViewModel } from '../../../test-helpers/test-data/view-models';
import { pageRenderer } from '../../pageRenderer';

const page = '../templates/utilisation-reports/record-corrections/create-record-correction-request.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the main heading', () => {
    // Arrange
    const viewModel = aCreateRecordCorrectionRequestViewModel();
    viewModel.bank.name = 'My bank';
    viewModel.formattedReportPeriod = 'January 2024';

    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('h1').toRead('Record correction request');
    wrapper.expectText('span[data-cy="heading-caption"]').toRead('My bank, January 2024');
  });

  it('should render the fee record summary block header with the provided fee record details', () => {
    // Arrange
    const feeRecord = {
      facilityId: '0012345678',
      exporter: 'Sample Company Ltd',
    };

    const viewModel = aCreateRecordCorrectionRequestViewModel();
    viewModel.user.firstName = 'Jay';
    viewModel.user.lastName = 'Doe';
    viewModel.feeRecord = feeRecord;

    const wrapper = render(viewModel);

    // Assert
    const feeRecordSummarySelector = '[data-cy="fee-record-summary-block-header"]';
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="facility-id"]`).toRead(feeRecord.facilityId);
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="exporter"]`).toRead(feeRecord.exporter);
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="requested-by"]`).toRead('Jay Doe');
  });
});
