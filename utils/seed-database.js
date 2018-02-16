const mongoose = require('mongoose')
const{ MONGODB_URL, TEST_DATABASE_URL} = require('../config')
const Note = require('../models/note')
const Folder = require('../models/folder')

const seedNotes = require('../db/seed/notes')
const seedFolders = require('../db/seed/folders')
mongoose.connect(TEST_DATABASE_URL)
  .then(()=> mongoose.connection.db.dropDatabase())
  .then(()=> Folder.insertMany(seedFolders))
  .then(()=> Note.insertMany(seedNotes))
  .then(()=> Note.createIndexes())
  .then(()=> Folder.createIndexes())
  .then(()=> mongoose.disconnect())
  .catch(err => {
    console.error(`Error: ${err.message}`)
    console.error(err)
  })


