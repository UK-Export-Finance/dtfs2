import { sanitise } from '.';

describe('helper/sanitise-environment/sanitise', () => {
  it('should return the input string if it is undefined', () => {
    const input = undefined;
    const result = sanitise(input);
    expect(result).toBe(input);
  });

  it('should replace all occurrences of `\\\n` with `\n` in the input string', () => {
    const input = 'Hello\\\nWorld\\\n';
    const result = sanitise(input);
    expect(result).toBe('Hello\nWorld\n');
  });

  it('should return an empty string if the input string is an empty string', () => {
    const input = '';
    const result = sanitise(input);
    expect(result).toBe('');
  });

  it('should return the input string if it does not contain `\\\n`', () => {
    const input = 'Hello World';
    const result = sanitise(input);
    expect(result).toBe(input);
  });

  it('should return the input string with `\\\n` replaced by `\n` even if there are multiple occurrences in the string', () => {
    const input = 'Hello\\\nWorld\\\n!';
    const result = sanitise(input);
    expect(result).toBe('Hello\nWorld\n!');
  });

  it('should handle input strings with leading and trailing spaces correctly', () => {
    const input = '   Hello\\\nWorld   ';
    const result = sanitise(input);
    expect(result).toBe('   Hello\nWorld   ');
  });

  it('should replace all occurrences of `\\n` with `\n` in the input string', () => {
    const input = 'Hello\\nWorld\\n';
    const result = sanitise(input);
    expect(result).toBe('Hello\nWorld\n');
  });

  it('should return an empty string if the input string is an empty string', () => {
    const input = '';
    const result = sanitise(input);
    expect(result).toBe('');
  });

  it('should return the input string if it does not contain `\\n`', () => {
    const input = 'Hello World';
    const result = sanitise(input);
    expect(result).toBe(input);
  });

  it('should return the input string with `\\n` replaced by `\n` even if there are multiple occurrences in the string', () => {
    const input = 'Hello\\nWorld\\n!';
    const result = sanitise(input);
    expect(result).toBe('Hello\nWorld\n!');
  });

  it('should handle input strings with leading and trailing spaces correctly', () => {
    const input = '   Hello\\nWorld   ';
    const result = sanitise(input);
    expect(result).toBe('   Hello\nWorld   ');
  });

  it('should replace all occurrences of `\\\\n` with `\n` in the input string', () => {
    const input = 'Hello\\\\nWorld\\\\n';
    const result = sanitise(input);
    expect(result).toBe('Hello\nWorld\n');
  });

  it('should return an empty string if the input string is an empty string', () => {
    const input = '';
    const result = sanitise(input);
    expect(result).toBe('');
  });

  it('should return the input string if it does not contain `\\\\n`', () => {
    const input = 'Hello World';
    const result = sanitise(input);
    expect(result).toBe(input);
  });

  it('should return the input string with `\\\\n` replaced by `\n` even if there are multiple occurrences in the string', () => {
    const input = 'Hello\\\\nWorld\\\\n!';
    const result = sanitise(input);
    expect(result).toBe('Hello\nWorld\n!');
  });

  it('should handle input strings with leading and trailing spaces correctly', () => {
    const input = '   Hello\\\\nWorld   ';
    const result = sanitise(input);
    expect(result).toBe('   Hello\nWorld   ');
  });

  it('should handle input strings with leading and trailing spaces correctly and with multiple escape characters', () => {
    const input = '   Hello\\\\nThere\nWorld\\n!   ';
    const result = sanitise(input);
    expect(result).toBe('   Hello\nThere\nWorld\n!   ');
  });
});
