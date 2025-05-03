const mongoose = require('mongoose')

const URL = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(URL)
  .then(() => {
    console.log('Connected to Mongo')
  })
  .catch(error => {
    console.log('Error connecting to mongo', error.message)
  })

const personSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate:{
      validator: (v) => {
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: 'invalid number format'
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)