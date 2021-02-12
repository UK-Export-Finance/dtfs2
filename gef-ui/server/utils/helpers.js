export const parseBool = (params) => {
  return !(
    params === "false" ||
    params === "0" ||
    params === "" ||
    params === undefined
  )
}

export const userToken = (req) => {
  const { userToken } = req.session;
  return userToken
}
