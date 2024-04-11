import { generatePortalUserInformation, generateSystemUserInformation, generateTfmUserInformation } from './generateUserInformation';

describe('generateSystemUserInformation', () => {
  it('generates the correct object', () => {
    const userInformation = generateSystemUserInformation();

    expect(userInformation).toEqual({
      userType: 'system',
    });
  });
});

describe('generatePortalUserInformation', () => {
  it('generates the correct object', () => {
    const userInformation = generatePortalUserInformation('1234567890abcdef12345678');

    expect(userInformation).toEqual({
      userType: 'portal',
      id: '1234567890abcdef12345678',
    });
  });
});

describe('generateSystemUserInformation', () => {
  it('generates the correct object', () => {
    const userInformation = generateTfmUserInformation('1234567890abcdef12345678');

    expect(userInformation).toEqual({
      userType: 'tfm',
      id: '1234567890abcdef12345678',
    });
  });
});
