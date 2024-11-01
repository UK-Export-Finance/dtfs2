import { exporterStatus } from '../../controllers/validation/exporter';
import { cloneExporter } from './clone-exporter.service';

describe('cloneExporter', () => {
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
    const response = cloneExporter(mockExporter);

    // Assert
    expect(response).toEqual({
      ...mockExporter,
      updatedAt: Date.now(),
      status: exporterStatus(mockExporter),
    });
  });
});
