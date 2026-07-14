import { merge, escape } from './utils.js'
import defaultOptions from './defaults.js'
import Parser from './parser.js'
import Lexer from './lexer.js'
import Renderer from './renderer.js'
import InlineLexer from './inline-lexer.js'

export {Parser, Lexer, Renderer, InlineLexer}
export function render(src, opt) {
  if (opt) opt = merge({}, defaultOptions, opt)
  return Parser.parse(Lexer.lex(src, opt), opt)
}
