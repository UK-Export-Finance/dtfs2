const extractSessionCookie = (res) => res.headers['set-cookie'].pop().split(';')[0];

module.exports = extractSessionCookie;
