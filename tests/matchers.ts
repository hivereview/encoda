import * as stencila from '@stencila/schema'
import fs from 'fs-extra'
import mime from 'mime'
import path from 'path'

// Ensure that the dir for test outputs is present
fs.ensureDirSync(path.join(__dirname, 'output'))

/**
 * Add a Jest matcher for testing that a codec is able
 * to invert a node (ie. encode and then decode)
 * and produce useful error messages if it did not.
 *
 * @param codec The codec (passed by expect)
 * @param node The node to attempt to invert
 * @param name: The file name for any output files
 */
expect.extend({
  async toInvert(codec, node, fileName?: string) {
    if (!fileName) {
      const type = stencila.type(node).toLowerCase()
      const num = Math.floor(Math.random() * Math.floor(1000))
      fileName = `${type}-${num}`
      const ext =
        (codec.extNames && codec.extNames[0]) ||
        (codec.mediaTypes && mime.getExtension(codec.mediaTypes[0]))
      if (ext) fileName += '.' + ext
    }
    const outPath = path.join(__dirname, 'output', fileName)
    const file = await codec.encode(node, outPath)
    const nodeDecoded = await codec.decode(file)
    try {
      expect(nodeDecoded).toEqual(node)
    } catch (error) {
      return {
        message: () => {
          let extra
          if (file.path)
            extra = `\n\nthe generated file was: ${path.relative(
              path.dirname(__dirname),
              file.path
            )}`
          else extra = `\n\nthe generated content was: ${file.contents}`
          return error.message + extra
        },
        pass: false
      }
    }
    // Clean up
    await fs.remove(outPath)
    return {
      message: () => 'ok!',
      pass: true
    }
  }
})
declare global {
  namespace jest {
    interface Matchers<R> {
      toInvert(node: stencila.Node, fileName?: string): R
    }
  }
}