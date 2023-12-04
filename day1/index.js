#!/usr/bin/env node

const fs = require('fs')
const assert = require('assert')

const digitMap = {
  'zero': '0',
  'one': '1',
  'two': '2',
  'three': '3',
  'four': '4',
  'five': '5',
  'six': '6',
  'seven': '7',
  'eight': '8',
  'nine': '9',
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
}

const digitStrings = Object.keys(digitMap)

const digitStringToDigit = (value) => {
  return digitMap[value]
}

const getLeftDigit = (value) => {
  const pattern = new RegExp(`^.*?(${digitStrings.join('|')})`)
  const result = pattern.exec(value)
  return digitStringToDigit(result[1])
}

const getRightDigit = (value) => {
  const pattern = new RegExp(`.*(${digitStrings.join('|')}).*$`)
  const result = pattern.exec(value)
  return digitStringToDigit(result[1])
}


const getFirstAndLastDigits = (value) => {
  return getLeftDigit(value) + getRightDigit(value)
}

const getLineInt = (value) => parseInt(getFirstAndLastDigits(value))


assert(getLeftDigit('asdfsixtwo1nine') === '6')
assert(getRightDigit('asdftwo1nine') === '9')

assert.equal(getFirstAndLastDigits('two1nine'), '29')
assert(getFirstAndLastDigits('asdf2asdfasdf3asdfasdf7asdf7') === '27')
assert(getFirstAndLastDigits('treb7uchet') === '77')
assert(getLineInt('asdf2asdf3asdf8asdfg') === 28)

const input = fs.readFileSync('./input', 'utf-8')
const lines = input.split('\n').filter(x => x !== '')

const result = lines.reduce((acc, value) => {
  return acc + getLineInt(value)
}, 0)

console.log({result})
