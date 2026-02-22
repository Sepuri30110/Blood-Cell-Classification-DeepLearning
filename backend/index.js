const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

require('dotenv').config({quiet: true});

const port = process.env.PORT

const app = express()

app.use(cors({
    origin: 'http://localhost:9000', // Frontend URL
    credentials: true // Allow cookies
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

mongoose.connect(process.env.MONGO_URI)
    .then(res => {
        console.log('Connected to MongoDB successfully')
    })
    .catch(err => console.log('Error connecting to MongoDB'))

const {validateToken} = require('./middlewares/validateToken')

const authRoutes = require('./routes/authRoutes')

app.post('/api/validate-token', validateToken)
app.use('/api/auth', authRoutes)

app.listen(port, () => {
    console.log(`Server listening on port : ${port}`)
})