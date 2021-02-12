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

export {
  parseBool,
  userToken
}
