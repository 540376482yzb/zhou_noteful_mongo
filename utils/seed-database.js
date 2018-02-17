const mongoose = require('mongoose')
const{ MONGODB_URL, TEST_DATABASE_URL} = require('../config')
const Note = require('../models/note')
const Folder = require('../models/folder')
const Tag = require('../models/tag')

const seedNotes = require('../db/seed/notes')
const seedFolders = require('../db/seed/folders')
const seedTags = require('../db/seed/tags')
mongoose.connect(MONGODB_URL)
  .then(()=> mongoose.connection.db.dropDatabase())
  .then(()=> Folder.insertMany(seedFolders))
  .then(()=> Folder.createIndexes())
  .then(()=> Tag.insertMany(seedTags))
  .then(()=> Tag.createIndexes())
  .then(()=> Note.insertMany(seedNotes))
  .then(()=> Note.createIndexes())
  .then(()=> mongoose.disconnect())
  .catch(err => {
    console.error(`Error: ${err.message}`)
    console.error(err)
  })


