const { sanitiseFeedbackResponse, sanitiseValue } = require('./sanitise-feedback-response');

describe('sanitise-feedback-response', () => {
  describe('sanitiseValue', () => {
    it('should sanitise strings', () => {
      expect(sanitiseValue('<script>alert(1)</script><p>Hello</p>')).toEqual('<p>Hello</p>');
    });

    it('should sanitise nested objects and arrays', () => {
      const input = {
        message: '<b>Hi</b>',
        nested: {
          details: '<img src=x onerror=alert(1) />',
          items: ['<i>one</i>', '<script>two</script><span>two</span>'],
        },
      };

      const expected = {
        message: '<b>Hi</b>',
        nested: {
          details: '',
          items: ['<i>one</i>', '<span>two</span>'],
        },
      };

      expect(sanitiseValue(input)).toEqual(expected);
    });

    it('should return numbers unchanged', () => {
      expect(sanitiseValue(123)).toEqual(123);
    });

    it('should return booleans unchanged', () => {
      expect(sanitiseValue(true)).toEqual(true);
    });

    it('should return null unchanged', () => {
      expect(sanitiseValue(null)).toBeNull();
    });

    it('should return undefined unchanged', () => {
      expect(sanitiseValue(undefined)).toBeUndefined();
    });
  });

  describe('sanitiseFeedbackResponse', () => {
    it('should sanitise all top-level and nested values in a feedback response object', () => {
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

      expect(sanitiseFeedbackResponse(body)).toEqual(expected);
    });

    it('should not mutate the original object', () => {
      const body = {
        howCanWeImprove: '<script>alert(1)</script><p>Improve docs</p>',
      };

      sanitiseFeedbackResponse(body);

      expect(body).toEqual({
        howCanWeImprove: '<script>alert(1)</script><p>Improve docs</p>',
      });
    });
  });
});
