const axios = require('axios');

const login = (user) => {
  return new Promise( (resolve, reject) => {
    axios.post(`http://localhost:5001/v1/login`, user)
      .then( (response) => {
        resolve(response.data.token);
      })
      .catch( (err) => { reject(err); })
  });
};

const updateStatus = async (user, id, updateStatus) => {
  const token = await login(user);

  const {status, data} = axios({
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      'Authorization': token || ''
    },
    data: updateStatus,
    url: `http://localhost:5001/v1/deals/${id}/status`,
  });

  console.log(JSON.stringify(data));
};

module.exports = {
  updateStatus
};
