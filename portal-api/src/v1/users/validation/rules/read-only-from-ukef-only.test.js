const readOnlyFromUkefOnly = require('./read-only-from-ukef-only');
const { MAKER, PAYMENT_REPORT_OFFICER, READ_ONLY } = require('../../../roles/roles');

const error = [
  {
    roles: {
      order: '1',
      text: 'The read-only role with all Bank can only be associated with a UKEF email address',
    },
  },
];
const noError = [];
const existingUser = {
  'user-status': 'active',
  timezone: 'Europe/London',
  firstname: 'First',
  surname: 'Last',
  email: 'maker1@ukexportfinance.gov.uk',
  username: 'maker1@ukexportfinance.gov.uk',
  roles: [MAKER],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
    emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
    companiesHouseNo: 'UKEF0001',
    partyUrn: '00318345',
  },
  isTrusted: true,
};

describe('readOnlyFromUkefOnly', () => {
  describe('without any role', () => {
    describe('Existing user', () => {
      it('should not throw an error with a non UKEF email address', () => {
        // Arrange
        const mockUser = {
          updateEmail: 'maker1@example.com',
          password: 'AbC!2345',
          passwordConfirm: 'AbC!2345',
        };

        // Act
        const response = readOnlyFromUkefOnly(existingUser, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });

      it('should not throw an error with a UKEF email address', () => {
        // Arrange
        const mockUser = {
          password: 'AbC!2345',
          passwordConfirm: 'AbC!2345',
          updateEmail: 'maker1@ukexportfinance.gov.uk',
        };

        // Act
        const response = readOnlyFromUkefOnly(existingUser, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });
    });
  });

  describe('with a read-only role', () => {
    const mockRoles = [MAKER, PAYMENT_REPORT_OFFICER, READ_ONLY];

    describe('New user', () => {
      it('should throw an error with a non UKEF email address and bank all', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          email: 'maker17777777777@example.com',
          bank: {
            name: 'all',
          },
        };

        // Act
        const response = readOnlyFromUkefOnly(null, mockUser);

        // Assert
        expect(response).toStrictEqual(error);
      });

      it('should not throw an error with a non UKEF email address and Bank 1', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          email: 'maker1@example.com',
          bank: {
            id: '9',
            name: 'Bank 1',
          },
        };

        // Act
        const response = readOnlyFromUkefOnly(null, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });

      it('should not throw an error with a UKEF email address and bank all', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          email: 'maker1@ukexportfinance.gov.uk',
          bank: {
            name: 'all',
          },
        };

        // Act
        const response = readOnlyFromUkefOnly(null, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });
    });

    describe('Existing user', () => {
      it('should throw an error with a non UKEF email address and bank all', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          updateEmail: 'maker1@example.com',
          bank: {
            name: 'all',
          },
        };

        // Act
        const response = readOnlyFromUkefOnly(existingUser, mockUser);

        // Assert
        expect(response).toStrictEqual(error);
      });

      it('should not throw an error with a UKEF email address and Bank 1', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          updateEmail: 'maker1@ukexportfinance.gov.uk',
          bank: {
            id: '9',
            name: 'Bank 1',
          },
        };

        // Act
        const response = readOnlyFromUkefOnly(existingUser, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });

      it('should not throw an error with a UKEF email address and bank all', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          updateEmail: 'maker1@ukexportfinance.gov.uk',
          bank: {
            name: 'all',
          },
        };

        // Act
        const response = readOnlyFromUkefOnly(existingUser, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });
    });
  });
});
