const adminFromUkefOnly = require('./admin-from-ukef-only');
const { MAKER, PAYMENT_REPORT_OFFICER, ADMIN } = require('../../../roles/roles');

const error = [
  {
    roles: {
      order: '1',
      text: 'The admin role can only be associated with a UKEF email address',
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

describe('adminFromUkefOnly', () => {
  describe('with an admin role', () => {
    const mockRoles = [MAKER, PAYMENT_REPORT_OFFICER, ADMIN];

    describe('New user', () => {
      it('should throw an error with a non UKEF email address', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          email: 'maker1@example.com',
        };

        // Act
        const response = adminFromUkefOnly(null, mockUser);

        // Assert
        expect(response).toStrictEqual(error);
      });

      it('should not throw an error with a UKEF email address', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          email: 'maker1@ukexportfinance.gov.uk',
        };

        // Act
        const response = adminFromUkefOnly(null, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });
    });

    describe('Existing user', () => {
      it('should throw an error with a non UKEF email address', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          updateEmail: 'maker1@example.com',
        };

        // Act
        const response = adminFromUkefOnly(existingUser, mockUser);

        // Assert
        expect(response).toStrictEqual(error);
      });

      it('should not throw an error with a UKEF email address', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          updateEmail: 'maker1@ukexportfinance.gov.uk',
        };

        // Act
        const response = adminFromUkefOnly(existingUser, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });
    });
  });

  describe('without an admin role', () => {
    const mockRoles = [MAKER, PAYMENT_REPORT_OFFICER];
    const invalidRoles = [undefined, null, [], {}, ''];

    describe('New user', () => {
      it.each(invalidRoles)('should throw an error with an invalid role %o', (roles) => {
        // Arrange
        const mockUser = {
          roles,
          email: 'maker1@example.com',
        };

        // Act
        const response = adminFromUkefOnly(null, mockUser);

        // Assert
        expect(response).toStrictEqual(error);
      });

      it('should not throw an error with a non UKEF email address', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          email: 'maker1@example.com',
        };

        // Act
        const response = adminFromUkefOnly(null, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });

      it('should not throw an error with a UKEF email address', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          email: 'maker1@ukexportfinance.gov.uk',
        };

        // Act
        const response = adminFromUkefOnly(null, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });
    });

    describe('Existing user', () => {
      it.each(invalidRoles)('should throw an error with an invalid role %o', (roles) => {
        // Arrange
        const mockUser = {
          roles,
          email: 'maker1@example.com',
        };

        // Act
        const response = adminFromUkefOnly(existingUser, mockUser);

        // Assert
        expect(response).toStrictEqual(error);
      });

      it('should not throw an error with a non UKEF email address', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          email: 'maker1@example.com',
        };

        // Act
        const response = adminFromUkefOnly(existingUser, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });

      it('should not throw an error with a UKEF email address', () => {
        // Arrange
        const mockUser = {
          roles: mockRoles,
          email: 'maker1@ukexportfinance.gov.uk',
        };

        // Act
        const response = adminFromUkefOnly(existingUser, mockUser);

        // Assert
        expect(response).toStrictEqual(noError);
      });
    });
  });
});
