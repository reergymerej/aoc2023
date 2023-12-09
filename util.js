const fs = require('fs')
const assert = require('assert')
const input = fs.readFileSync('./input', 'utf-8')
const lines = input.split('\n').filter(x => x !== '')

const assertError = (fn, expectedErrorMessage) => {
    let caught
    try {
      fn()
    } catch (e) {
      caught = e
    }
    assert.equal(
      caught && caught.message,
      expectedErrorMessage,
      `should have thrown err: ${expectedErrorMessage}`
    )
}

const loadInputIntoLines = (str) => {
  return str
    .trim()
    .split('\n')
    .map(x => x.trim())
}

const testBulk = (fn, inputsAndExpected) => {
  inputsAndExpected.map((values) => {
    const [ input, expected ] = values
    assert.deepEqual(
      expected,
      fn(input),
    )
  })
}



module.exports = {
  assertError,
  lines,
  loadInputIntoLines,
  testBulk,
}
