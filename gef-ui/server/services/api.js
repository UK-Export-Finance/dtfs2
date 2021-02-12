import axios from 'axios'

require('dotenv').config()

const urlRoot = process.env.DEAL_API_URL

const validateToken = async (token) => {
  if (!token) return false

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${urlRoot}/v1/validate`,
  }).catch((err) => err.response)
  return response.status === 200
}

const getMandatoryCriteria = async (token) => {
  if (!token) return false

  const response = await axios({
    method: 'get',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    url: `${urlRoot}/v1/users`,
  })

  return response.data
}



export default {
  validateToken,
  getMandatoryCriteria
}
