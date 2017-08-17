const Trello = require('trello')
const { curry, map, head } = require('ramda')

module.exports = curry((key, token, boardName, lists) => {
  const trello = new Trello(key, token)

  return trello.addBoard(boardName)
    .then(res => {
      const createList = name => trello.addListToBoard(res.id, name)
      return Promise.all(
        map(createList, lists)
      ).then(
        lists => {
          return head(lists)
        }
      )

    })
})

// Example
/*
const setupBoard = require('./')
setupBoard(key, token, 'MountPleasant', ['inbound', 'complete'])
  .then(results => {

  })
*/
