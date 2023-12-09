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
