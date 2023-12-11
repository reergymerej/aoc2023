const {
  assertError,
  lines,
  loadInputIntoLines,
  testBulk,
} = require('../util')
const assert = require('assert')
console.clear()

const getTotalPoints = (points) => {
  return points.reduce((acc, value) => {
    return acc + value
  }, 0)
}

const getMatchedNumbers = (card) => {
  return card.winning.filter(
    winningNumber => card.selected.indexOf(winningNumber) > -1
  )
}

const separateCleanAndParseString = (str) => {
  return str.split(/\s+/g).filter(x => x.length).map(x => parseInt(x))
}

const lineToCard = (line) => {
  const pattern = /^Card\s+(\d+): (.+) \| (.+)$/
  const match = pattern.exec(line)
  if (match) {
    const [_, id, winningString, selectedString] = match
    return {
      id: parseInt(id),
      winning: separateCleanAndParseString(winningString),
      selected: separateCleanAndParseString(selectedString),
    }
  }
  throw new Error('invalid card input')
}

assertError(() => {
  lineToCard('aasdf?')
}, 'invalid card input')

testBulk(
  lineToCard,
  [
    [
      'Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53',
      {
        id: 1,
        winning: [41,48,83,86,17,],
        selected: [ 83, 86, 6, 31, 17, 9, 48, 53],
      },
    ],
    [
      'Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19',
      {
        id: 2,
        winning: [13, 32, 20, 16, 61, ],
        selected: [61, 30, 68, 82, 17, 32, 24, 19],
      },
    ],
  ]
)


testBulk(
  (x) => getMatchedNumbers(x).sort(),
  [
    [
      lineToCard('Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53'),
      [48, 83, 17, 86].sort(),
    ],
  ]
)

const matchCountToPoints = (matched) => {
  return matched && Math.pow(2, matched - 1)
}

testBulk(
  matchCountToPoints,
  [
    [ 0, 0 ],
    [ 1, 1 ],
    [ 2, 2 ],
    [ 3, 4 ],
    [ 4, 8 ],
  ]
)

const cardToPoints = card => {
  const matchedNumbersCount = getMatchedNumbers(card).length
  return matchCountToPoints(matchedNumbersCount)
}

const getPointsPerCard = (cards) => {
  return cards.map(cardToPoints)
}

const getCards = (lines) => {
  return lines.map(lineToCard)
}

const Howmanypointsaretheyworthintotal = (lines) => {
  const cards = getCards(lines)
  const points = getPointsPerCard(cards)
  const total = getTotalPoints(points)
  return total
}

const sampleLines = loadInputIntoLines(`
          Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
          Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
          Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
          Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
          Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
          Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
`)

assert.equal(
  13,
  Howmanypointsaretheyworthintotal(sampleLines),
)
// console.log(Howmanypointsaretheyworthintotal(lines))

const addMatched = card => {
  return {
    ...card,
    matched: getMatchedNumbers(card),
  }
}

const getCopiedCards = (id, cardMatchesHash, cards) => {
  const matchCount = cardMatchesHash[id]
  const copiedCards = []
  for (let i = 0; i < matchCount && i < cards.length; i++) {
    const copiedCardId = id + i + 1
    copiedCards.push(cards[copiedCardId - 1])
  }
  return copiedCards
}

const howmanytotalscratchcardsdoyouendupwith = (lines) => {
  const cards = getCards(lines)
  const cardsWithMatches = cards.map(addMatched)
  const cardMatchesHash = cardsWithMatches.reduce((acc, card) => {
    const { id } = card
    return {
      ...acc,
      [id]: getMatchedNumbers(card).length,
    }
  }, {})

  let cardsToProcess = [
    ...cardsWithMatches,
  ]

  let countOfAllCards = cards.length

  while (cardsToProcess.length) {
    const { id } = cardsToProcess.shift()
    const copiedCards = getCopiedCards(id, cardMatchesHash, cards)
    countOfAllCards += copiedCards.length
    cardsToProcess = [
      ...cardsToProcess,
      ...copiedCards,
    ]
  }
  return countOfAllCards
}

assert.equal(
  30,
  howmanytotalscratchcardsdoyouendupwith(sampleLines),
)
