exports.mongoStatus = (response) => {
  let status = 200;
  if (response.ok) {
    if (!response.value) {
      status = 204;
    }
  } else {
    status = 500;
  }
  return status;
};
