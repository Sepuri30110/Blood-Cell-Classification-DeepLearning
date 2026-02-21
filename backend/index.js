const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

require('dotenv').config({quiet: true});

const port = process.env.PORT

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGO_URI)
    .then(res => {
        console.log('Connected to MongoDB successfully')
    })
    .catch(err => console.log('Error connecting to MongoDB'))

app.listen(port, () => {
    console.log(`Server listening on port : ${port}`)
})