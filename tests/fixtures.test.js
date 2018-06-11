const fs = require('fs')
const glob = require('glob')
const path = require('path')

const {testAsync} = require('./helpers')

const {convert} = require('../src')

/**
 * Tests conversion of files in `fixtures`
 *
 * Each fixture file is read in and then exported to the same format
 * with `-out` appended to the filename. e.g. `paragraphs.md` is exported to `paragraphs-out.md`.
 */
testAsync('Fixtures: round trips', async assert => {
  let inputs = glob.sync(path.join(__dirname, 'fixtures', '*'))
  for (let input of inputs) {
    // Skip output and explicitly skipped files
    if (input.includes('-out.') || input.includes('-skip.')) continue

    // Generate output and expected file names
    let match = path.basename(input).match(/^([^-.]+)(-.+)?\.(.+)$/)
    let output = path.join(__dirname, 'fixtures', `${match[1]}${match[2] || ''}-out.${match[3]}`)
    let expected = path.join(__dirname, 'fixtures', `${match[1]}.${match[3]}`)

    assert.comment(`Converting ${path.basename(input)} to ${path.basename(output)}`)
    try {
      await convert(input, output)
    } catch (error) {
      // Skip test if converter not found
      if (error.message.match(/^No converter/)) {
        assert.skip(error.message)
      } else {
        assert.fail(error)
        console.error(error)
      }
      continue
    }

    // Compare expected and actual output
    const expectedString = fs.readFileSync(expected).toString().trim()
    const actualString = fs.readFileSync(output).toString().trim()
    const message = `${path.basename(output)} == ${path.basename(expected)}`
    if (expected.length < 100) assert.equal(actualString, expectedString, message)
    else assert.ok(actualString === expectedString, message)
  }

  assert.end()
})