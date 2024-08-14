import { ObjectId } from 'mongodb';
import axios from 'axios';
import { Bank, MonthAndYear, UtilisationReportEntity, UtilisationReportEntityMockBuilder, UtilisationReportReconciliationStatus } from '@ukef/dtfs2-common';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { aBank } from '../../../test-helpers/test-data';
import { mongoDbClient } from '../../../src/drivers/db-client';

const BASE_URL = '/v1/bank';

describe(`GET ${BASE_URL}`, () => {
  const BANK_ID_ONE = '123';
  const BANK_ID_TWO = '456';
  const MOCK_BANKS: Bank[] = [
    { ...aBank(), id: BANK_ID_ONE, _id: new ObjectId() },
    { ...aBank(), id: BANK_ID_TWO, _id: new ObjectId() },
  ];

  beforeEach(async () => {
    await wipeDB.wipe(['banks']);
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertMany(MOCK_BANKS);
  });

  afterAll(async () => {
    await wipeDB.wipe(['banks']);
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  describe.each([false, undefined])("when the 'includeReportingYears' query is set to '%s'", (includeReportingYears) => {
    it('responds with a 200 (Ok) and all banks without reporting years', async () => {
      // Arrange
      const requestUrl = axios.getUri({
        url: BASE_URL,
        params: { includeReportingYears },
      });

      const banks = MOCK_BANKS.map((bank) => ({ ...bank, _id: bank._id.toString() }));

      // Act
      const response = await testApi.get(requestUrl);

      // Assert
      expect(response.status).toBe(axios.HttpStatusCode.Ok);
      expect(response.body).toEqual(banks);
    });
  });

  describe("when the 'includeReportingYears' query is set to 'true'", () => {
    const reportIdGenerator = idGenerator();

    const aUtilisationReportForStatusBankIdAndMonthlyReportPeriod = (
      status: UtilisationReportReconciliationStatus,
      bankId: string,
      monthAndYear: MonthAndYear,
    ): UtilisationReportEntity =>
      UtilisationReportEntityMockBuilder.forStatus(status)
        .withId(reportIdGenerator.next().value)
        .withBankId(bankId)
        .withReportPeriod({
          start: monthAndYear,
          end: monthAndYear,
        })
        .build();

    it('responds with a 200 (Ok) and all banks with reporting years', async () => {
      // Arrange
      const requestUrl = axios.getUri({
        url: BASE_URL,
        params: { includeReportingYears: true },
      });

      const utilisationReports = [
        aUtilisationReportForStatusBankIdAndMonthlyReportPeriod('PENDING_RECONCILIATION', BANK_ID_ONE, { month: 1, year: 2021 }),
        aUtilisationReportForStatusBankIdAndMonthlyReportPeriod('PENDING_RECONCILIATION', BANK_ID_ONE, { month: 2, year: 2021 }),
        aUtilisationReportForStatusBankIdAndMonthlyReportPeriod('PENDING_RECONCILIATION', BANK_ID_ONE, { month: 2, year: 2022 }),
        aUtilisationReportForStatusBankIdAndMonthlyReportPeriod('PENDING_RECONCILIATION', BANK_ID_TWO, { month: 1, year: 2020 }),
        aUtilisationReportForStatusBankIdAndMonthlyReportPeriod('REPORT_NOT_RECEIVED', BANK_ID_TWO, { month: 1, year: 2022 }), // report exists but was not submitted
        aUtilisationReportForStatusBankIdAndMonthlyReportPeriod('PENDING_RECONCILIATION', BANK_ID_TWO, { month: 1, year: 2023 }),
      ];
      await SqlDbHelper.saveNewEntries('UtilisationReport', utilisationReports);

      const banksWithReportingYears = [
        { ...MOCK_BANKS[0], _id: MOCK_BANKS[0]._id.toString(), reportingYears: [2021, 2022] },
        { ...MOCK_BANKS[1], _id: MOCK_BANKS[1]._id.toString(), reportingYears: [2020, 2023] },
      ];

      // Act
      const response = await testApi.get(requestUrl);

      // Assert
      expect(response.status).toBe(axios.HttpStatusCode.Ok);
      expect(response.body).toEqual(banksWithReportingYears);
    });
  });

  function* idGenerator(): Generator<number, number, unknown> {
    let id = 1;
    while (true) {
      yield id;
      id += 1;
    }
  }
});
