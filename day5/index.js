const assert = require('assert')
const { lines, testBulk } = require('../util')
console.clear()


const parseSeeds = line => {
  const pattern = /^seeds:\s+/
  const numbersString = line.replace(pattern, '').trim()
  return numbersString.split(/\s+/g).filter(x => x).map((item) => parseInt(item))
}

const parseMapLine = (line) => {
  const [
    startRangeDestination,
    startRangeSource,
    lengthRange,
  ] = line.split(/\s+/).map((item) => parseInt(item))
  return {
    startRangeDestination,
    startRangeSource,
    lengthRange,
  }
}

const getMapName = line => {
  return /^(.+) map:$/.exec(line)[1]
}

const parseMaps = lines => {
  const maps = {}
  let currentMapName
  lines.map((line) => {
    if (currentMapName === undefined) {
      currentMapName = getMapName(line)
      maps[currentMapName] = []
    } else if (line === '') {
      currentMapName = undefined
    } else {
      maps[currentMapName].push(parseMapLine(line))
    }
    return line
  })
  return maps
}

const parseLines = lines => {
  const mapLines = lines.filter((x, i) => i > 1)
  const maps = parseMaps(mapLines)
  return {
    seeds: parseSeeds(lines[0]),
    maps,
  }
}

const getLocationNumbers = () => {
  return []
}


const sample = `
  seeds: 79 14 55 13

  seed-to-soil map:
  50 98 2
  52 50 48

  soil-to-fertilizer map:
  0 15 37
  37 52 2
  39 0 15

  fertilizer-to-water map:
  49 53 8
  0 11 42
  42 0 7
  57 7 4

  water-to-light map:
  88 18 7
  18 25 70

  light-to-temperature map:
  45 77 23
  81 45 19
  68 64 13

  temperature-to-humidity map:
  0 69 1
  1 0 69

  humidity-to-location map:
  60 56 37
  56 93 4
`.trim().split('\n').map(line => line.trim())

const sampleData = parseLines(sample)

const lookUp = (data, source, destination, sourceNum) => {
  const mapName = `${source}-to-${destination}`
  const m = data.maps[mapName]
  const entryWithSourceNum = m.find(x => {
    return x.startRangeSource <= sourceNum
      && x.startRangeSource + x.lengthRange >= sourceNum
  })
  if (!entryWithSourceNum) {
    return sourceNum
  }
  const sourceDelta = sourceNum - entryWithSourceNum.startRangeSource
  return entryWithSourceNum.startRangeDestination + sourceDelta
}

const find = ({
  data,
  source,
  destination,
  value,
}) => {
  const mapNames = Object.keys(data.maps)
  let currentSource = source
  let currentDestination
  while (destination !== currentDestination) {
    const nextMap = mapNames.find(mapName => mapName.indexOf(currentSource) === 0)
    if (!nextMap) {
      throw new Error('unable to find next map')
    }
    currentDestination = nextMap.substring(nextMap.lastIndexOf('-') + 1)
    value = lookUp(data, currentSource, currentDestination, value)
    currentSource = currentDestination
  }
  return value

}

const findLocation = (data, source, sourceNum) => {
  return find({
    data,
    source,
    destination: 'location',
    value: sourceNum,
  })
}


const findAll = ({
    data,
    source,
    destination,
    values,
}) => {
  const detinationValues = values.map((value) => {
    return find({
      data,
      source,
      destination,
      value,
    })
  })
  return detinationValues
}

const Whatisthelowestlocationnumberthatcorrespondstoanyoftheinitialseednumbers = (data) => {
  const initialSeedNumbers = data.seeds
  const locationNumbers = findAll({
    data,
    source: 'seed',
    destination: 'location',
    values: initialSeedNumbers,
  })
  const lowestLocation = locationNumbers.sort()[0]
  return lowestLocation
}

;(() => {
  assert.deepEqual(
    [
      {
        startRangeDestination: 50,
        startRangeSource: 98,
        lengthRange: 2,
      },
      {
        startRangeDestination: 52,
        startRangeSource: 50,
        lengthRange: 48,
      },
    ],
    sampleData.maps['seed-to-soil'],
  )

  testBulk((input) => {
    return lookUp(
      sampleData,
      'seed',
      'soil',
      input,
    )
  }, [
    [98, 50],
    [99, 51],
    [55, 57],
    [10, 10],
    [79, 81],
    [14, 14],
    [13, 13],
  ])

  testBulk((input) => {
    return findLocation(
      sampleData,
      'seed',
      input,
    )
  }, [
    [79, 82],
    [14, 43],
    [55, 86],
    [13, 35],
  ])

  assert.equal(
    43,
      find({
      data: sampleData,
      source: 'seed',
      destination: 'humidity',
      value: 14,
    })
  )

  assert.deepEqual(
    [
      82,
      43,
      86,
      35,
    ],
    findAll({
      data: sampleData,
      source: 'seed',
      destination: 'location',
      values: [
        79,
        14,
        55,
        13,
      ],
    }),
  )

  assert.equal(
    35,
    Whatisthelowestlocationnumberthatcorrespondstoanyoftheinitialseednumbers(sampleData),
  )
})()
