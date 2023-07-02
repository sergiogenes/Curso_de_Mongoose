const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Course = require('./course')
const Video = require('./video')

const PORT = 8080

mongoose
  .connect('mongodb://localhost/mongoose-course')
  .then(() => console.log('La base de datos se conectó correctamente'))
  .catch((error) => console.error(error))

const server = express()

server.use(express.json())
server.use(morgan('dev'))

server.get('/', (req, res) => {
  res.send('Hola Mundo')
})

server.post('/courses', (req, res) => {
  const { title, description, numberOfTopics } = req.body
  Course.create({ title, description, numberOfTopics })
    .then((course) => res.send(course))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error.message)
    })
})

server.get('/courses', (req, res) => {
  Course.find({})
    .populate('videos') // Se espisifica el nombre del campo dentro del Schema de Course. Si tuviera mas de un campo .populate('videos', 'autor')
    .then((courses) => res.send(courses))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    })
})

server.get('/searchWithRegex', (req, res) => {
  Course.find({
    title: /rubi/i
  })
    .then((courses) => res.send(courses))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    })
})

server.get('/courses/:id', (req, res) => {
  const id = req.params.id

  Course.findOne({ _id: id })
    .then((course) => res.send(course))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    })
})

server.put('/courses/:id', (req, res) => {
  const id = req.params.id
  const { title, description, numberOfTopics } = req.body

  // 1. Actualizar multiples a la vez
  /* Course.updateMany(
    { numberOfTopics: 0 }, // Condición
    { publishedAt: new Date() } // Nuevo valor
  )
    .then((course) => res.send(course))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    }) */
  // 2. Actualizar uno por ID
  /*  Course.findByIdAndUpdate(id, { title, description, numberOfTopics }, {new: true})  // se debe agregar la opción para que devuelva el documento luego de ser actualizado, por defecto devuelve el documento antes de ser actualizado 
    .then((course) => res.send(course))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    }) */

  // 3. Encontrar primero el documento y luego guardarlo
  Course.findById(id)
    .then((course) => {
      course.title = `${course.title}_actualizado`
      course.publishedAt = new Date()
      return course.save()
    })
    .then((courseSaved) => res.send(courseSaved))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    })
})

server.delete('/courses/:id', (req, res) => {
  const id = req.params.id

  Course.findByIdAndDelete(id)
    .then((course) => res.send(course))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    })

  // Tambien se prodría buscar primero el documento y luego borrarlo similar al de PUT

  /* Course.findById(id)
    .then((course) => {
      return course.delete()
    })
    .then((courseDeleted) => res.send(courseDeleted))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    }) */
})

server.delete('/courses', (req, res) => {
  Course.deleteMany({ title: 'curso de Mongoose' })
    .then((course) => res.send(course))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    })
})

server.get('/selectSomeFields', (req, res) => {
  // Se pasa como segundo argumento del metodo find un arreglo con los campor que queremos que se incluyan o excluyan
  /* Course.find({}, ['title', 'description'])
    .then((courses) => res.send(courses))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    }) */

  // Tambien podríamos especificar solo el campo que no queremos, colocando un signo - antes del string o insertando un signo + en caso de que el item haya sido del tipo select : false en el Schema

  /* Course.find({}, ['-numberOfTopics', '+slug'])
    .then((courses) => res.send(courses))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    }) */

  // Una tercer alternativa a lo anterior es concatener el metodo select al método find
  Course.find({})
    .select('-numberOfTopics +slug')
    .then((courses) => res.send(courses))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    })
})

server.get('/searchAndOrder', (req, res) => {
  // Se pasa como tercer argumento del metodo find un objeto que permite ordenar la consulta
  /* Course.find({}, null, {
    sort: {
      numberOfTopics: -1,
      title: -1 // Positivo ascendente - Negativo descendente
    }
  })
    .then((courses) => res.send(courses))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    }) */

  // Una segunda alternativa a lo anterior es concatener el metodo sort al método find
  Course.find({})
    .sort('-numberOfTopics +title')
    .then((courses) => res.send(courses))
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    })
})

server.get('/countRegisters', (req, res) => {
  // Se utiliza el metodo countDocuments
  Course.countDocuments({ numberOfTopics: 3 })
    .then((numDocs) => {
      console.log(numDocs)
      res.send({ cuenta: numDocs })
    })
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    })

  // Tambien se puede utilizar el metodo estimatedDocumentCount, es mucho mas rápido que el anterior pero no permite filtar por campos
  /*   Course.estimatedDocumentCount()
    .then((numDocs) => {
      console.log(numDocs)
      res.send({ cuenta: numDocs })
    })
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    }) */
})

server.get('/limitAndSkip', (req, res) => {
  const { limit, page } = req.body
  console.log(limit, typeof limit)
  // En el tercer argumento del método find acepta los parametros limit y skip
  /* Course.find({}, null, {
    limit: limit,
    skip: page * limit
  })
    .then((docs) => {
      console.log(docs)
      res.send(docs)
    })
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    }) */

  // Tambien se puede utilizar los metodos .limit() .skip() en lugar del tercer argumento de find
  Course.find({})
    .limit(limit)
    .skip(page * limit)
    .then((docs) => {
      console.log(docs)
      res.send(docs)
    })
    .catch((error) => {
      console.error(error)
      res.status(500).send(error)
    })
})

server.post('/videos', (req, res) => {
  const { title, courseId, tags } = req.body

  Video.create({ title, course: courseId, tags })
    .then((video) => {
      Course.findById(courseId).then((course) => {
        course.videos.push(video.id)
        course.save()
      })
      return video
    })
    .then((videoCreated) => res.send(videoCreated))
    .catch((error) => {
      console.error(error.message)
      res.status(500).send(error.message)
    })
})

server.get('/videos', (req, res) => {
  Video.find({})
    .populate('course')
    .then((videos) => res.send(videos))
    .catch((error) => {
      console.error(error.message)
      res.status(500).send(error.message)
    })
})

server.put('/videos/:id/tags', (req, res) => {
  const id = req.params.id

  const { index, title } = req.body
  Video.findById(id)
    .populate('course')
    .then((video) => {
      video.tags[Number(index)] = { title }
      return video.save()
    })
    .then((videoActualizado) => res.send(videoActualizado))
    .catch((error) => {
      console.error(error.message)
      res.status(500).send(error.message)
    })
})

server.delete('/videos/:id/tags/:tag_id', (req, res) => {
  const id = req.params.id
  const tag_id = req.params.tag_id

  Video.findById(id)
    .populate('course')
    .then((video) => {
      console.log(video)
      console.log('tag ==>>', video.tags.id(tag_id))
      video.tags.id(tag_id).deleteOne() // otra alternativa video.tags.pull(tag_id)
      return video.save()
    })
    .then((videoActualizado) => res.send(videoActualizado))
    .catch((error) => {
      console.error(error.message)
      res.status(500).send(error.message)
    })
})

server.listen(PORT, () => {
  console.log(
    `Servidor escuchando en puerto ${PORT}, ingresar en http://localhost:${PORT}`
  )
})
