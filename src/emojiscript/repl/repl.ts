import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'

export class Repl {
  constructor(public print: (parsed: string) => void) {}
  evaluate(code: string) {
    const lexer = new Lexer(code)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()
    const errors = parser.getErrors()

    this.print(
      JSON.stringify({ errors, string: program.string(), program }, null, 2)
    )
  }
}
