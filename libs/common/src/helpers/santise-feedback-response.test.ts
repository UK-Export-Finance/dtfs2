import { sanitiseFeedbackResponse } from './sanitise-feedback-response';

describe('sanitiseFeedbackResponse', () => {
  it('should sanitise all top-level and nested values in a feedback response object', () => {
    // Arrange
    const body = {
      role: '<strong>Trader</strong>',
      howCanWeImprove: '<script>alert(1)</script><p>Faster flow</p>',
      metadata: {
        contact: '<a href="javascript:alert(1)">email me</a>',
        ratings: [5, '<b>great</b>'],
      },
    };

    const expected = {
      role: '<strong>Trader</strong>',
      howCanWeImprove: '<p>Faster flow</p>',
      metadata: {
        contact: '<a>email me</a>',
        ratings: [5, '<b>great</b>'],
      },
    };

    // Act
    const result = sanitiseFeedbackResponse(body);

    // Assert
    expect(result).toEqual(expected);
  });

  it('should not mutate the original object', () => {
    // Arrange
    const body = {
      howCanWeImprove: '<script>alert(1)</script><p>Improve docs</p>',
    };

    const expected = {
      howCanWeImprove: '<script>alert(1)</script><p>Improve docs</p>',
    };

    // Act
    sanitiseFeedbackResponse(body);

    // Assert
    expect(body).toEqual(expected);
  });
});
