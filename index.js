const express = require('express')
const app = express()

const HOST = '0.0.0.0';
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => res.redirect('/home.html'))
app.use(express.static('static'))

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))