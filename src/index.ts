import stencila from '@stencila/schema'
import mime from 'mime'
import path from 'path'
import * as csv from './csv'
import * as docx from './docx'
import * as gdoc from './gdoc'
import * as html from './html'
import * as jats from './jats'
import * as json from './json'
import * as json5 from './json5'
import * as latex from './latex'
import * as md from './md'
import * as ods from './ods'
import * as odt from './odt'
import * as pandoc from './pandoc'
import * as pdf from './pdf'
import * as rpng from './rpng'
import * as tdp from './tdp'
import * as vfile from './vfile'
import * as xlsx from './xlsx'
import * as yaml from './yaml'

type VFile = vfile.VFile

/**
 * A list of all codecs.
 *
 * Note that order is of importance for matching. More "generic"
 * formats should go last. See the `match` function.
 */
export const codecList: Array<Codec> = [
  // Tabular data, spreadsheets etc
  csv,
  ods,
  tdp,
  xlsx,

  // Articles, textual documents etc
  docx,
  gdoc,
  html,
  jats,
  latex,
  md,
  odt,
  pdf,

  // Images
  rpng,

  // Data interchange formats
  yaml,
  pandoc,
  json5,
  json
]

/**
 * The interface for a codec.
 *
 * A codec is simply a module with these constants
 * and functions (some of which are optional).
 *
 * Note that our use of the term "codec", is consistent with our usage elsewhere in Stencila
 * as something that creates or modifies executable document, and
 * differs from the usage of [`unified`](https://github.com/unifiedjs/unified#processorcodec).
 */
export interface Codec {
  /**
   * An array of [IANA Media Type](https://www.iana.org/assignments/media-types/media-types.xhtml)
   * that the codec can decode/encode.
   */
  mediaTypes: Array<string>

  /**
   * Any array of file names to use to match the codec.
   * This can be useful for differentiating between
   * "flavors" of formats e.g. `datapackage.json` versus any old `.json` file.
   */
  fileNames?: Array<string>

  /**
   * Any array of file name extensions to register for the codec.
   * This can be useful for specifying conversion to less well known media types
   * e.g. `--to tdp` for outputting `datapackage.json` to the console.
   */
  extNames?: Array<string>

  /**
   * A function that does [content sniffing](https://en.wikipedia.org/wiki/Content_sniffing)
   * to determine if the codec is able to decode the content. As well as raw content, the content
   * string could be a file system path and the codec could do "sniffing" of the file system
   * (e.g. testing if certain files are present in a directory).
   */
  sniff?: (content: string) => Promise<boolean>

  /**
   * Decode a `VFile` to a `stencila.Node`.
   *
   * @param file The `VFile` to decode
   * @returns A promise that resolves to a `stencila.Node`
   */
  decode: (file: VFile) => Promise<stencila.Node>

  /**
   * Encode a `stencila.Node` to a `VFile`.
   *
   * @param thing The `stencila.Node` to encode
   * @param filePath The file system path to encode to
   *                 (Can be used by codecs that need to write more than one file when encoding)
   * @returns A promise that resolves to a `VFile`
   */
  encode: (node: stencila.Node, filePath?: string) => Promise<VFile>
}

/**
 * Match the codec based on file name, extension name, media type or by content sniffing.
 *
 * Iterates through the list of codecs and returns the first that matches based on any
 * of the above criteria.
 *
 * If the supplied format contains a forward slash then it is assumed to be a media type,
 * otherwise an extension name.
 *
 * @param content The content as a file path (e.g. `../folder/file.txt`) or raw content
 * @param format The format as a media type (e.g. `text/plain`) or extension name (e.g. `txt`)
 * @returns A promise that resolves to the `Codec` to use
 */
