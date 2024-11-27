const adminFromUkefOnly = require('./admin-from-ukef-only');
const { MAKER, PAYMENT_REPORT_OFFICER, ADMIN } = require('../../../roles/roles');

const error = [
  {
    email: {
      order: '1',
      text: 'Admin role can only be associated with an UKEF email address',
    },
  },
];

const noError = [];

describe('adminFromUkefOnly', () => {
  describe('With an admin role', () => {
    const mockRoles = [MAKER, PAYMENT_REPORT_OFFICER, ADMIN];

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

  describe('Without an admin role', () => {
    const mockRoles = [MAKER, PAYMENT_REPORT_OFFICER];

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
});
