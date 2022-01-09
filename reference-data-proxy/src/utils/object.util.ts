export const objectIsEmpty = (obj: any) => {
  if (!obj) {
    return true;
  }

  if (Object.keys(obj).length === 0 && obj.constructor === Object) {
    return true;
  }

  return false;
};
