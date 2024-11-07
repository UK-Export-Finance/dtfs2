import { componentRenderer } from '../../../componentRenderer';

const component = '../templates/utilisation-reports/record-corrections/_macros/fee-record-summary.njk';
const render = componentRenderer(component);

describe(component, () => {
  const aFeeRecordSummary = () => ({
    facilityId: '0012345678',
    exporter: 'Sample Company Ltd',
    obligorUrn: '12345',
    obligorName: 'Sample Obligor',
    user: {
      firstName: 'First',
      lastName: 'Last',
    },
  });

  const getWrapper = (viewModel: {
    facilityId: string;
    exporter: string;
    obligorUrn: string;
    obligorName: string;
    user: { firstName: string; lastName: string };
  }) => render(viewModel);

  const feeRecordSummarySelector = '[data-cy="fee-record-summary-block-header"]';

  it('should render the fee record facility id and label', () => {
    // Arrange
    const facilityId = '0012345678';

    // Act
    const wrapper = getWrapper({ ...aFeeRecordSummary(), facilityId });

    // Assert
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="facility-id-label"]`).toRead('Facility ID');
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="facility-id"]`).toRead(facilityId);
  });

  it('should render the fee record exporter and label', () => {
    // Arrange
    const exporter = 'A sample exporter';

    // Act
    const wrapper = getWrapper({ ...aFeeRecordSummary(), exporter });

    // Assert
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="exporter-label"]`).toRead('Exporter');
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="exporter"]`).toRead(exporter);
  });

  it('should render the requesting users full name and label', () => {
    // Arrange
    const user = {
      firstName: 'Jay',
      lastName: 'Doe',
    };

    // Act
    const wrapper = getWrapper({ ...aFeeRecordSummary(), user });

    // Assert
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="requested-by-label"]`).toRead('Requested by');
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="requested-by"]`).toRead('Jay Doe');
  });

  it('should render the obligor URN and label', () => {
    // Arrange
    const obligorUrn = '12345';

    // Act
    const wrapper = getWrapper({ ...aFeeRecordSummary(), obligorUrn });

    // Assert
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="obligor-urn-label"]`).toRead('Obligor URN');
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="obligor-urn"]`).toRead(obligorUrn);
  });

  it('should render the obligor name and label', () => {
    // Arrange
    const obligorName = 'Jay Doe';

    // Act
    const wrapper = getWrapper({ ...aFeeRecordSummary(), obligorName });

    // Assert
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="obligor-name-label"]`).toRead('Obligor name');
    wrapper.expectText(`${feeRecordSummarySelector} [data-cy="obligor-name"]`).toRead(obligorName);
  });
});
