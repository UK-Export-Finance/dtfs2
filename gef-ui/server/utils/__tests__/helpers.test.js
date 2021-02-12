const { userToken, parseBool } = require('../helpers');

describe('userToken()', () => {
  it('returns the correct user token', () => {
    const MOCK_REQ = {
      session: {
        userToken: '1234'
      }
    }

    expect(userToken(MOCK_REQ)).toEqual('1234')
  })
})

describe('parseBool()', () => {
  it('returns a boolean', () => {
    expect(parseBool('true')).toBeTruthy()
    expect(parseBool('false')).toBeFalsy()
    expect(parseBool('')).toBeFalsy()
    expect(parseBool(undefined)).toBeFalsy()
    expect(parseBool('0')).toBeFalsy()
  })
})
