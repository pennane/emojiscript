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

    const syntaxErrors = parser.getErrors()

    if (syntaxErrors.length > 0) {
      return this.print(syntaxErrors.map((e) => `Error: ${e}`).join('\n'))
    }

    const environment = new Environment()

    const evaluated = evaluate(program, environment).inspect()

    this.print(evaluated)
  }
}
