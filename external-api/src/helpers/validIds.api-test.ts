import { areValidUkefIds } from './validIds';

describe('areValidUkefIds', () => {
  it('should return true when dealIdentifier and facilityIdentifiers are present and do not contain temporary IDs and match 10 digit format', () => {
    const eStoreData = {
      dealIdentifier: '1234567890',
      facilityIdentifiers: ['1234567890', '1234567890'],
    };

    const result = areValidUkefIds(eStoreData);

    expect(result).toBe(true);
  });

  it('should return false when dealIdentifier and facilityIdentifiers are present and do not contain temporary IDs and do not match 10 digit format', () => {
    const eStoreData = {
      dealIdentifier: '12345',
      facilityIdentifiers: ['67890', '54321'],
    };

    const result = areValidUkefIds(eStoreData);

    expect(result).toBe(false);
  });

  it('should return false when dealIdentifier is falsy', () => {
    const eStoreData = {
      dealIdentifier: '',
      facilityIdentifiers: ['67890', '54321'],
    };

    const result = areValidUkefIds(eStoreData);

    expect(result).toBe(false);
  });

  it('should return false when facilityIdentifiers is falsy', () => {
    const eStoreData = {
      dealIdentifier: '12345',
      facilityIdentifiers: null,
    };

    const result = areValidUkefIds(eStoreData);

    expect(result).toBe(false);
  });

  it('should return false when dealIdentifier contains temporary ID', () => {
    const eStoreData = {
      dealIdentifier: 'PENDING',
      facilityIdentifiers: ['67890', '54321'],
    };

    const result = areValidUkefIds(eStoreData);

    expect(result).toBe(false);
  });

  it('should return false when dealIdentifier contains temporary ID', () => {
    const eStoreData = {
      dealIdentifier: '100000',
      facilityIdentifiers: ['67890', '54321'],
    };

    const result = areValidUkefIds(eStoreData);

    expect(result).toBe(false);
  });

  it('should return false when facilityIdentifiers contain temporary ID', () => {
    const eStoreData = {
      dealIdentifier: '12345',
      facilityIdentifiers: ['PENDING', '54321'],
    };

    const result = areValidUkefIds(eStoreData);

    expect(result).toBe(false);
  });

  it('should return false when facilityIdentifiers contain temporary ID', () => {
    const eStoreData = {
      dealIdentifier: '12345',
      facilityIdentifiers: ['123', '100000'],
    };

    const result = areValidUkefIds(eStoreData);

    expect(result).toBe(false);
  });

  it('should return false when facilityIdentifiers contain temporary ID', () => {
    const eStoreData = {
      dealIdentifier: '12345',
      facilityIdentifiers: ['100000', '100000'],
    };

    const result = areValidUkefIds(eStoreData);

    expect(result).toBe(false);
  });
});
