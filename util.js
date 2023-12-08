const fs = require('fs')
const input = fs.readFileSync('./input', 'utf-8')
const lines = input.split('\n').filter(x => x !== '')

module.exports = {
  lines,
}
