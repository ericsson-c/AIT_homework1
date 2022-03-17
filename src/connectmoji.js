/*
Author: Ericsson Colborn, NYU '23 Data & Computer Science
Applied Internet Technology
Professor Versoza
New York University
*/

// dependencies...
const clear = require('clear')
const readlineSync = require('readline-sync')
const wcwidth = require('wcwidth')

function generateBoard(rows, cols, fill=null) {

    const board = {
        data: new Array(rows*cols).fill(fill),
        rows: rows,
        cols: cols
    } 

    return board
}
// return null
function rowColToIndex(board, row, col) {

    // first, make sure that row, col are valid for given board
    if (row >= board.rows || col >= board.cols) return null
    // if valid, navigate to the right col
    let i = row * board.rows
    // then to the right row
    i += col
    return i;

    
}

function indexToRowCol(board, i) {

    if (i >= board.data.length) {
        return 'Index out of bounds.'
    }
    
    row = Math.floor(i / board.rows)
    col = i % board.cols
    return {'row': row, 'col': col}
}

function setCell(board, row, col, value) {

    let index = rowColToIndex(board, row, col)
    if (index === null) return index

    // else...
    board.data[index] = value
    new_board = generateBoard(board.rows, board.cols)
    new_board.data = [...board.data]

    return new_board
}

function setCells(board, ...args) {

    let new_board
    for (let i = 0; i < args.length; i++) {
        
        new_board = setCell(board, args[i]['row'], args[i]['col'], args[i]['val'])
        // make sure row, col is valid
        if (new_board === 'Row, Col not valid') return new_board
    }

    return new_board
}

function boardToString(board) {

    // this prints the empty cells"
    for (let r = 0; r < board.rows+2; r++) {
        for (let c = 0; c < board.cols+1; c++) {

            // if it's the second to last row, print |---|---|...
            if (r === board.rows && c < board.cols) {
                process.stdout.write('|'.padEnd(4, '-'))

            // else if it's the last row, print | A | B | C |...
            } else if (r === board.rows+1 && c < board.cols) {
                let l = String.fromCharCode(65 + c)
                process.stdout.write('| ' + l.padEnd(2))

            // else, print out the character in each grid cell
            // (or blank space if it's empty)
            } else  {

                // if the cell is not empty...
                cell = board.data[rowColToIndex(board, r, c)]
                if (cell != null && c < board.cols) {
                    process.stdout.write('| ' + cell.padEnd(3 - wcwidth(cell)))
                
                // else if the cell is empty...
                } else {
                    process.stdout.write('|'.padEnd(4))
                }
            } 
        }
        process.stdout.write('\n')
    }
}

// letterToCol: returns the column # associated with the passed letter
// letters other than A-Z will return null
function letterToCol(letter) {

    const cp = letter.charCodeAt()
    if (cp < 65 || cp > 65+25) return null
    else return cp - 65   // A = 65, so the distance from A is the col #
}

function getEmptyRowCol(board, letter, empty=null) {

    let start = rowColToIndex(board, 0, letterToCol(letter))
    let i = start
    const step = board.rows
    for (i; i < start+(board.cols*step); i += step) {

        // if the cell is empty, keep iterating
        if (board.data[i] === empty) continue

        // if we hit a cell that is non-empty...
        else if (board.data[i] !== empty) {
            
            // return the index of the last empty cell
            // (encountered last iteration), unless...
            if (i > start) return indexToRowCol(board, i-step)

            // the non-empty cell is the first cell.
            // if so, return null, since there are no empty cells
            else return null
        }

    // if all rows in the col are null, return the bottommost row
    } return indexToRowCol(board, i-step)

}

function getAvailableColumns(board) {
    
    let ret = []
    for (let i = 0; i < board.cols; i++) {

        // if a column has an empty cell...
        const letter = String.fromCharCode(65+i)
        if (getEmptyRowCol(board, letter) != null) {
            // add that col to the return array
            ret.push(letter)
        }
    } return ret
}

