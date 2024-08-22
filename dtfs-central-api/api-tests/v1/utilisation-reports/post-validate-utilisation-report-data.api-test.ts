import { HttpStatusCode } from 'axios';
import { testApi } from '../../test-api';

console.error = jest.fn();

const URL = '/v1/utilisation-reports/validate';

describe(`POST ${URL}`, () => {
  it('returns a 200 when request body is valid', async () => {
    // Arrange
    const requestBody = {
      reportData: [{ 'a csv header': { value: null, row: '2', column: 'C' } }],
    };

    // Act
    const response = await testApi.post(requestBody).to(URL);

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
  });

  it("returns a 400 when the 'reportData' field is missing fom request body", async () => {
    // Arrange
    const requestBody = {};

    // Act
    const response = await testApi.post(requestBody).to(URL);

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the 'reportData' items are not csv rows", async () => {
    // Arrange
    const requestBody = {
      reportData: [{ 'a key': 'this is not cell data' }],
    };

    // Act
    const response = await testApi.post(requestBody).to(URL);

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });
});
