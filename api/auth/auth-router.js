// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const express = require('express')
const User = require('../users/users-model')
const bcrypt = require('bcryptjs')

const router = express.Router()

router.get('/:id', async (req, res, next) => {
  try {
      const user = await User.findById(req.params.id)
      res.json(user)
    } catch (err) {
      next(err)
  }
})

router.post('/register', async (req, res, next) => {
  const { username, password } = req.body
  const hash = bcrypt.hashSync(password, 8)
  const newUser = {
    username: username,
    password: hash
  }
  const dbUser = await User.add(newUser)
  res.status(201).json({
    message: `Greetings, ${username}!`,
    user: dbUser
  })
})

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body
  const user = await User.findBy({ username }).first()

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = user
    res.json(user) 
  } else {
    res.status(401).json({
      message: 'invalid credentials'
    })
  }
})

router.get('/logout', (req, res) => {
  if (req.session && req.session.user) {
    req.session.destroy(err => {
      if (err) {
        res.json({
          message: 'error logging out'
        })
      } else {
        res.json({
          message: 'logged out'
        })
      }
    })
  } else {
    res.json({
      message: 'no session'
    })
  }
})

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */


/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */


/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

 
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router