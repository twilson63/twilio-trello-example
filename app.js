require('dotenv').config()
const express = require('express')

const app = express()

const bodyParser = require('body-parser')
const { pluck, map, replace, compose } = require('ramda')

const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
const setupTrello = require('./setup-trello')(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN)

app.use(bodyParser.json())

// GET /availableNumbers?areacode=843

app.get('/availableNumbers', (req, res) => {
  var areaCode = req.query.areacode

  // call twilio and get a list of numbers by area-code input

  twilio.availablePhoneNumbers("US").local.list({
    areaCode: areaCode
  }, function(err, data) {

    if (err) { return res.send(err) }
    // map(prop('phone'), data) === pluck('prop', data)
    res.send(compose(
      map(replace('+', '')),
      pluck('phoneNumber')
    )(data))
  })
})

app.post('/cities', (req, res) => {
  const city = req.body.city
  // call twilio to create account number
  twilio.incomingPhoneNumbers.create({
    phoneNumber: city._id
  }, function(err, purchasedNumber) {
    console.log(purchasedNumber.sid);
  })

  // call trello to create a new board of city name
  // also create a inbound/complete list on trello
  setupTrello(city.name, ['inbound', 'complete'])
    .then(res => {
      // get listId add to city document
      city.trello = {
        app: process.env.TRELLO_KEY,
        token: process.env.TRELLO_TOKEN,
        list: res.id
      }
    })
  // create the city document in couch
})

app.listen(4000)
console.log('sample app api server running on port 4000')
