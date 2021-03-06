/**
 * A utility module for HTTP requests
 *
 * Uses `got` to enable RFC 7234 compliant HTTP caching
 *
 * @module util/http
 */

import { getLogger } from '@stencila/logga'
import fs from 'fs'
import got, { Response } from 'got'
import stream from 'stream'
import util from 'util'
import cache from './app/cacheSync'

const pipeline = util.promisify(stream.pipeline)

const log = getLogger('encoda:util:http')

/**
 * A `got` instance with default options for
 * HTTP requests.
 */
const http = got.extend({
  cache,
  headers: {
    'user-agent': `encoda (https://github.com/stencila/encoda)`,
    'accept-encoding': 'gzip, deflate',
  },
})

/**
 * Get content from a URL
 *
 * @param url The URL to get
 * @param options Options to pass to `got`
 */
export async function get(
  url: string,
  options: any = {}
): Promise<Response<string>> {
  try {
    return await http.get(url, options)
  } catch (error) {
    const { message, response = {} } = error
    const { body = '' } = response
    log.warn(`Unable to get ${url}: ${message}: ${body}`)
    return response
  }
}

/**
 * Download a file
 *
 * @param url The URL to download from
 * @param filePath The file path to download to
 */
export async function download(url: string, filePath: string): Promise<void> {
  return pipeline(http.stream(url), fs.createWriteStream(filePath))
}

/**
 * Clear any cached content for a particular URL
 *
 * @param url The URL to clear the cache for
 */
export function cacheDelete(url: string): boolean {
  return cache.delete('cacheable-request:GET:' + url)
}
