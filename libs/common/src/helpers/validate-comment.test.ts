import { validateComment, COMMENT_MAX_LENGTH } from './validate-comment';

describe('validate-comment', () => {
  describe('COMMENT_MAX_LENGTH', () => {
    it('should be 400', () => {
      expect(COMMENT_MAX_LENGTH).toEqual(400);
    });
  });

  describe('validateComment', () => {
    describe('when comment is valid', () => {
      it('should return isValid true for a comment under the limit', () => {
        // Arrange
        const comment = 'This is a valid comment';

        // Act
        const result = validateComment(comment);

        // Assert
        expect(result).toEqual({
          isValid: true,
          trimmedComment: 'This is a valid comment',
        });
      });

      it('should return isValid true for a comment exactly at the limit', () => {
        // Arrange
        const comment = 'a'.repeat(COMMENT_MAX_LENGTH);

        // Act
        const result = validateComment(comment);

        // Assert
        expect(result).toEqual({
          isValid: true,
          trimmedComment: comment,
        });
      });

      it('should treat empty string as no comment (same as undefined)', () => {
        // Arrange
        const comment = '';

        // Act
        const result = validateComment(comment);

        // Assert
        expect(result).toEqual({
          isValid: true,
          trimmedComment: '',
        });
      });

      it('should treat undefined as no comment (returns empty string)', () => {
        // Arrange
        const comment = undefined;

        // Act
        const result = validateComment(comment);

        // Assert
        expect(result).toEqual({
          isValid: true,
          trimmedComment: '',
        });
      });

      it('should trim leading and trailing whitespace and return isValid true', () => {
        // Arrange
        const comment = '  Valid comment with spaces  ';

        // Act
        const result = validateComment(comment);

        // Assert
        expect(result).toEqual({
          isValid: true,
          trimmedComment: 'Valid comment with spaces',
        });
      });

      it('should trim whitespace-only comment to empty string (treated as no comment)', () => {
        // Arrange
        const comment = '     ';

        // Act
        const result = validateComment(comment);

        // Assert
        expect(result).toEqual({
          isValid: true,
          trimmedComment: '',
        });
      });

      it('should accept comment that becomes valid after trimming whitespace', () => {
        // Arrange
        const validComment = 'a'.repeat(398);
        const commentWithWhitespace = `  ${validComment}  `;

        // Act
        const result = validateComment(commentWithWhitespace);

        // Assert
        expect(result).toEqual({
          isValid: true,
          trimmedComment: validComment,
        });
      });
    });

    describe('when comment is invalid', () => {
      it('should return isValid false for a comment over the limit', () => {
        // Arrange
        const comment = 'a'.repeat(COMMENT_MAX_LENGTH + 1);

        // Act
        const result = validateComment(comment);

        // Assert
        expect(result).toEqual({
          isValid: false,
          trimmedComment: comment,
          error: `You have entered more than ${COMMENT_MAX_LENGTH} characters`,
        });
      });

      it('should reject comment that is over limit after trimming', () => {
        // Arrange
        const longComment = 'a'.repeat(COMMENT_MAX_LENGTH + 1);
        const commentWithWhitespace = `  ${longComment}  `;

        // Act
        const result = validateComment(commentWithWhitespace);

        // Assert
        expect(result).toEqual({
          isValid: false,
          trimmedComment: longComment,
          error: `You have entered more than ${COMMENT_MAX_LENGTH} characters`,
        });
      });
    });

    describe('edge cases', () => {
      it('should trim but preserve internal whitespace', () => {
        // Arrange
        const comment = '  Multiple   spaces   between   words  ';

        // Act
        const result = validateComment(comment);

        // Assert
        expect(result).toEqual({
          isValid: true,
          trimmedComment: 'Multiple   spaces   between   words',
        });
      });
    });
  });
});
