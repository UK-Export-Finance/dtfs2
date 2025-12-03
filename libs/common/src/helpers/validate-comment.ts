/**
 * 400 characters maximum allowed length for comments.
 * @constant {number}
 */
export const COMMENT_MAX_LENGTH = 400;

/**
 * Validates a comment by trimming whitespace and checking length against the maximum allowed by:
 * - Removing leading and trailing whitespace
 * - Validating against the maximum character limit
 *
 * @param {string | undefined} comment
 * @returns {{ isValid: boolean; trimmedComment: string; error?: string }}
 *   - isValid: Whether the comment passes validation
 *   - trimmedComment: The comment with whitespace trimmed (empty string if undefined/null)
 *   - error: Error message if validation fails (only present when isValid is false)
 */
export const validateComment = (
  comment: string | undefined,
): {
  isValid: boolean;
  trimmedComment: string;
  error?: string;
} => {
  const trimmedComment = comment?.trim() || '';

  if (trimmedComment.length > COMMENT_MAX_LENGTH) {
    return {
      isValid: false,
      trimmedComment,
      error: `You have entered more than ${COMMENT_MAX_LENGTH} characters`,
    };
  }

  return { isValid: true, trimmedComment };
};
