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

// getSumOfEngineParts()

const getStarCoords = (schematic) => {
  const coords = []
  schematic.map((line, y) => {
    const x = line.indexOf('*')
    if (x > -1) {
      coords.push({
        y,
        x,
      })
    }
  })
  return coords
}

assert.deepEqual(getStarCoords([
  [1,2,3],
  [1,'*',3],
  [1,2,'*'],
]), [
  {y: 1, x: 1},
  {y: 2, x: 2},
])

const getValuesAndCoords = (coords, arr) => {
  const valuesAndCoords = []
  coords.map(coord => {
    const {x, y} = coord
    if (arr[y] && arr[y][x] !== undefined) {
      valuesAndCoords.push({
        x,
        y,
        value: arr[y][x],
      })
    }
  })
  return valuesAndCoords
}

assert.deepEqual(getValuesAndCoords([
  {y: 1, x: 2},
], [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]),
[{
  x: 2,
  y: 1,
  value: 6,
}])

const printBlock = (centerCoords, borderValuesAndCoords) => {
  console.log()
  console.log(
    borderValuesAndCoords[0].value,
    borderValuesAndCoords[3].value,
    borderValuesAndCoords[5].value,
  )
  console.log(
    borderValuesAndCoords[1].value,
    '?',
    borderValuesAndCoords[6].value,
  )
  console.log(
    borderValuesAndCoords[2].value,
    borderValuesAndCoords[4].value,
    borderValuesAndCoords[7].value,
    '\n',
  )
}

const getWithValues = (pattern, dataWithValues) =>
  dataWithValues.filter(x => pattern.test(x.value))


assert.deepEqual(getWithValues(/\d/, [
  {x: 1, y: 2, value: '.'},
  {x: 2, y: 2, value: '8'},
]), [
  {x: 2, y: 2, value: '8'},
])

const getLeft = (pattern, start, lines) => {
  let leftMost = start
  for (let x = start.x; x >= 0; x--) {
    const value = getValuesAndCoords([{
      x,
      y: start.y,
    }], lines)[0]
    if (pattern.test(value.value)) {
      leftMost = value
    } else {
      break
    }
  }
  return leftMost
}

const getRight = (pattern, start, lines) => {
  let rightMost = start
  for (let x = start.x; x < lines[0].length; x++) {
    const value = getValuesAndCoords([{
      x,
      y: start.y,
    }], lines)[0]
    if (pattern.test(value.value)) {
      rightMost = value
    } else {
      break
    }
  }
  return rightMost
}

const leftToRight = (left, right, lines) => {
  const leftI = left.x
  const rightI = right.x
  const y = left.y
  const value = []
  for (let x = leftI; x <= rightI; x++) {
    value.push(lines[y][x])
  }
  return value
}

const getLeftToRight = (pattern, startCoord, lines) => {
  const left = getLeft(pattern, startCoord, lines)
  const right = getRight(pattern, startCoord, lines)
  return leftToRight(left, right, lines)
}

assert.deepEqual(getLeftToRight(/\d/, {
  x: 3,
  y: 1,
}, [
  //0   1   2   3   4   5
  ['.','.','.','.','.','.'], // 0
  ['.','8','8','8','8','8'], // 1
  ['.','.','.','*','.','.'], // 2
  ['.','.','.','.','.','.'], // 3
]), [
'8','8','8','8','8'
])

const getContiguousValues = (pattern, border, lines) => {
  // printBlock({}, border)

  const values = []
  const leftX = border[0].x
  const topY = border[0].y
  const bottomY = topY + 2
  const top = border.filter(coord => coord.y === topY)
  const topMatch = top.find(coord => pattern.test(coord.value))
  if (topMatch) {
    const topContiguousValues = getLeftToRight(pattern, topMatch, lines)
    values.push(topContiguousValues)
  }
  const leftMatch = border.find(coord => pattern.test(coord.value) && coord.x === leftX && coord.y === topY + 1)
  if (leftMatch) {
    const leftContiguousValues = getLeftToRight(pattern, leftMatch, lines)
    values.push(leftContiguousValues)
  }
  const rightMatch = border.find(coord => pattern.test(coord.value) && coord.x === leftX + 2 && coord.y === topY + 1)
  if (rightMatch) {
    const leftContiguousValues = getLeftToRight(pattern, rightMatch, lines)
    values.push(leftContiguousValues)
  }

  const bottom = border.filter(coord => coord.y === bottomY)
  const bottomMatch = bottom.find(coord => pattern.test(coord.value))
  if (bottomMatch) {
    const bottomContiguousValues = getLeftToRight(pattern, bottomMatch, lines)
    values.push(bottomContiguousValues)
  }
  return values
}

(() => {
  let testLines = [
    //0   1   2   3   4   5
    ['.','.','.','.','.','.'], // 0
    ['.','.','.','8','.','.'], // 1
    ['.','.','.','*','.','.'], // 2
    ['.','.','.','.','.','.'], // 3
  ]
  assert.deepEqual(getContiguousValues(
    /\d/,
    getValuesAndCoords(
      getBorderForRange({start: 3, end: 3}, 2),
      testLines,
    ),
    testLines
  ), [
    ['8'],
  ])
})()

const getGearPairs = (schematic) => {
  const gearPairs = []
  // find all *
  const starCoords = getStarCoords(schematic)
  starCoords.map(starCoord => {
    // get border around
    const starBorder = getBorderForRange({
      start: starCoord.x,
      end: starCoord.x,
    }, starCoord.y)
    const borderValues = getValuesAndCoords(starBorder, schematic)
    // ignore anything without >= 2 digits
    const borderValuesWithNumbers = getWithValues(/\d/, borderValues)
    if (borderValuesWithNumbers.length >= 2) {
      // extract contiguous digits from border values
      const contiguousValues = getContiguousValues(/\d/, borderValues, schematic)
      if (contiguousValues.length > 1) {
        const left = parseInt(contiguousValues[0].join(''))
        const right = parseInt(contiguousValues[1].join(''))
        gearPairs.push([left, right])
      }
    }
  })
  return gearPairs
}

const getSumOfGearRatios = (schematic) => {
  const gearPairs = getGearPairs(schematic)
  const gearRatios = gearPairs.map((gearPair) => {
    return gearPair[0] * gearPair[1]
  })
  const sum = gearRatios.reduce((acc, value) => acc + value, 0)
  console.log(sum)
}

getSumOfGearRatios(lines)