export async function match(content?: string, format?: string): Promise<Codec> {
  // Resolve variables used to match a codec...
  let fileName
  let extName
  let mediaType
  // If the content is a path then begin with derived values
  if (content && vfile.isPath(content)) {
    fileName = path.basename(content)
    extName = path.extname(content).slice(1)
    mediaType = mime.getType(content) || undefined
  }
  // But override with supplied format (if any) assuming that
  // media types always have a forward slash and extension names
  // never do.
  if (format) {
    if (format.includes('/')) mediaType = format
    else {
      extName = format
      mediaType = mime.getType(extName) || undefined
    }
  }

  for (let codec of codecList) {
    if (fileName && codec.fileNames && codec.fileNames.includes(fileName)) {
      return codec
    }

    if (extName && codec.extNames && codec.extNames.includes(extName)) {
      return codec
    }

    if (mediaType && codec.mediaTypes && codec.mediaTypes.includes(mediaType)) {
      return codec
    }

    if (content && codec.sniff && (await codec.sniff(content))) {
      return codec
    }
  }

  let message = 'No codec could be found'
  if (content) message += ` for content "${content}"`
  if (format) message += ` for format "${format}"`
  message += '.'
  throw new Error(message)
}

/**
 * Is the file path, or media type handled? (i.e. is there a codec for it?)
 *
 * @param content The file path
 * @param format The media type
 */
export async function handled(
  content?: string,
  format?: string
): Promise<boolean> {
  try {
    await match(content, format)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Decode a virtual file to a `stencila.Node`
 *
 * @param file The `VFile` to decode
 * @param content The file path
 * @param format The media type
 */
export async function decode(
  file: VFile,
  content?: string,
  format?: string
): Promise<stencila.Node> {
  const codec = await match(content, format)
  return codec.decode(file)
}

/**
 * Encode (i.e. serialize) a `stencila.Node` to a virtual file.
 *
 * @param node The node to encode
 * @param filePath The file path to encode the node to.
 *                 Only required for some codecs e.g. those encoding to more than one file.
 * @param format The format to encode the node as.
 *               If undefined then determined from filePath or file path.
 */
export async function encode(
  node: stencila.Node,
  filePath?: string,
  format?: string
): Promise<VFile> {
  const codec = await match(filePath, format)
  return codec.encode(node, filePath)
}

/**
 * Load a `stencila.Node` from a string of content.
 *
 * @param content The content to load.
 * @param format The format to load the content as.
 */
export async function load(
  content: string,
  format: string
): Promise<stencila.Node> {
  const file = vfile.load(content)
  return decode(file, undefined, format)
}

/**
 * Dump a `stencila.Node` to a string of content.
 *
 * @param node The node to dump.
 * @param format The format to dump the node as.
 */
export async function dump(
  node: stencila.Node,
  format: string
): Promise<string> {
  const file = await encode(node, undefined, format)
  return vfile.dump(file)
}

/**
 * Read a file to a `stencila.Node`.
 *
 * @param content The raw content or file path to read.
 *                Use `-` to read from standard input.
 * @param format The format to read the file as.
 *               If undefined then determined from content or file path.
 */
export async function read(
  content: string,
  format?: string
): Promise<stencila.Node> {
  let file = await vfile.read(content)
  return decode(file, content, format)
}

/**
 * Write a `stencila.Node` to a file.
 *
 * @param node The node to write.
 * @param filePath The file system path to write to.
 *                 Use `-` write to standard output.
 * @param format The format to write the node as.
 */
export async function write(
  node: stencila.Node,
  filePath: string,
  format?: string
): Promise<VFile> {
  let file = await encode(node, filePath, format)
  await vfile.write(file, filePath)
  return file
}

/**
 * Convert content from one format to another.
 *
 * @param input The input content (raw or file path).
 * @param outputPath The output file path.
 * @param options Conversion options e.g `from` and `to`: to specify the formats to convert from/to
 * @returns The converted content, or file path (for converters that only write to files).
 */
export async function convert(
  input: string,
  outputPath?: string,
  options: { [key: string]: any } = {}
): Promise<string | undefined> {
  const inputFile = vfile.create(input)
  const node = await decode(inputFile, input, options.from)
  const outputFile = await encode(node, outputPath, options.to)
  if (outputPath) await vfile.write(outputFile, outputPath)
  return outputFile.contents ? vfile.dump(outputFile) : outputFile.path
}