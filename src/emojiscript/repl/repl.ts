import { evaluate } from '../evaluator/evaluator'
import { Lexer } from '../lexer/lexer'
import { Environment } from '../object/environment'
import { Parser } from '../parser/parser'

export class Repl {
  constructor(public print: (parsed: string) => void) {}
  evaluate(code: string) {
    const lexer = new Lexer(code)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()
    const errors = parser.getErrors()

    const environment = new Environment()

    const evaluated = evaluate(program, environment).inspect()

    this.print(
      JSON.stringify(
        {
          evaluated: evaluated,
          ast: { string: program.string(), errors, program },
          environment: environment.entries()
        },
        null,
        4
      )
    )
  }
}
