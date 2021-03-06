'use strict';
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan')
const { PORT, MONGODB_URL, TEST_DATABASE_URL } = require('./config');
const notesRouter = require('./routes/notes');
const foldersRouter = require('./routes/router.folders')
const tagRouter = require('./routes/router.tag')
const userRouter = require('./routes/router.users')
const authRouter = require('./routes/router.auth')
const passport = require('passport')
const localStrategy  = require('./passport/local')
const jwtStrategy = require('./passport/jwt')
// Create an Express application
const app = express();
// Log all requests. Skip logging during
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
  skip: () => process.env.NODE_ENV === 'test'
}));

// Create a static webserver
app.use(express.static('public'));

// Parse request body
app.use(express.json());

//passport deploy local auth  and jwt
passport.use(localStrategy)
passport.use(jwtStrategy)

// mount un-projected routes
app.use('/v3',userRouter)
app.use('/v3',authRouter)

//endpoints below requires tokens

app.use(passport.authenticate('jwt',{session:false, failWithError: true}))
// Mount router on "/api"
app.use('/v3',notesRouter)
app.use('/v3',foldersRouter)
app.use('/v3',tagRouter)


// Catch-all 404
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  })
})

if(require.main === module){
  mongoose.connect(MONGODB_URL)
    .then(instance => {
      const conn = instance.connections[0]
      console.info(`Connected to :mongodb://${conn.host}:${conn.port}/${conn.name}`)
    })
    .catch(err => {
      console.error(`Error :${err.message}`)
      console.error('\n === Did you remember to start `mongod`? === \n')
      console.error(err)
    })
    
  app.listen(PORT, function () {
    console.info(`Server listening on ${this.address().port}`);
  }).on('error', err => {
    console.error(err)
  });
}

module.exports = app

