import type { Dirent, PathLike } from 'fs'
import type { Path } from 'typescript'
import { statSync, promises } from 'fs'
import {URL, fileURLToPath, format} from 'url'
import * as path from 'path'
import { StringDecoder } from 'string_decoder'

export interface Options {
  check?: boolean
  encoding?: BufferEncoding
  err?
}

export function processPathParamSync (pathLike: PathLike, options?: Options): string
export function processPathParamSync (pathLike: PathLike, options: Options & {check: true}): [string, boolean]
export function processPathParamSync (pathLike: PathLike, check: true): [string, boolean]
export function processPathParamSync (pathLike: PathLike, encoding: BufferEncoding): string
export function processPathParamSync (pathLike: PathLike, options) {
  let result: string
  const { check, encoding, err } = getArgs(options)
  if (err) throw new Error() // FIXME
  if (pathLike instanceof Buffer) pathLike = new StringDecoder(encoding).write(pathLike)
  if (pathLike instanceof URL) {
    if (pathLike.protocol !== 'file') throw new Error()
    pathLike = format(pathLike)
  }
  if (typeof pathLike !== 'string') throw new Error() // FIXME
  if (pathLike.startsWith('file:/')) result = fileURLToPath(pathLike)
  else result = path.resolve(pathLike)
  try {
    if (check) statSync(result)
    return result
  } catch {
    return [result, false] as [string, boolean]
  }
}

export async function processPathParam (pathLike: PathLike, options?: Options): Promise<string>
export async function processPathParam (pathLike: PathLike, options: Options & {check: true}): Promise<[string, boolean]>
export async function processPathParam (pathLike: PathLike, check: true): Promise<[string, boolean]>
export async function processPathParam (pathLike: PathLike, encoding: BufferEncoding): Promise<string>
export async function processPathParam (pathLike: PathLike, options) {
  let result: string
  const { check, encoding, err } = getArgs(options)
  if (err) throw new Error() // FIXME
  if (pathLike instanceof Buffer) pathLike = new StringDecoder(encoding).write(pathLike)
  if (pathLike instanceof URL) {
    if (pathLike.protocol !== 'file') throw new Error()
    pathLike = format(pathLike)
  }
  if (typeof pathLike !== 'string') throw new Error() // FIXME
  if (pathLike.startsWith('file:/')) result = fileURLToPath(pathLike)
  else result = path.resolve(pathLike)
  try {
    if (check) await promises.stat(result)
    return result
  } catch {
    return [result, false] as [string, boolean]
  }
}

const encodings = ['ascii', 'utf8', 'utf-8', 'utf16le', 'ucs2', 'ucs-2', 'base64', 'latin1', 'binary', 'hex']

function getArgs (arg: Options | boolean | BufferEncoding | 0 | 1) {
  const options: Options = {}
    switch (typeof arg) {
    case 'object':
      Object.assign(options, arg)
    case 'string':
      // specifying because the ts compiler doesn't work well with switches
      if ((arg as string) in encodings) options.encoding = arg as BufferEncoding
      break
    case 'boolean': options.check = arg
      break
    case 'number': options.check = !!arg
      break
    default: options.err = arg
    }
  return options
}
