const express = require('express')
const routes = express.Router()
const { login, signup, logout } = require('../controllers/authController')

routes.post('/login', login)
routes.post('/signup', signup)
routes.post('/logout', logout)

module.exports = routes;