import validatePartyURN from './partyUrnValidation.validate';

describe('validatePartyURN()', () => {
  const partyUrnParams = {
    urnValue: '123456',
    partyUrnRequired: true,
    index: null,
    partyType: 'exporter',
    urnValidationErrors: [],
  };

  it('should return blank object if no validation error - correct input', () => {
    const response = validatePartyURN(partyUrnParams);
    expect(response).toEqual({});
  });

  it('should return validation error if partyUrn is empty string and partyUrnRequired', () => {
    partyUrnParams.urnValue = '';
    partyUrnParams.partyType = 'buyer';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a unique reference number', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a unique reference number' } });
    expect(response.urn).toEqual('');
  });

  it('should return validation error if partyUrn is null and partyUrnRequired', () => {
    partyUrnParams.urnValue = null;
    partyUrnParams.partyType = 'buyer';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a unique reference number', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a unique reference number' } });
    expect(response.urn).toEqual(null);
  });

  it('should return validation error if partyUrn is undefined and partyUrnRequired', () => {
    partyUrnParams.urnValue = undefined;
    partyUrnParams.partyType = 'buyer';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a unique reference number', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a unique reference number' } });
    expect(response.urn).toEqual(undefined);
  });

  it('should return empty object if partyUrn is empty string and partyUrnRequired is false', () => {
    partyUrnParams.partyUrnRequired = false;
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response).toEqual({});
  });

  it('should return validation error if partyUrn is 1 number', () => {
    partyUrnParams.urnValue = '1';
    partyUrnParams.partyType = 'agent';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a minimum of 3 numbers' } });
    expect(response.urn).toEqual('1');
  });

  it('should return validation error if partyUrn is a letter', () => {
    partyUrnParams.urnValue = 'AA';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a minimum of 3 numbers' } });
    expect(response.urn).toEqual('AA');
  });

  it('should return validation error if partyUrn is 2 numbers', () => {
    partyUrnParams.urnValue = '11';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a minimum of 3 numbers' } });
    expect(response.urn).toEqual('11');
  });

  it('should return validation error if partyUrn is letters and numbers', () => {
    partyUrnParams.urnValue = 'ABC123';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a minimum of 3 numbers' } });
    expect(response.urn).toEqual('ABC123');
  });

  it('should return validation error if partyUrn has special characters', () => {
    partyUrnParams.urnValue = 'A"1';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a minimum of 3 numbers' } });
    expect(response.urn).toEqual('A"1');
  });

  it('should return validation error if partyUrn is only special characters', () => {
    partyUrnParams.urnValue = '"!£!"£!"£!"£';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a minimum of 3 numbers' } });
    expect(response.urn).toEqual('"!£!"£!"£!"£');
  });

  it('should return validation error if partyUrn is letters and numbers', () => {
    partyUrnParams.urnValue = '12C';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a minimum of 3 numbers' } });
    expect(response.urn).toEqual('12C');
  });

  it('should return validation error if partyUrn is correct length of numbers but has a special character', () => {
    partyUrnParams.urnValue = '12345!';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a minimum of 3 numbers' } });
    expect(response.urn).toEqual('12345!');
  });

  it('should return validation error if partyUrn is a space', () => {
    partyUrnParams.urnValue = ' ';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ partyUrn: { text: 'Enter a minimum of 3 numbers' } });
    expect(response.urn).toEqual(' ');
  });

  it('should not return validation error if partyUrn is blank and partyType is bondBeneficiaryPartyUrn', () => {
    partyUrnParams.urnValue = '';
    partyUrnParams.partyUrnRequired = null;
    partyUrnParams.index = 1;
    partyUrnParams.partyType = 'bondBeneficiaryPartyUrn';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response).toEqual({});
  });

  it('should not return validation error if partyUrn is blank and partyType is bondIssuerPartyUrn', () => {
    partyUrnParams.urnValue = '';
    partyUrnParams.partyUrnRequired = null;
    partyUrnParams.index = 1;
    partyUrnParams.partyType = 'bondIssuerPartyUrn';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response).toEqual({});
  });

  it('should not return validation error if partyUrn is valid and partyType is bondBeneficiaryPartyUrn', () => {
    partyUrnParams.urnValue = '1121';
    partyUrnParams.partyUrnRequired = null;
    partyUrnParams.index = 1;
    partyUrnParams.partyType = 'bondBeneficiaryPartyUrn';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response).toEqual({});
  });

  it('should not return validation error if partyUrn is valid and partyType is bondIssuerPartyUrn', () => {
    partyUrnParams.urnValue = '1234';
    partyUrnParams.partyUrnRequired = null;
    partyUrnParams.index = 1;
    partyUrnParams.partyType = 'bondIssuerPartyUrn';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response).toEqual({});
  });

  it('should return validation error if partyUrn is a single number and partyType is bondBeneficiaryPartyUrn with partyUrnId with index in error', () => {
    partyUrnParams.urnValue = '1';
    partyUrnParams.partyUrnRequired = null;
    partyUrnParams.index = 2;
    partyUrnParams.partyType = 'bondBeneficiaryPartyUrn';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn-2' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ 'partyUrn-2': { text: 'Enter a minimum of 3 numbers' } });
    expect(response.urn).toEqual('1');
  });

  it('should return validation error if partyUrn is single number and partyType is bondIssuerPartyUrn with partyUrnId with index in error', () => {
    partyUrnParams.urnValue = '1';
    partyUrnParams.partyUrnRequired = null;
    partyUrnParams.index = 1;
    partyUrnParams.partyType = 'bondIssuerPartyUrn';
    partyUrnParams.urnValidationErrors = [];

    const response = validatePartyURN(partyUrnParams);
    expect(response.errorsObject.errors.errorSummary).toEqual([{ text: 'Enter a minimum of 3 numbers', href: '#partyUrn-1' }]);
    expect(response.errorsObject.errors.fieldErrors).toEqual({ 'partyUrn-1': { text: 'Enter a minimum of 3 numbers' } });
    expect(response.urn).toEqual('1');
  });
});
