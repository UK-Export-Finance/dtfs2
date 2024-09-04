import { HttpStatusCode } from 'axios';
import { testApi } from '../../test-api';

console.error = jest.fn();

const URL = '/v1/utilisation-reports/report-data-validation';

describe(`POST ${URL}`, () => {
  it(`returns a ${HttpStatusCode.Ok} when request body is valid`, async () => {
    // Arrange
    const requestBody = {
      reportData: [{ 'a csv header': { value: null, row: '2', column: 'C' } }],
    };

    // Act
    const response = (await testApi.post(requestBody).to(URL)) as Request;

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
  });

  it(`returns a ${HttpStatusCode.BadRequest} when the 'reportData' field is missing fom request body`, async () => {
    // Arrange
    const requestBody = {};

    // Act
    const response = (await testApi.post(requestBody).to(URL)) as Request;

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it(`returns a ${HttpStatusCode.BadRequest} when the 'reportData' items are not csv rows`, async () => {
    // Arrange
    const requestBody = {
      reportData: [{ 'a key': 'this is not cell data' }],
    };

    // Act
    const response = (await testApi.post(requestBody).to(URL)) as Request;

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });
});
