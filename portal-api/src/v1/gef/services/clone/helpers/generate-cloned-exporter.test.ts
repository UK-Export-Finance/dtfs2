import { exporterStatus } from '../../../controllers/validation/exporter';
import { generateClonedExporter } from './generate-cloned-exporter';

describe('generateClonedExporter', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('updates the updatedAt and status fields', () => {
    // Arrange
    const mockExporter = {
      updatedAt: 17090930940932,
      status: 'An exporter status',
      anotherField: 'anotherField',
    };

    // Act
    const response = generateClonedExporter(mockExporter);

    // Assert
    expect(response).toEqual({
      ...mockExporter,
      updatedAt: Date.now(),
      status: exporterStatus(mockExporter),
    });
  });
});
