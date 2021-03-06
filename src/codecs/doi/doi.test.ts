import { DoiCodec } from '.'
import { convert } from '../..'
import { nockRecord, snapshot } from '../../__tests__/helpers'

const { sniff, encode } = new DoiCodec()

test('sniff', async () => {
  expect(await sniff('10.1001/this/is/a/doi')).toBe(true)
  expect(await sniff('doi 10.1001/ok')).toBe(true)
  expect(await sniff('DOI 10.1001/ok')).toBe(true)
  expect(await sniff('DOI: 10.1001/ok')).toBe(true)
  expect(await sniff('  DOI :  10.1001/ok   ')).toBe(true)
  expect(await sniff('http://doi.org/10.5334/jors.182')).toBe(true)
  expect(await sniff('  https://doi.org/10.5334/jors.182  ')).toBe(true)

  // The `foo` in these example makes them not DOIs
  expect(await sniff('foo')).toBe(false)
  expect(await sniff('doi: foo')).toBe(false)
  expect(await sniff('doi: 10.1001/this/is/a/doi foo')).toBe(false)
  expect(await sniff('http://foo.org/10.5334/jors.182')).toBe(false)
})

const doi2yaml = async (doi: string) =>
  convert(doi, undefined, { from: 'doi', to: 'yaml' })

test('decode', async () => {
  const done = await nockRecord('10.5334-jors-182.json')
  expect(await doi2yaml('10.5334/jors.182')).toMatchFile(
    snapshot('10.5334-jors-182.yaml')
  )
  done()
})

test('encode', async () => {
  expect(() => encode()).toThrow(/Encoding to DOI is not yet implemented/)
})
