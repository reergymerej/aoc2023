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

let cardResolverCache = {}

const getNextNCards = (cards, id, n) => {
  const next = []
  for (let i = 0; i < n; i++) {
    // id is 1 based
    const nextCardIndex = id + i
    const card = cards[nextCardIndex]
    if (card) {
      next.push(card)
    }
  }
  return next
}

let cacheUsedCount = 0

const cardResolver = (cardWithMatched, allCards) => {
  if (allCards === undefined) {
    throw new Error('forgot cards')
  }
  const {id} = cardWithMatched
  if (cardResolverCache[id] === undefined) {
    let countFromMatched = 0
    // How many did this one match?
    const matchedCount = cardWithMatched.matched.length
    const nextCards = getNextNCards(allCards, id, matchedCount)
    nextCards.map((nextCard) => {
      countFromMatched += cardResolver(nextCard, allCards)
    })
    cardResolverCache[id] = countFromMatched + 1
  } else {
    cacheUsedCount++
  }
  return cardResolverCache[id]
}

const howmanytotalscratchcardsdoyouendupwith = (lines) => {
  cardResolverCache = {}
  cacheUsedCount = 0

  const cards = getCards(lines)
  const cardsWithMatches = cards.map(addMatched)
  let count = 0
  cardsWithMatches.map((card) => {
    const countFromCard = cardResolver(card, cardsWithMatches)
    count += countFromCard
  })
  console.log({cacheUsedCount})
  return count
}

assert.equal(
  30,
  howmanytotalscratchcardsdoyouendupwith(sampleLines),
)


;(() => {
  cardResolverCache = {}
  assert.equal(
    1,
    cardResolver(
      {
        id: 1,
        matched: [],
      },
      [
        {id: 1, matched: []},
      ]
    ),
  )

  cardResolverCache = {}
  assert.equal(
    2,
    cardResolver(
      {
        id: 1,
        matched: [0],
      },
      [
        {id: 1, matched: [0],},
        {id: 2, matched: [], },
      ],
    ),
  )
})()

console.log(
  howmanytotalscratchcardsdoyouendupwith(lines)
)
