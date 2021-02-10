export const parseBool = (params) => {
  return !(
    params === "false" ||
    params === "0" ||
    params === "" ||
    params === undefined
  )
}
