import { evaluate } from '../evaluator/evaluator'
import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'

export class Repl {
  constructor(public print: (parsed: string) => void) {}
  evaluate(code: string) {
    const lexer = new Lexer(code)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()
    const errors = parser.getErrors()

    let evaluated: string

    try {
      evaluated = evaluate(program).inspect()
    } catch (e: any) {
      evaluated = e.message
    }

    this.print(
      JSON.stringify(
        {
          evaluated: evaluated,
          ast: { string: program.string(), errors, program }
        },
        null,
        4
      )
    )
  }
}
