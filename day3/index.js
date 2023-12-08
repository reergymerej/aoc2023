const assert = require('assert')
const {lines} = require('../util')

const isValid = (x, y, grid) => {
  return x >= 0 && x < grid[0].length
    && y >= 0 && y < grid.length
}

const getValue = (x, y, grid) => {
  if (isValid(x, y, grid)) {
    return grid[y][x]
  }
  throw new Error('out of range')
}

const getLeftMost = (pattern, coords, grid) => {
  let leftMost
  let {x, y} = coords
  for (; isValid(x, y, grid); x--) {
    try {
      const value = getValue(x, y, grid)
      if (pattern.test(value)) {
        leftMost = {x, y}
      } else {
        break
      }
    } catch (err) {
      if (err.message !== 'out of range') {
        throw err
      }
    }
  }
  return leftMost
}

const getRightMost = (pattern, coords, grid) => {
  let rightMost
  let {x, y} = coords
  for (; isValid(x, y, grid); x++) {
    try {
      const value = getValue(x, y, grid)
      if (pattern.test(value)) {
        rightMost = {x, y}
      } else {
        break
      }
    } catch (err) {
      if (err.message !== 'out of range') {
        throw err
      }
    }
  }
  return rightMost
}

const getExtendedRange = (pattern, coords, grid) => {
  const leftMost = getLeftMost(/\d/, coords, grid)
  const rightMost = getRightMost(/\d/, coords, grid)
  const range = []
  for (let x = leftMost.x, y = leftMost.y; x <= rightMost.x; x++) {
    range.push(getValue(x, y, grid))
  }
  return range
}

const getRangesFromRow = (x, y, grid) => {
  const surrounding = []
  const left = {x: x - 1, y}
  if (isValid(left.x, left.y, grid) && /\d/.test(getValue(left.x, left.y, grid))) {
    const leftRange = getExtendedRange(/\d/, left, grid)
    surrounding.push(leftRange)
  }
  const center = { x, y, }
  if (isValid(center.x, center.y, grid) && !/\d/.test(getValue(center.x, center.y, grid))) {
    const right = {x: x + 1, y}
    if (isValid(right.x, right.y, grid) && /\d/.test(getValue(right.x, right.y, grid))) {
      const rightRange = getExtendedRange(/\d/, right, grid)
      surrounding.push(rightRange)
    }
  }
  return surrounding
}

const getSurroundingNumbers = (x, y, grid) => {
  let surrounding = []
  const above = { x, y: y - 1, }
  const topRanges = getRangesFromRow(above.x, above.y, grid)
  surrounding = [
    ...surrounding,
    ...topRanges,
  ]

  const center = { x, y, }
  const centerRanges = getRangesFromRow(center.x, center.y, grid)
  surrounding = [
    ...surrounding,
    ...centerRanges,
  ]

  const below = { x, y: y + 1, }
  const belowRanges = getRangesFromRow(below.x, below.y, grid)
  surrounding = [
    ...surrounding,
    ...belowRanges,
  ]
  return surrounding
}

// look through each line until we find *
grid = lines
let sum = 0
grid.map((line, y) => {
  const chars = line.split('')
  chars.map((char, x) => {
    if (char === '*') {
      const surroundingNumbers = getSurroundingNumbers(x, y, grid)
      if (surroundingNumbers.length === 2) {
        const ints = surroundingNumbers.map((item) => {
          return parseInt(item.join(''))
        })
        const gearRatio = ints[0] * ints[1]
        sum += gearRatio
      }
    }
  })
})
console.log(sum)
