const fs = require('fs')
const assert = require('assert')


// uboud: 12 red cubes, 13 green cubes, and 14 blue cubes
// count = # with a color
// count is possible if # <= upper bound for that color
// draw has n counts
// draw is possible if all counts are possible
// game has n draws
// game is possible if all draws are possible
// game has id

const isCountPossible = (count, color, boundary) => {
  if (boundary[color] === undefined) {
    throw new Error('unknown color')
  }
  return boundary[color] >= count
}

const B = 'blue'
const G = 'green'
const R = 'red'


//--------------------------------------------------------------------------------
// counts

let ubound = { [B]: 3,
  [G]: 99,
  [R]: 99,
}
assert.equal(isCountPossible(2, B, ubound), true)
assert.equal(isCountPossible(4, B, ubound), false)
assert.equal(isCountPossible(4, R, ubound), true)
assert.equal(isCountPossible(4, G, ubound), true)

let caughtError
try {
  isCountPossible(4, 'what?', ubound)
} catch (e) {
  caughtError = e
}
assert(caughtError, 'expected to throw an error')
assert.equal(caughtError.message, 'unknown color', 'expected color error')


// --------------------------------------------------------------------------------
// draw

const isDrawPossible = (draw, boundary) => {
  for (let [k, v] of Object.entries(draw)) {
    if (!isCountPossible(v, k, boundary)){
      return false
    }
  }
  return true
}


let draw = {
  [B]: 3,
  [R]: 4,
}
ubound = {
  [B]: 99,
  [G]: 99,
  [R]: 99,
}

assert.equal(isDrawPossible(draw, ubound), true)
draw[B] = ubound[B] + 1
assert.equal(isDrawPossible(draw, ubound), false)




// --------------------------------------------------------------------------------
// game

const isGamePossible = (game, boundary) => {
  for (let i = 0; i < game.length; i++) {
    const draw = game[i]
    if (!isDrawPossible(draw, boundary)){
      return false
    }
  }
  return true
}

let game = [
  {
    [B]: 3,
    [R]: 4,
  },
  {
    [B]: 6,
    [G]: 2,
    [R]: 1,
  },
]

ubound = {
  [B]: 99,
  [G]: 99,
  [R]: 99,
}
assert.equal(isGamePossible(game, ubound), true)

game.push({
  [G]: ubound[G] + 1,
})
assert.equal(isGamePossible(game, ubound), false)


// --------------------------------------------------------------------------------
//

const parseDrawsString = (drawsString) => {
  const pattern = /(\d+) (\w+)/g
  return drawsString.split(';').map(drawString => {
    const draw = {}
    let match = pattern.exec(drawString)
    while (match) {
      draw[match[2]] =  parseInt(match[1])
      match = pattern.exec(drawString)
    }
    return draw
  })
}

const parseLine = (line) => {
  const pattern = /^Game (\d+): (.+)$/
  const [_, idString, drawsString] = line.match(pattern)
  const game = parseDrawsString(drawsString)
  return {
    id: parseInt(idString),
    game,
  }
}

const line = 'Game 90: 1 blue, 13 green, 1 red; 4 blue, 1 red, 19 green'

assert.deepEqual(parseLine(line), {
  id: 90,
  game: [
    {
      [B]: 1,
      [G]: 13,
      [R]: 1,
    },
    {
      [B]: 4,
      [G]: 19,
      [R]: 1,
    },
  ],
})

// --------------------------------------------------------------------------------
const input = fs.readFileSync('./input', 'utf-8')
const lines = input.split('\n').filter(x => x !== '')
const results = {
  possible: [],
  impossible: [],
}
const UBOUND = {
  [R]: 12,
  [G]: 13,
  [B]: 14,
}

lines.map(line => {
  const {id, game} = parseLine(line)
  if (isGamePossible(game, UBOUND)) {
    results.possible.push(id)
  } else {
    results.impossible.push(id)
  }
})

const sumOfPossible = results.possible.reduce((acc, value) => {
  return acc + value
}, 0)
console.log({sumOfPossible})
