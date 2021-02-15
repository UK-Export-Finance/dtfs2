import Axios from './axios'

export default function Api (token) {
  Axios.defaults.headers.common['Authorization'] = token

  this.validateToken = async function () {
    const response = await Axios.get('/validate')
    return response.status === 200
  }

  this.getMandatoryCriteria = async function () {
    const response = await Axios.get('/1')
    return response.data
  }
}

