const payloadVerification = require('./payload');

describe('payloadVerification', () => {
  // Tests that the function returns false when both payload and template are empty
  it('should return false when both payload and template are empty', () => {
    const payload = {};
    const template = {};
    const result = payloadVerification(payload, template);
    expect(result).toBe(false);
  });

  // Tests that the function returns false when payload is empty
  it('should return false when payload is empty', () => {
    const payload = {};
    const template = { name: String };
    const result = payloadVerification(payload, template);
    expect(result).toBe(false);
  });

  // Tests that the function returns false when template is empty
  it('should return false when template is empty', () => {
    const payload = { name: 'First' };
    const template = {};
    const result = payloadVerification(payload, template);
    expect(result).toBe(false);
  });

  // Tests that the function returns false when payload and template have different properties and data types
  it('should return false when payload and template have different properties and data types', () => {
    const payload = { name: 'First', age: 30 };
    const template = { name: String, email: String };
    const result = payloadVerification(payload, template);
    expect(result).toBe(false);
  });

  // Tests that the function returns false when payload.address is an object and template.address is a string
  it('should return false when payload.address is an object and template.address is a string', () => {
    const payload = { name: 'First', address: { city: 'London', country: 'UK' } };
    const template = { name: String, address: String };
    const result = payloadVerification(payload, template);
    expect(result).toBe(false);
  });

  // Tests that the function returns true when payload and template have arrays of nested objects with different lengths
  it('should return true when payload and template have arrays of nested objects with different lengths', () => {
    const payload = {
      items: [{ name: 'First' }, { name: 'First', age: 30, address: { city: 'London', postcode: 'AB12 AB' } }],
    };
    const template = { items: Object };
    const result = payloadVerification(payload, template);
    expect(result).toBe(true);
  });

  // Tests that the function returns true when payload and template have the same properties and data types
  it('should return true when payload and template have the same properties and data types', () => {
    const payload = { name: 'First', age: 30 };
    const template = { name: String, age: Number };
    const result = payloadVerification(payload, template);
    expect(result).toBe(true);
  });

  // Tests that the function returns true when payload and template have nested objects with same properties and data types
  it('should return true when payload and template have nested objects with same properties and data types', () => {
    const payload = { name: 'First', address: { city: 'London', state: 'NY' } };
    const template = { name: String, address: Object };
    const result = payloadVerification(payload, template);
    expect(result).toBe(true);
  });

  // Tests that the function returns true when payload and template have arrays with same data types
  it('should return true when payload and template have arrays with same data types', () => {
    const payload = { items: [1, 2, 3] };
    const template = { items: Object };
    const result = payloadVerification(payload, template);
    expect(result).toBe(true);
  });
});
