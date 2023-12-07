const assert = require('assert')
const {lines} = require('../util')


const getRangesFromLine = (line) => {
  const ranges = []
  let start = null
  let end = null

  line.split('').forEach((char, i) => {
    const isDigit = /\d/.test(char)
    if (isDigit) {
      if (start === null) {
        start = i
      }
      end = i
    } else {
      if (start !== null) {
        ranges.push({
          start,
          end,
        })
      }
      start = null
      end = null
    }
  })

  // handle unfinished range with nothing to right
  if (start !== null) {
      ranges.push({
        start,
        end,
      })
  }

  return ranges
}

assert.deepEqual(getRangesFromLine('.1.'), [
  {
    start: 1,
    end: 1,
  },
])

assert.deepEqual(getRangesFromLine('.1...234...56'), [
  {
    start: 1,
    end: 1,
  },
  {
    start: 5,
    end: 7,
  },
  {
    start: 11,
    end: 12,
  },
])

const getBorderForRange = (range, y) => {
  if (y === undefined) {
    throw new Error('you forgot to define y!')
  }
  const border = []
  for (let i = range.start - 1; i <= range.end + 1; i++) {
    border.push({
      x: i,
      y: y - 1,
    })
    if (i < range.start || i > range.end) {
      border.push({
        x: i,
        y,
      })
    }
    border.push({
      x: i,
      y: y + 1,
    })
  }

  return border
}

assert.deepEqual(getBorderForRange(
  { start: 1, end: 2, }, // x values
  1, // y value
), [
  { x: 0, y: 0, },
  { x: 0, y: 1, },
  { x: 0, y: 2, },
  { x: 1, y: 0, },
  { x: 1, y: 2, },
  { x: 2, y: 0, },
  { x: 2, y: 2, },
  { x: 3, y: 0, },
  { x: 3, y: 1, },
  { x: 3, y: 2, },
])

const getValuesFromCoords = (coords, arr) => {
  return coords.map(coord => {
    const {x, y} = coord
    if (arr[y] && arr[y][x] !== undefined) {
      return arr[y][x]
    }
  }).filter(x => x !== undefined)
}

assert.deepEqual(getValuesFromCoords(
  [ {x: 0, y: 0}, ],
  [['!']],
), [
  '!',
  ]
)
assert.deepEqual(getValuesFromCoords(
  [
    {x: 0, y: -1},
    {x: 0, y: 0},
    {x: 1, y: 1},
  ],
  [['!']],
), [
  '!',
  ]
)

const hasSymbol = (arr) => arr.some(x => x !== '.')

assert.equal(hasSymbol(['.']), false)
assert.equal(hasSymbol(['.', '*']), true)

const getValueFromRange = (range, str) => {
  if (str === undefined) {
    throw new Error('you forgot the str!')
  }
  const digits = str.substring(range.start, range.end + 1)
  return parseInt(digits)
}

assert.equal(getValueFromRange({start: 1, end: 3}, '.876...'), 876)

const getSumOfEngineParts = () => {
  let sum = 0
  lines.forEach((line, y) => {
    const ranges = getRangesFromLine(line)
    ranges.forEach(range => {
      // get border around range
      const border = getBorderForRange(range, y)
      const borderValues = getValuesFromCoords(border, lines)
      // look through border for any non \d or non .
      if (hasSymbol(borderValues)) {
        // extract value from range
        const value = getValueFromRange(range, line)
        // include value in sum
        sum += value
      }
    })
  })
  console.log(sum)
}

getSumOfEngineParts()
