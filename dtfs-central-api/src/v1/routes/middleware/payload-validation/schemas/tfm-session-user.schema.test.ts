import { ObjectId } from 'mongodb';
import { TfmSessionUser } from '../../../../../types/tfm/tfm-session-user';
import { aTfmSessionUser } from '../../../../../../test-helpers';
import { TfmSessionUserSchema } from './tfm-session-user.schema';

describe('tfm-session-user.schema', () => {
  describe('TfmSessionUserSchema', () => {
    it("sets the 'success' property to true when the user 'username' is a string", () => {
      // Arrange
      const username = 'some-user';
      const user = { ...aTfmSessionUser(), username };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(true);
    });

    it("sets the 'success' property to false when the user 'username' is not a string", () => {
      // Arrange
      const username = 10;
      const user = { ...aTfmSessionUser(), username };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(false);
    });

    it("sets the 'success' property to true when the user 'email' is a valid email string", () => {
      // Arrange
      const email = 'some-user@test.com';
      const user = { ...aTfmSessionUser(), email };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(true);
    });

    it("sets the 'success' property to false when the user 'email' is a string but not an email", () => {
      // Arrange
      const email = 'user';
      const user = { ...aTfmSessionUser(), email };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(false);
    });

    it("sets the 'success' property to false when the user 'email' is not a string", () => {
      // Arrange
      const email = 10;
      const user = { ...aTfmSessionUser(), email };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(false);
    });

    it("sets the 'success' property to true when the user 'timezone' is a string", () => {
      // Arrange
      const timezone = 'London';
      const user = { ...aTfmSessionUser(), timezone };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(true);
    });

    it("sets the 'success' property to false when the user 'timezone' is not a string", () => {
      // Arrange
      const timezone = 10;
      const user = { ...aTfmSessionUser(), timezone };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(false);
    });

    it("sets the 'success' property to true when the user 'firstName' is a string", () => {
      // Arrange
      const firstName = 'Test';
      const user = { ...aTfmSessionUser(), firstName };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(true);
    });

    it("sets the 'success' property to false when the user 'firstName' is not a string", () => {
      // Arrange
      const firstName = 10;
      const user = { ...aTfmSessionUser(), firstName };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(false);
    });

    it("sets the 'success' property to true when the user 'lastName' is a string", () => {
      // Arrange
      const lastName = 'London';
      const user = { ...aTfmSessionUser(), lastName };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(true);
    });

    it("sets the 'success' property to false when the user 'lastName' is not a string", () => {
      // Arrange
      const lastName = 10;
      const user = { ...aTfmSessionUser(), lastName };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(false);
    });

    it("sets the 'success' property to true when the user 'status' is a string", () => {
      // Arrange
      const status = 'active';
      const user = { ...aTfmSessionUser(), status };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(true);
    });

    it("sets the 'success' property to false when the user 'status' is not a string", () => {
      // Arrange
      const status = 10;
      const user = { ...aTfmSessionUser(), status };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(false);
    });

    it("sets the 'success' property to true when the user 'lastLogin' is undefined", () => {
      // Arrange
      const lastLogin = undefined;
      const user = { ...aTfmSessionUser(), lastLogin };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(true);
    });

    it("sets the 'success' property to true when the user 'lastLogin' is a number", () => {
      // Arrange
      const lastLogin = 10;
      const user = { ...aTfmSessionUser(), lastLogin };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(true);
    });

    it("sets the 'success' property to false when the user 'lastLogin' is not a number", () => {
      // Arrange
      const lastLogin = '10';
      const user = { ...aTfmSessionUser(), lastLogin };

      // Act
      const { success } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(success).toEqual(false);
    });

    it("sets the 'data' property to the parsed user", () => {
      // Arrange
      const user: TfmSessionUser = {
        username: 'some-user',
        email: 'some-user@test.com',
        teams: [],
        status: 'active',
        timezone: 'London',
        firstName: 'Some',
        lastName: 'User',
        _id: new ObjectId().toString(),
        lastLogin: 10,
      };

      // Act
      const { data } = TfmSessionUserSchema.safeParse(user);

      // Assert
      expect(data).toEqual(user);
    });
  });
});
