const assert = require('assert')
const {
  lines,
  assertError,
} = require('../util')

const createSchematic = (str) => {
  return str
    .trim()
    .split('\n')
    .map(x => {
      return x.trim().split('')
    })
}

assert.deepEqual(createSchematic(`
    123
    ...
    456

  `), [
    ['1','2','3'],
    ['.','.','.',],
    ['4','5','6'],
])

const getLeft = (test, arr, index) => {
  const result = []
  for (; index > 0; index--) {
    const value = arr[index]
    if (test(value)) {
      result.unshift(value)
    } else {
      break
    }
  }
  return result
}

const getRight = (test, arr, index) => {
  const result = []
  for (; index < arr.length; index++) {
    const value = arr[index]
    if (test(value)) {
      result.push(value)
    } else {
      break
    }
  }
  return result
}

const getFullValueFromIndex = (test, arr, index) => {
  const left = getLeft(test, arr, index - 1)
  const middle = arr[index]
  const right = getRight(test, arr, index + 1)
  if (!test(middle)) {
    throw new Error('center invalid')
  }
  return [
    ...left,
    middle,
    ...right,
  ]
}

;(() => {
  const test = x => x > 0
  let arr = [0,0,1,2,3,0,0]

  //  0 1 2 3 4 5 6
  // [0,0,1,2,3,0,0]
  //        ^
  assert.deepEqual(
    getFullValueFromIndex(test, arr, 3),
    [1, 2, 3]
  )

  //  0 1 2 3 4 5 6
  // [0,0,1,2,3,0,0]
  //      ^
  assert.deepEqual(
    getFullValueFromIndex(test, arr, 2),
    [1, 2, 3]
  )

  //  0 1 2 3 4 5 6
  // [0,0,1,2,3,0,0]
  //          ^
  assert.deepEqual(
    getFullValueFromIndex(test, arr, 4),
    [1, 2, 3]
  )

  //  0 1 2 3 4
  // [0,0,1,2,3]
  //          ^
  arr = [0,0,1,2,3]
  assert.deepEqual(
    getFullValueFromIndex(test, arr, 4),
    [1, 2, 3]
  )

  //  0 1 2 3 4
  // [0,0,1,2,0]
  //          ^
  arr = [0,0,1,2,0]
  assertError(
    () => {
      getFullValueFromIndex(test, arr, 4)
    },
    'center invalid',
  )
})()

const getContiguous = (test, arr, index) => {
  let left = []
  let right = []
  const currentValue = arr[index]
  if (!test(currentValue)) {
    left = getLeft(test, arr, index - 1)
    right = getRight(test, arr, index + 1)
  } else {
    left = [
      ...getLeft(test, arr, index - 1),
      currentValue,
      ...getRight(test, arr, index + 1),
    ]
  }
  const result = []
  if (left.length) {
    result.push(left)
  }
  if (right.length) {
    result.push(right)
  }

  return result
}

;(() => {
  const test = x => x > 0

  assert.deepEqual(
    getContiguous(
      test,
      // 1,2,3,4,5,6,7,8
      [0,0,1,1,0,2,2,2,0],
      //       ^
      4
    ),
    [
      // left
      [1,1],
      // right
      [2,2,2],
    ]
  )

  assert.deepEqual(
    getContiguous(
      test,
      // 1,2,3,4,5,6,7,8
      [0,0,1,1,0,],
      //       ^
      4
    ),
    [
      [1,1],
    ]
  )

  assert.deepEqual(
    getContiguous(
      test,
      // 1,2,3,4
      [0,0,1,1,0,],
      // ^
      1
    ),
    [
      [1,1],
    ]
  )

  assert.deepEqual(
    getContiguous(
      test,
      [0,0,0,],
      // ^
      1
    ),
    []
  )
})()

const getCoords = (test, grid) => {
  const result = [ ]
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y]
    for (let x = 0; x < row.length; x++) {
      const value = grid[y][x]
      if (test(value)) {
        result.push({x, y})
      }
    }
  }
  return result
}

