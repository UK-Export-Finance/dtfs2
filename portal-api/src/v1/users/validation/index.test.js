const { MAKER } = require('../../roles/roles');

const { applyCreateRules, applyUpdateRules } = require('./index');
const passwordAtLeast8Characters = require('./rules/passwordAtLeast8Characters');
const passwordAtLeastOneNumber = require('./rules/passwordAtLeastOneNumber');
const passwordAtLeastOneUppercase = require('./rules/passwordAtLeastOneUppercase');
const passwordAtLeastOneLowercase = require('./rules/passwordAtLeastOneLowercase');
const passwordAtLeastOneSpecialCharacter = require('./rules/passwordAtLeastOneSpecialCharacter');
const passwordsCannotBeReUsed = require('./rules/passwordsCannotBeReUsed');
const passwordsMustMatch = require('./rules/passwordsMustMatch');
const currentPasswordMustMatch = require('./rules/currentPasswordMustMatch');
const readOnlyRoleCannotBeAssignedWithOtherRoles = require('./rules/read-only-role-cannot-be-assigned-with-other-roles');
const usernameAndEmailMustMatch = require('./rules/username-and-email-must-match');
const emailMustBeValidEmailAddress = require('./rules/email-must-be-valid-email-address');
const emailMustBeUnique = require('./rules/email-must-be-unique');
const firstNameMustNotBeEmpty = require('./rules/firstName-must-not-be-empty');
const surnameMustNotBeEmpty = require('./rules/surname-must-not-be-empty');
const selectAtLeastOneRole = require('./rules/select-at-least-one-role');
const selectAtLeastOneBank = require('./rules/select-at-least-one-bank');
const adminFromUkefOnly = require('./rules/admin-from-ukef-only');

jest.mock('./rules/passwordAtLeast8Characters');
jest.mock('./rules/passwordAtLeastOneNumber');
jest.mock('./rules/passwordAtLeastOneUppercase');
jest.mock('./rules/passwordAtLeastOneLowercase');
jest.mock('./rules/passwordAtLeastOneSpecialCharacter');
jest.mock('./rules/passwordsCannotBeReUsed');
jest.mock('./rules/passwordsMustMatch');
jest.mock('./rules/currentPasswordMustMatch');
jest.mock('./rules/read-only-role-cannot-be-assigned-with-other-roles');
jest.mock('./rules/username-and-email-must-match');
jest.mock('./rules/email-must-be-valid-email-address');
jest.mock('./rules/email-must-be-unique');
jest.mock('./rules/firstName-must-not-be-empty');
jest.mock('./rules/surname-must-not-be-empty');
jest.mock('./rules/select-at-least-one-role');
jest.mock('./rules/select-at-least-one-bank');
jest.mock('./rules/admin-from-ukef-only');

const mockUser = {
  password: 'ValidPassword1!',
  username: 'maker1@ukexportfinance.gov.uk',
  email: 'maker1@ukexportfinance.gov.uk',
  firstName: 'Maker',
  surname: 'One',
  roles: [MAKER],
  banks: ['bank1'],
};

