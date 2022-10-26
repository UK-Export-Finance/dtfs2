import validatePartyURN from './partyUrnValidation.validate';

describe('validatePartyURN()', () => {
  it('should return blank object if no validation error - correct input', () => {
    const urn = '123456';

    const response = validatePartyURN(urn);
    expect(response).toEqual({});
  });

  it('should return validation error if partyUrn is empty string', () => {
    const urn = '';

    const response = validatePartyURN(urn);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a correct party URN', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a correct party URN' } });
    expect(response.urn).toEqual('');
  });

  it('should return validation error if partyUrn is 1 number', () => {
    const urn = '1';

    const response = validatePartyURN(urn);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a correct party URN', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a correct party URN' } });
    expect(response.urn).toEqual('1');
  });

  it('should return validation error if partyUrn is a letter', () => {
    const urn = 'AA';

    const response = validatePartyURN(urn);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a correct party URN', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a correct party URN' } });
    expect(response.urn).toEqual('AA');
  });

  it('should return validation error if partyUrn is 2 numbers', () => {
    const urn = '11';

    const response = validatePartyURN(urn);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a correct party URN', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a correct party URN' } });
    expect(response.urn).toEqual('11');
  });

  it('should return validation error if partyUrn is letters and numbers', () => {
    const urn = 'ABC123';

    const response = validatePartyURN(urn);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a correct party URN', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a correct party URN' } });
    expect(response.urn).toEqual('ABC123');
  });

  it('should return validation error if partyUrn has special characters', () => {
    const urn = 'A"1';

    const response = validatePartyURN(urn);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a correct party URN', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a correct party URN' } });
    expect(response.urn).toEqual('A"1');
  });

  it('should return validation error if partyUrn is only special characters', () => {
    const urn = '"!£!"£!"£!"£';

    const response = validatePartyURN(urn);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a correct party URN', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a correct party URN' } });
    expect(response.urn).toEqual('"!£!"£!"£!"£');
  });

  it('should return validation error if partyUrn is letters and numbers', () => {
    const urn = '12C';

    const response = validatePartyURN(urn);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a correct party URN', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a correct party URN' } });
    expect(response.urn).toEqual('12C');
  });

  it('should return validation error if partyUrn is correct length of numbers but has a special character', () => {
    const urn = '12345!';

    const response = validatePartyURN(urn);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a correct party URN', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a correct party URN' } });
    expect(response.urn).toEqual('12345!');
  });
});
