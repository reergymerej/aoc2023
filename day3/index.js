const assert = require('assert')
const {lines} = require('../util')

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
  return [
    ...left,
    middle,
    ...right,
  ]
}

;(() => {
  //  0 1 2 3 4 5 6
  // [0,0,1,2,3,0,0]
  //        ^
  const arr = [0,0,1,2,3,0,0]
  const test = x => x > 0
  const index = 3
  assert.deepEqual(
    getFullValueFromIndex(test, arr, index),
    [1, 2, 3]
  )
})()
