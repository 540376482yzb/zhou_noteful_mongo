'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();
const Note = require('../models/note')
const Folder = require('../models/folder')
const Tag = require('../models/tag')
const mongoose = require('mongoose')
/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {
  const userId = req.user.id
  const {searchTerm,folderId,tagId} = req.query
  const filter = {userId}
  if(searchTerm){filter['$text'] = {$search: searchTerm}}
  if(folderId){filter['folderId'] = folderId}
  if(tagId){filter['tags'] = {$eq: tagId}}
  Note.find(
    filter,
    {score:{$meta:'textScore'}}
  )
    .sort({score:{$meta:'textScore'}})
    .select('title content created folderId tags')
    .populate('tags')
    .then(results => {
      if(results.length) return res.status(200).json(results)
      next()
    })
    .catch(err => next(err))
});
/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  const noteId = req.params.id
  const userId = req.user.id
  if(!mongoose.Types.ObjectId.isValid(noteId)){
    const err = new Error('The `id` is not valid')
    err.status = 400
    return next(err)
  }
  console.log('id:',noteId, 'userId', userId)
  Note.findOne({_id:noteId,userId})
    .select('title content created folderId tags')
    .populate('tags')
    .then(result=> {
      if(!result){
        const err = new Error('The item does not exist')
        err.status = 400
        return next(err)
      }
      return res.status(200).json(result)
    })
    .catch(next)
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {
  const {title, content, folderId, tags} = req.body
  const userId = req.user.id
  const err = validTitle(title)
  if(err) return next(err)
  Note.create({title,content, folderId, tags, userId})
    .then(result => {
      return res.location(`${req.originalUrl}/${result._doc._id}`).status(201).json(result)
    })
    .catch(next)
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id
  const userId = req.user.id
  const {title, content, folderId, tags} = req.body
  const err = validTitle(title)
  if(err) return next(err)
  if(!mongoose.Types.ObjectId.isValid(noteId)){
    const err2 = new Error('not a valid id')
    err2.status = 400
    return next(err2)
  }
  const updateObj = {title, content, folderId, tags, userId}
  Note.findByIdAndUpdate(noteId,updateObj,{new:true})
    .then(result => {
      return res.status(201).json(result)
    })
    .catch(next)
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  const noteId = req.params.id
  const userId = req.user.id
  if(!mongoose.Types.ObjectId.isValid(noteId)){
    const err = new Error('improper id')
    err.status = 400
    return next(err)
  }
  Note.deleteOne({_id:noteId, userId})
    .then(result => {
      res.status(201).json({message: 'delete success'})
    })
    .catch(next)
})
module.exports = router;
//========== Validation methods =========================
function validTitle(title){
  if(!title){
    const err = Error('missing title')
    err.status = 400
    return err
  }
}