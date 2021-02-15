const httpError = require('http-errors')

const parseBool = (params) => {
  return !(
    params === "false" ||
    params === "0" ||
    params === "" ||
    params === undefined
  )
}

const userToken = (req) => {
  const { userToken } = req.session;
  return userToken
}

const errorHandler = (error) => {
  if (error.code === 'ECONNABORTED') {
    return httpError(501, 'Request timed out.')
  }

  return httpError(error.response.status, error.response.statusText)
}

export {
  parseBool,
  userToken,
  errorHandler
}
