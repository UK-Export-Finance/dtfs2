import axios from 'axios'

// const V = 'v1'
const BASE_URL = 'https://jsonplaceholder.typicode.com/todos'

export default axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
})