describe('Validation Rules', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Rules mock returns
    passwordAtLeast8Characters.mockResolvedValue([]);
    passwordAtLeastOneNumber.mockResolvedValue([]);
    passwordAtLeastOneUppercase.mockResolvedValue([]);
    passwordAtLeastOneLowercase.mockResolvedValue([]);
    passwordAtLeastOneSpecialCharacter.mockResolvedValue([]);
    passwordsMustMatch.mockResolvedValue([]);
    passwordsCannotBeReUsed.mockResolvedValue([]);
    readOnlyRoleCannotBeAssignedWithOtherRoles.mockResolvedValue([]);
    usernameAndEmailMustMatch.mockResolvedValue([]);
    emailMustBeValidEmailAddress.mockResolvedValue([]);
    emailMustBeUnique.mockResolvedValue([]);
    firstNameMustNotBeEmpty.mockResolvedValue([]);
    surnameMustNotBeEmpty.mockResolvedValue([]);
    selectAtLeastOneRole.mockResolvedValue([]);
    selectAtLeastOneBank.mockResolvedValue([]);
    adminFromUkefOnly.mockResolvedValue([]);
    currentPasswordMustMatch.mockResolvedValue([]);
  });

  describe('applyCreateRules', () => {
    const candidateChange = {
      ...mockUser,
    };

    it('should apply all create rules', async () => {
      // Act
      await applyCreateRules(candidateChange);

      // Assert
      expect(passwordAtLeast8Characters).toHaveBeenCalledWith(null, candidateChange);
      expect(passwordAtLeastOneNumber).toHaveBeenCalledWith(null, candidateChange);
      expect(passwordAtLeastOneUppercase).toHaveBeenCalledWith(null, candidateChange);
      expect(passwordAtLeastOneLowercase).toHaveBeenCalledWith(null, candidateChange);
      expect(passwordAtLeastOneSpecialCharacter).toHaveBeenCalledWith(null, candidateChange);
      expect(readOnlyRoleCannotBeAssignedWithOtherRoles).toHaveBeenCalledWith(null, candidateChange);
      expect(emailMustBeValidEmailAddress).toHaveBeenCalledWith(null, candidateChange);
      expect(emailMustBeUnique).toHaveBeenCalledWith(null, candidateChange);
      expect(firstNameMustNotBeEmpty).toHaveBeenCalledWith(null, candidateChange);
      expect(surnameMustNotBeEmpty).toHaveBeenCalledWith(null, candidateChange);
      expect(surnameMustNotBeEmpty).toHaveBeenCalledWith(null, candidateChange);
      expect(selectAtLeastOneRole).toHaveBeenCalledWith(null, candidateChange);
      expect(selectAtLeastOneBank).toHaveBeenCalledWith(null, candidateChange);
      expect(adminFromUkefOnly).toHaveBeenCalledWith(null, candidateChange);
    });

    it('should return an error', async () => {
      // Arrange
      usernameAndEmailMustMatch.mockResolvedValue(['Email must be unique']);
      // Act
      const error = await applyCreateRules(candidateChange);

      // Assert
      expect(error).toHaveLength(1);
      expect(error).toEqual(['Email must be unique']);
    });

    it('should return multiple errors', async () => {
      // Arrange
      const nonUkefCandidateChange = {
        ...candidateChange,
        username: 'maker1@exmaple.com',
        email: 'maker1@example.com',
      };

      usernameAndEmailMustMatch.mockResolvedValue(['Email must be unique']);
      adminFromUkefOnly.mockResolvedValue(['The admin role can only be associated with a UKEF email address']);

      // Act
      const errors = await applyCreateRules(nonUkefCandidateChange);

      // Assert
      expect(errors).toHaveLength(2);
      expect(errors).toEqual(['Email must be unique', 'The admin role can only be associated with a UKEF email address']);
    });
  });

  describe('applyUpdateRules', () => {
    const existingUser = {
      ...mockUser,
    };

    // Arrange
    const change = {
      password: 'abc',
      passwordConfirm: 'abc',
    };

    it('should apply all update without current password rules', async () => {
      // Arrange
      const candidateChange = {
        ...change,
        updateEmail: existingUser.username,
      };

      // Act
      await applyUpdateRules(existingUser, change);

      // Assert
      expect(passwordAtLeast8Characters).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordAtLeastOneNumber).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordAtLeastOneUppercase).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordAtLeastOneLowercase).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordAtLeastOneSpecialCharacter).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordsMustMatch).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordsCannotBeReUsed).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(readOnlyRoleCannotBeAssignedWithOtherRoles).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(usernameAndEmailMustMatch).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(emailMustBeValidEmailAddress).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(emailMustBeUnique).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(adminFromUkefOnly).toHaveBeenCalledWith(existingUser, candidateChange);
    });

    it('should apply all update with current password rules', async () => {
      // Arrange
      const currentPasswordChange = {
        ...change,
        currentPassword: 'AbC!2345',
      };

      const candidateChange = {
        ...currentPasswordChange,
        updateEmail: existingUser.username,
      };

      // Act
      await applyUpdateRules(existingUser, currentPasswordChange);

      // Assert
      expect(passwordAtLeast8Characters).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordAtLeastOneNumber).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordAtLeastOneUppercase).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordAtLeastOneLowercase).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordAtLeastOneSpecialCharacter).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordsMustMatch).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordsCannotBeReUsed).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(readOnlyRoleCannotBeAssignedWithOtherRoles).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(usernameAndEmailMustMatch).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(emailMustBeValidEmailAddress).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(emailMustBeUnique).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(adminFromUkefOnly).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(currentPasswordMustMatch).toHaveBeenCalledWith(existingUser, candidateChange);
    });

    it('should apply update rules with new password and throw multiple errors', async () => {
      // Arrange
      const candidateChange = {
        ...change,
        updateEmail: existingUser.username,
      };

      passwordAtLeast8Characters.mockResolvedValue(['Your password must contain at least 8 characters.']);
      passwordAtLeastOneNumber.mockResolvedValue(['Your password must contain at least one numeric character.']);
      passwordAtLeastOneUppercase.mockResolvedValue(['Your password must contain at least one upper-case character.']);
      passwordAtLeastOneSpecialCharacter.mockResolvedValue(['Your password must contain at least one special character.']);

      // Act
      const errors = await applyUpdateRules(existingUser, candidateChange);

      // Assert
      expect(errors).toHaveLength(4);
      expect(errors).toEqual([
        'Your password must contain at least 8 characters.',
        'Your password must contain at least one numeric character.',
        'Your password must contain at least one upper-case character.',
        'Your password must contain at least one special character.',
      ]);
      expect(passwordAtLeast8Characters).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordAtLeastOneNumber).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordAtLeastOneUppercase).toHaveBeenCalledWith(existingUser, candidateChange);
      expect(passwordAtLeastOneSpecialCharacter).toHaveBeenCalledWith(existingUser, candidateChange);
    });
  });
});
