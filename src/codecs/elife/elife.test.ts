import { ElifeCodec } from '.'
import { unlinkFiles } from '../../util/media/unlinkFiles'
import { nockRecord, snapshot } from '../../__tests__/helpers'
import { YamlCodec } from '../yaml'

const elife = new ElifeCodec()
const { sniff, encode } = elife

const yaml = new YamlCodec()

const elife2yaml = async (article: string) => {
  // Fetch, with recording, the complete article
  const done = await nockRecord(`nock-record-${article}.json`)
  const node = await elife.load(`elife: ${article}`)
  done()
  // Unlink to remove references to local files (which are non-deterministic)
  const unlinked = unlinkFiles(node)
  // Convert to YAML
  return await await yaml.dump(unlinked)
}

test('sniff', async () => {
  expect(await sniff('elife:45187')).toBe(true)
  expect(await sniff('elife: 45187')).toBe(true)
  expect(await sniff('eLife 45187')).toBe(true)
  expect(await sniff('ELIFE: 45187')).toBe(true)
  expect(await sniff(' eLife :  45187  ')).toBe(true)

  expect(await sniff('https://elifesciences.org/articles/45187')).toBe(true)
  expect(await sniff('http://elifesciences.org/articles/45187')).toBe(true)
  expect(await sniff(' https://elifesciences.org/articles/45187  ')).toBe(true)

  expect(await sniff('e life: 45187')).toBe(false)
  expect(await sniff('https://example.org/articles/45187')).toBe(false)
})

test('decode', async () => {
  expect(await elife2yaml('46793')).toMatchFile(snapshot('46793.yaml'))
  expect(await elife2yaml('45123')).toMatchFile(snapshot('45123.yaml'))
  // A non-existent article id, will emit warning but still generate a document
  expect(await elife2yaml('00000')).toMatchFile(snapshot('00000.yaml'))
})

test('encode', async () => {
  expect(() => encode()).toThrow(
    /Encoding to an eLife article is not yet implemented/
  )
})
