import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { when } from 'jest-when';
import { Bank } from '@ukef/dtfs2-common';
import { getBanks } from './get-banks.controller';
import { getAllBanks } from '../../../repositories/banks-repo';
import { UtilisationReportRepo } from '../../../repositories/utilisation-reports-repo';
import { aBank } from '../../../../test-helpers/test-data';

jest.mock('../../../repositories/banks-repo');

describe('getBanks', () => {
  const findReportingYearsByBankIdSpy = jest.spyOn(UtilisationReportRepo, 'findReportingYearsByBankId');

  beforeEach(() => {
    findReportingYearsByBankIdSpy.mockRejectedValue('Some error');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe.each(['false', undefined])("when the 'includeReportingYears' query is set to '%s'", (includeReportingYears) => {
    const getHttpMocks = () =>
      httpMocks.createMocks({
        query: { includeReportingYears },
      });

    it('responds with a 200 (Ok) and the list of banks without the reporting years', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const banks: Bank[] = [
        { ...aBank(), id: '123' },
        { ...aBank(), id: '456' },
      ];
      jest.mocked(getAllBanks).mockResolvedValue(banks);

      // Act
      await getBanks(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(banks);
      expect(res._isEndCalled()).toBe(true);
      expect(findReportingYearsByBankIdSpy).not.toHaveBeenCalled();
    });
  });

  describe("when the 'includeReportingYears' query is set to 'true'", () => {
    const getHttpMocks = () =>
      httpMocks.createMocks({
        query: { includeReportingYears: 'true' },
      });

    it('responds with a 200 (Ok) and the list of banks with the reporting years', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const banks: Bank[] = [
        { ...aBank(), id: '123' },
        { ...aBank(), id: '456' },
      ];
      jest.mocked(getAllBanks).mockResolvedValue(banks);

      when(findReportingYearsByBankIdSpy)
        .calledWith('123')
        .mockResolvedValue(new Set([2021, 2022]));
      when(findReportingYearsByBankIdSpy)
        .calledWith('456')
        .mockResolvedValue(new Set([2022, 2023, 2024]));

      const banksWithReportingYears = [
        { ...banks[0], reportingYears: [2021, 2022] },
        { ...banks[1], reportingYears: [2022, 2023, 2024] },
      ];

      // Act
      await getBanks(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(res._getData()).toEqual(banksWithReportingYears);
      expect(res._isEndCalled()).toBe(true);
    });
  });
});
