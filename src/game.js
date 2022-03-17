// require your module, connectmoji
// require any other modules that you need, like clear and readline-sync
const c = require('./connectmoji')
const readlineSync = require('readline-sync');
const { boardToString } = require('./connectmoji');
const input = process.argv[2].split(",")

const board = c.generateBoard(parseInt(input[2]), parseInt(input[3]))
const result = c.autoplay(board, input[1], parseInt(input[4]))
boardToString(result.board)