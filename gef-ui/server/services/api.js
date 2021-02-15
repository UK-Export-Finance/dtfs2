import Axios from './axios'

export default function Api (token) {
  Axios.defaults.headers.common['Authorization'] = token

  this.validateToken = async function () {
    try {
      const response = await Axios.get('/validate')
      return response.status === 200
    } catch (err) {
      return err.response
    }
  }

  this.getMandatoryCriteria = async function () {
    try {
      // const response = await Axios.get('/mandatory-criteria/latest')
      const response = { 
        data: {
          htmlText: '<p>Test</p>'
        }
      }
      return response.data
    } catch (err) {
      throw err
    }
  }
}

