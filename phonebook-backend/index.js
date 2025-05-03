require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', function (req) {return JSON.stringify(req.body)})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const unknownEndopoint = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'})
}

app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count =>
      res.send(`<div>Phonebook has info for ${count} people<div>
            <div>${new Date}<div>`)
    ).catch(error => next(error))
    
})

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => res.json(persons))
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
    .then(person => {
      if(person){
        res.json(person)
      } else{
        res.status(400).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if(!body){
    return res.status(400).json({error: 'content missing'})
  }

  if(!body.name || !body.number){
    return res.status(400).json({error: `missing fields:${!body.name ? ' \'name\'':''}${!body.number ? ' \'number\'':''}`})
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number
  })

  newPerson.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(error => next(error))

})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  if(!body){
    return res.status(400).json({error: 'content missing'})
  }

  if(!body.name || !body.number){
    return res.status(400).json({error: `missing fields:${!body.name ? ' \'name\'':''}${!body.number ? ' \'number\'':''}`})
  }

  Person.findById(req.params.id)
    .then(person => {
      if(!person){
        return res.status(404).end()
      }
            
      person.name = body.name
      person.number = body.number

      return person.save().then(updatedPerson => res.json(updatedPerson))
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndDelete(id)
    .then(() => res.status(204).end())
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if(error.name === 'CastError'){
    return res.status(400).send({error: 'malformatted id'})
  }
  else if(error.name === 'ValidationError'){
    return res.status(400).send({error: error.message})
  }
  next(error)
}

app.use(errorHandler)
app.use(unknownEndopoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})