;(() => {
  const grid = createSchematic(`
    467..114..
    ...*......
    ..35..633.
    ......#...
    617*......
    .....+.58.
    ..592.....
    ......755.
    ...$.*....
    .664.598..
    `)

  const test = x => x === '*'
  assert.deepEqual(
    getCoords(test, grid),
    [
      { x: 3, y: 1, },
      { x: 3, y: 4, },
      { x: 5, y: 8, },
    ]
  )
})()

const getValue = (grid, coord) => {
  const line = grid[coord.y] || []
  return line[coord.x]
}

const showSurroundingValues = (grid, coord) => {
  const {x, y} = coord
  let top = [
    { x: x + -1, y: y + -1, },
    { x: x + +0, y: y + -1, },
    { x: x + +1, y: y + -1, },
  ]
  let middle = [
    { x: x + -1, y: y + -0, },
    { x: x + +0, y: y + -0, },
    { x: x + +1, y: y + -0, },
  ]
  let bottom = [
    { x: x + -1, y: y + +1, },
    { x: x + +0, y: y + +1, },
    { x: x + +1, y: y + +1, },
  ]
  let result = ''
  top = top.map(coord => getValue(grid, coord) || ' ')
  middle = middle.map(coord => getValue(grid, coord) || ' ')
  bottom = bottom.map(coord => getValue(grid, coord) || ' ')
  console.log(`\nline: ${coord.y + 1}, column: ${coord.x + 1}`)
  const spacer = ''
  console.log('\t', top.join(spacer))
  console.log('\t', middle.join(spacer))
  console.log('\t', bottom.join(spacer))
}

;(() => {
  const values = {
    'from index': 122,
    value: '8',
    top: '.938...............*..896..125*...........842...........................485...510............801.....................329.983................',
  }
  const expected = [
    ['9', '8', '3'],
  ]
  const test = x => /\d/.test(x)
  assert.deepEqual(
    getContiguous(test, values.top.split(''), values['from index']),
    expected,
  )
})()

const getSurroundingByTest = test => (grid, coord) => {
  const top = grid[coord.y - 1]
  const topValues = getContiguous(test, top, coord.x)
  const bottom = grid[coord.y + 1]
  const bottomValues = getContiguous(test, bottom, coord.x)
  const middle = grid[coord.y]
  const middleValues = getContiguous(test, middle, coord.x)
  // console.log({
  //   'from x': coord.x,
  //   'top value': top[coord.x],
  //   top,
  //   topValues,
  //   bottom,
  //   bottomValues,
  //   'bottom value': bottom[coord.x],
  //   middle,
  //   middleValues,
  //   'middle value': middle[coord.x],
  // })
  return [
    ...topValues,
    ...middleValues,
    ...bottomValues,
  ]
}

const getSurroundingNumbers = getSurroundingByTest(x => /\d/.test(x))

const isPartOfGear = (surroundingNumbers) => {
  return surroundingNumbers.length === 2
}

const getGearRatio = (surroundingNumbers) => {
  const [a, b] = surroundingNumbers
  const left = parseInt(a.join(''))
  const right = parseInt(b.join(''))
  console.log({a, b, left, right})
  return left * right
}

const main = (input) => {
  const starsInInput = input.join('').replace(/[^\*]/g, '').length
  const starCoords = getCoords(x => x === '*', input)
  assert.equal(
    starCoords.length,
    starsInInput,
    'We should find all the stars.'
  )

  // for each star, show the surrounding values
  let gearCount = 0
  starCoords.forEach(coord => {
    // Is this part of a gear?
    const surroundingNumbers = getSurroundingNumbers(input, coord)
    if (isPartOfGear(surroundingNumbers)) {
      gearCount++
      console.log('--------------')
      console.log('This is a gear.')
      showSurroundingValues(input, coord)
      console.log('surrounding numbers', surroundingNumbers)

      const gearRatio = getGearRatio(surroundingNumbers)
      console.log({ gearRatio })
    } else {
      console.log('--------------')
      console.log('This is not a gear.')
      showSurroundingValues(input, coord)
      console.log('surrounding numbers', surroundingNumbers)
    }
  })
  console.log({gearCount, starsInInput})

}

main(lines)
