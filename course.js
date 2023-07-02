const mongoose = require('mongoose')
const slugify = require('slugify')

// 1. Definición del Schema

let courseSchema = new mongoose.Schema({
  //_id: ObjectId: Identificador único de documento
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    minlength: [50, 'No se cumple la longitud mínima de 50  caracteres'],
    maxlength: [
      300,
      'La longitud de la descripción no debe superar los 300 caracteres'
    ]
  },
  numberOfTopics: {
    type: Number,
    default: 0, // ()=>0 Tambien puede pasarsele una función que devuelva el valor por defecto
    min: 0,
    max: 100
  },
  publishedAt: Date,
  slug: {
    type: String,
    required: true,
    select: false // En este caso la key slug no se rotornará al menos que explicitamente se lo solicite en el pedido
  },
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    }
  ]
})

courseSchema.virtual('info').get(function () {
  // this => es el mismo documento
  return `${this.description}. Temas: ${this.numberOfTopics}. Fecha de lanzamiento: ${this.publishedAt}.`
})

courseSchema.pre('validate', function (next) {
  this.slug = slugify(this.title)
  next()
})
// 2. Denición del Modelo

const Course = mongoose.model('Course', courseSchema)

module.exports = Course
