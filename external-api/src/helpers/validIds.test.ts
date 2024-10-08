import { areValidUkefIds } from './validIds';
import { UKEF_ID } from '../constants';

const eStoreData = {
  dealId: '6597dffeb5ef5ff4267e5044',
  siteId: '1234567890',
  facilityIdentifiers: [1234567890, 1234567890],
  supportingInformation: [
    {
      documentType: 'test',
      fileName: 'test.docx',
      fileLocationPath: 'directory/',
      parentId: 'abc',
    },
  ],
  exporterName: 'Test',
  buyerName: 'Test',
  dealIdentifier: '1234567890',
  destinationMarket: 'United Kingdom',
  riskMarket: 'United Kingdom',
};

describe('areValidUkefIds', () => {
  it('should return true when dealIdentifier and facilityIdentifiers are present and do not contain temporary IDs and match 10 digit format', () => {
    const result = areValidUkefIds(eStoreData);

    expect(result).toBe(true);
  });

  it('should return false when dealIdentifier and facilityIdentifiers are present and do not contain temporary IDs and do not match 10 digit format', () => {
    const eStoreDataModified = {
      ...eStoreData,
      facilityIdentifiers: [4321, 12345],
      dealIdentifier: '1234',
    };
    const result = areValidUkefIds(eStoreDataModified);

    expect(result).toBe(false);
  });

  it('should return false when dealIdentifier is empty', () => {
    const eStoreDataModified = {
      ...eStoreData,
      dealIdentifier: '',
    };

    const result = areValidUkefIds(eStoreDataModified);

    expect(result).toBe(false);
  });

  it('should return false when facilityIdentifiers is falsy', () => {
    const eStoreDataModified = {
      ...eStoreData,
      facilityIdentifiers: [0],
    };

    const result = areValidUkefIds(eStoreDataModified);

    expect(result).toBe(false);
  });

  it('should return false when dealIdentifier contains temporary (pending) ID', () => {
    const eStoreDataModified = {
      ...eStoreData,
      dealIdentifier: UKEF_ID.PENDING,
    };

    const result = areValidUkefIds(eStoreDataModified);

    expect(result).toBe(false);
  });

  it('should return false when dealIdentifier contains test ID', () => {
    const eStoreDataModified = {
      ...eStoreData,
      dealIdentifier: UKEF_ID.TEST,
    };

    const result = areValidUkefIds(eStoreDataModified);

    expect(result).toBe(false);
  });

  it('should return false when facilityIdentifiers contain test ID and a valid ID', () => {
    const eStoreDataModified = {
      ...eStoreData,
      facilityIdentifiers: [Number(UKEF_ID.TEST), 1234567890],
    };

    const result = areValidUkefIds(eStoreDataModified);

    expect(result).toBe(false);
  });

  it('should return false when facilityIdentifiers contain temporary (pending) ID', () => {
    const eStoreDataModified = {
      ...eStoreData,
      facilityIdentifiers: [Number(UKEF_ID.PENDING), 1234567890],
    };

    const result = areValidUkefIds(eStoreDataModified);

    expect(result).toBe(false);
  });

  it('should return false when facilityIdentifiers contain test and pending ID', () => {
    const eStoreDataModified = {
      ...eStoreData,
      facilityIdentifiers: [Number(UKEF_ID.TEST), Number(UKEF_ID.PENDING)],
    };

    const result = areValidUkefIds(eStoreDataModified);

    expect(result).toBe(false);
  });
});