function hasConsecutiveValues(board, row, col, n) {

    // store starting position:
    let start = rowColToIndex(board, row, col)
    // and value to check for
    let val = board.data[start]
    // right away, if val is null, return false
    if (val === null) return false

    /* checkWin() helper functions
    - 2 functions, one for when i increases during the loop and
        one for then i decreases
    - loops over a row/col/diagnol to see if win condition has been met
    - @params:
        * end: last index in the row/col/etc.
        * step: how many indices to increment each iteration
        * counter: current # of consecutive values (except for the one at (row,col))
    */
   // for increasing:
    function checkWinInc(end, step, counter) {

        for (let i = start+step; i < start+(n*step); i+= step) {

            // first, exit loop if we hit end of col
            if (i > end) break      // break before we access board.data[i] to avoid error

            // if consecutive values exist, keep looping
            else if (board.data[i] === val) {
                
                counter++
            }

            // else...
            else break
    
        } return counter
    }
    // for decreasing
    function checkWinDec(end, step, counter) {

        for (let i = start-step; i > start-(n*step); i-= step) {

            // first, exit loop if we hit end of col
            if (i < end) break      // break before we access board.data[i] to avoid error

            // if consecutive values exist, keep looping
            else if (board.data[i] === val) {
                
                counter++
            }
            // else...
            else break
    
        } return counter
    }

    /*
    This implentation handles the horizontal, vertical,
    and diagnal cases separately, each starting from
    the same starting pos
    */

    // 1.1) vertical, traveling down
    let end = rowColToIndex(board, board.rows-1, col)
    let counter = 0
    let step = board.rows

    counter = checkWinInc(end, step, counter)
    if (counter+1 === n) return true

    // 1.2) vertical, traveling up
    end = rowColToIndex(board, 0, col)

    counter = checkWinDec(end, step, counter)
    if (counter+1 === n) return true

    // 2.1) horizontal, traveling right
    counter = 0
    end = rowColToIndex(board, row, board.cols-1)
    step = 1

    counter = checkWinInc(end, step, counter)
    if (counter+1 === n) return true

    // 2.2) horizontal, traveling left
    end = rowColToIndex(board, row, 0)

    counter = checkWinDec(end, step, counter)
    if (counter+1 === n) return true

    // 3.1) diagnally, traveling down+right
    counter = 0
    end = board.rows*board.cols - 1
    step = board.rows + 1;
    
    counter = checkWinInc(end, step, counter)
    if (counter+1 === n) return true

    // 3.2) diagnally, traveling up+left
    end = 0

    counter = checkWinDec(end, step, counter)
    if (counter+1 === n) return true

    // 3.3) diagnally, traveling up+right
    counter = 0
    end = (board.cols-1) * board.rows
    step = board.rows - 1;
    
    counter = checkWinInc(end, step, counter)
    if (counter+1 === n) return true

    // 3.4) diagnally, traveling down+left
    end = board.rows-1;

    counter = checkWinDec(end, step, counter)
    if (counter+1 === n) return true

    // if checkWin() never return true, win remains false
    return false
}

function autoplay(board, s, numConsecutive) {

    let result = {}
    const str = s.split("")
    result.pieces = str.slice(0,2)

    const moves = str.slice(2)

    // make moves...
    let player
    let otherPlayer
    let rowCol
    let moveNum = 1
    result.board = board
    let i = 0

    for (i; i < moves.length; i++) {

        if (i % 2 === 0) {
            player = result.pieces[0]
            otherPlayer = result.pieces[1]

        } else {
            player = result.pieces[1]
            otherPlayer = result.pieces[0]
        }

        result.lastPieceMoved = player
        rowCol = getEmptyRowCol(result.board, moves[i])
        result.board = setCell(result.board, rowCol.row, rowCol.col, player)

        if (hasConsecutiveValues(result.board, rowCol.row, rowCol.col, numConsecutive)) {

            result.winner = player
            break
        }

        moveNum++
    }  
    if (i < moves.length) result.error = {
        'num': moveNum+1,
        'val': otherPlayer,
        'col': moves[i]
    }
    return result
}

// ...don't forget to export functions!


module.exports = {

    generateBoard: generateBoard,
    rowColToIndex: rowColToIndex,
    indexToRowCol: indexToRowCol,
    setCell: setCell,
    setCells: setCells,
    boardToString: boardToString,
    letterToCol: letterToCol,
    getEmptyRowCol: getEmptyRowCol,
    getAvailableColumns: getAvailableColumns,
    hasConsecutiveValues: hasConsecutiveValues,
    autoplay: autoplay
}