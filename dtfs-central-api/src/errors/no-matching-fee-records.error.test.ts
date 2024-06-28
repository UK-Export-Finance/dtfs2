import { HttpStatusCode } from 'axios';
import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { NoMatchingFeeRecordsError } from './no-matching-fee-records.error';

describe('NoMatchingFeeRecordsError', () => {
  it('exposes the error message', () => {
    // Act
    const exception = new NoMatchingFeeRecordsError();

    // Assert
    expect(exception.message).toEqual(`No fee records with '${FEE_RECORD_STATUS.MATCH}' status found`);
  });

  it('exposes the 400 (Bad Request) status code', () => {
    // Act
    const error = new NoMatchingFeeRecordsError();

    // Assert
    expect(error.status).toBe(HttpStatusCode.BadRequest);
  });

  it('exposes the name of the exception', () => {
    // Act
    const exception = new NoMatchingFeeRecordsError();

    // Assert
    expect(exception.name).toEqual('NoMatchingFeeRecordsError');
  });
});
