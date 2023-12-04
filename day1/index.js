#!/usr/bin/env node

const fs = require('fs')
const assert = require('assert')

const getFirstAndLastDigits = (value) => {
  const parts = value.split(/[^\d]*/g).filter(x => x !== '')
  return parts[0] + parts[parts.length - 1]
}

const getLineInt = (value) => parseInt(getFirstAndLastDigits(value))

assert(getFirstAndLastDigits('asdf2asdfasdf3asdfasdf7asdf7') === '27')
assert(getFirstAndLastDigits('treb7uchet') === '77')
assert(getLineInt('asdf2asdf3asdf8asdfg') === 28)

const input = fs.readFileSync('./input', 'utf-8')
const lines = input.split('\n').filter(x => x !== '')

const result = lines.reduce((acc, value) => {
  return acc + getLineInt(value)
}, 0)

console.log({result})
