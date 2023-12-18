import httpMocks from 'node-mocks-http';
import { validateParamIsIsoMonth } from '.';
// import * as dateModule from '../../helpers/date';

console.error = jest.fn();

describe('validateParamIsIsoMonth', () => {
  // it('extracts the correct parameter from the request', () => {
  //   // Arrange
  //   const isValidIsoMonthSpy = jest.spyOn(dateModule, 'isValidIsoMonth').mockReturnValue(true);

  //   const submissionMonth = '2023-12';
  //   const bankId = '123';
  //   const { req, res } = httpMocks.createMocks({
  //     params: { submissionMonth, bankId },
  //   });
  //   const next = jest.fn();

  //   // Act
  //   validateParamIsIsoMonth('submissionMonth')(req, res, next);

  //   // Assert
  //   expect(next).toHaveBeenCalled();
  //   expect(isValidIsoMonthSpy).toHaveBeenCalledWith(submissionMonth);
  // });

  it('redirects to /not-found if the queried parameter is not in the request', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks();
    const next = jest.fn();

    // Act
    validateParamIsIsoMonth('submissionMonth')(req, res, next);

    // Assert
    // eslint-disable-next-line no-underscore-dangle
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects to /not-found if the submission month is not valid', () => {
    // Arrange
    const submissionMonth = 'March 2023';
    const { req, res } = httpMocks.createMocks({
      params: { submissionMonth },
    });
    const next = jest.fn();

    // Act
    validateParamIsIsoMonth('submissionMonth')(req, res, next);

    // Assert
    // eslint-disable-next-line no-underscore-dangle
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(next).not.toHaveBeenCalled();
  });

  it('calls the next function if the month is a valid ISO month', () => {
    // Arrange
    const submissionMonth = '2023-12';
    const { req, res } = httpMocks.createMocks({
      params: { submissionMonth },
    });
    const next = jest.fn();

    // Act
    validateParamIsIsoMonth('submissionMonth')(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
  });
});
