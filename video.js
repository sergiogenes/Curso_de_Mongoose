const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
  title: String,
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    requiered: true
  },
  tags: [
    new mongoose.Schema({
      title: String
    })
  ]
})

const videoModel = mongoose.model('Video', videoSchema)

module.exports = videoModel
