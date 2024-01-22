import {
  BlockStatement,
  Boolean,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
  InfixExpression,
  LetStatement,
  Node,
  NodeType,
  NumberLiteral,
  PrefixExpression,
  Program,
  ReturnStatement
} from '../ast/ast'
import { Environment } from '../object/environment'
import {
  BooleanObject,
  DataObject,
  DataObjectType,
  FunctionObject,
  NumberObject,
  createBoolean,
  createError,
  createFunction,
  createNull,
  createNumber,
  createReturnValue,
  isBoolean,
  isError,
  isFunction,
  isNull,
  isNumber,
  isReturnValue
} from '../object/object'
import { OPERATOR } from '../token/token'

const isTruthy = (obj: DataObject): boolean => {
  if (isNumber(obj)) {
    return true
  } else if (isBoolean(obj)) {
    return obj.value === true
  } else if (isNull(obj)) {
    return false
  }
  return false
}

export const evaluate = (
  node: Node | null,
  environment: Environment
): DataObject => {
  if (node === null) {
    return createNull()
  }
  const evaluator = EVALUATORS[node.type]
  if (!evaluate) {
    return notImplemented(node)
  }

  return evaluator(node, environment)
}

const notImplemented = (node: Node | DataObject | string): DataObject => {
  if (typeof node === 'string') {
    return createError(`Missing evaluator for ${node}`)
  }
  return createError(`Missing evaluator for type ${node.type}`)
}

const evaluateNumberLiteral = (
  node: NumberLiteral,
  _environment: Environment
): DataObject => {
  return createNumber(node.value)
}

const evaluateBoolean = (
  node: Boolean,
  _environment: Environment
): DataObject => {
  return createBoolean(node.value)
}

const evaluateExpressionStatement = (
  node: ExpressionStatement,
  environment: Environment
): DataObject => {
  return evaluate(node.expression, environment)
}

const evaluatePrefixExpression = (
  node: PrefixExpression,
  environment: Environment
): DataObject => {
  const right = evaluate(node.right, environment)
  if (isError(right)) {
    return right
  }
  switch (node.operator) {
    case OPERATOR.BANG: {
      return evaluateBangOperatorExpression(right, environment)
    }
    case OPERATOR.MINUS: {
      return evaluateMinusPrefixOperatorExpression(right, environment)
    }
    default: {
      return createError(
        `Unknown operator: ${node.operator} ${node.right?.type}`
      )
    }
  }
}

const evaluateBangOperatorExpression = (
  right: DataObject,
  _environment: Environment
): DataObject => {
  switch (right.type) {
    case DataObjectType.Number:
    case DataObjectType.Null: {
      return createBoolean(true)
    }
    case DataObjectType.Boolean: {
      const obj = right as BooleanObject
      return createBoolean(!obj.value)
    }
    default: {
      return notImplemented(right)
    }
  }
}

const evaluateMinusPrefixOperatorExpression = (
  right: DataObject,
  _environment: Environment
): DataObject => {
  if (!isNumber(right)) {
    return createError(`Unknown operator - ${right.type}`)
  }

  const value = right.value * -1
  return createNumber(value)
}

const evaluateInfixExpression = (
  node: InfixExpression,
  environment: Environment
): DataObject => {
  const left = evaluate(node.left, environment)

  if (isError(left)) {
    return left
  }

  const right = evaluate(node.right, environment)

  if (isError(right)) {
    return right
  }

  if (isNumber(left) && isNumber(right)) {
    return evaluateIntegerInfixExpression(node.operator, left, right)
  }
  const operator = node.operator
  switch (operator) {
    case OPERATOR.EQ: {
      return createBoolean(left === right)
    }
    default: {
      return createError(
        `Unknown operator: ${node.left?.type} ${node.operator} ${node.right?.type}`
      )
    }
  }
}

const evaluateIntegerInfixExpression = (
  operator: string,
  left: NumberObject,
  right: NumberObject
): DataObject => {
  const leftValue = left.value
  const rightValue = right.value
  switch (operator) {
    case OPERATOR.PLUS: {
      return createNumber(leftValue + rightValue)
    }
    case OPERATOR.MINUS: {
      return createNumber(leftValue - rightValue)
    }
    case OPERATOR.TIMES: {
      return createNumber(leftValue * rightValue)
    }
    case OPERATOR.DIVISION: {
      if (rightValue === 0) {
        return createError('Cannot divide with zero. Impossible!')
      }
      return createNumber(leftValue / rightValue)
    }
    case OPERATOR.GT: {
      return createBoolean(leftValue > rightValue)
    }
    case OPERATOR.LT: {
      return createBoolean(leftValue < rightValue)
    }
    case OPERATOR.EQ: {
      return createBoolean(leftValue === rightValue)
    }
    default: {
      return createError(
        `Unknown operator ${left.type} ${operator} ${right.type}`
      )
    }
  }
}

const evaluateIfExpression = (
  node: IfExpression,
  environment: Environment
): DataObject => {
  const evaluatedCondition = evaluate(node.condition, environment)

  if (isError(evaluatedCondition)) {
    return evaluatedCondition
  }

  if (isTruthy(evaluatedCondition)) {
    return evaluate(node.consequence, environment)
  }
  if (node.alternative) {
    return evaluate(node.alternative, environment)
  }

  return createNull()
}

const evaluateBlockStatement = (
  node: BlockStatement,
  environment: Environment
): DataObject => {
  let result: DataObject = createNull()
  for (const statement of node.statements) {
    result = evaluate(statement, environment)

    if (isReturnValue(result) || isError(result)) {
      return result
    }
  }
  return result
}

const evaluateReturnStatement = (
  node: ReturnStatement,
  environment: Environment
): DataObject => {
  const value = evaluate(node.returnValue, environment)
  if (isError(value)) {
    return value
  }
  return createReturnValue(value)
}

const evaluateProgram = (
  node: Program,
  environment: Environment
): DataObject => {
  let result: DataObject = createNull()
  for (const statement of node.statements) {
    result = evaluate(statement, environment)

    if (isError(result)) {
      return result
    }

    if (isReturnValue(result)) {
      return result.value
    }
  }
  return result
}

const evaluateLetStatement = (
  node: LetStatement,
  environment: Environment
): DataObject => {
  const value = evaluate(node.value, environment)
  if (isError(value)) {
    return value
  }
  environment.set(node.name.value, value)
  return createNull()
}

const evaluateIdentifier = (
  node: Identifier,
  environment: Environment
): DataObject => {
  const value = environment.get(node.value)
  if (value === undefined) {
    return createError(`Identifer not found: ${node.value}`)
  }
  return value
}

const evaluateFunctionLiteral = (
  node: FunctionLiteral,
  environment: Environment
): DataObject => {
  const params = node.parameters
  const body = node.body
  if (!body) {
    return createError(`Missing function body`)
  }
  return createFunction(params, body, environment)
}

const evaluateCallExpression = (
  node: CallExpression,
  environment: Environment
): DataObject => {
  const fn = evaluate(node.function, environment) as FunctionObject
  if (isError(fn)) {
    return fn
  }
  const args = evaluateExpressions(node.arguments, environment)
  if (args.length > 0 && isError(args[0])) {
    return args[0]
  }

  return applyFunction(fn, args)
}

const applyFunction = (fn: DataObject, args: DataObject[]): DataObject => {
  if (!isFunction(fn)) {
    return createError(`expected a function, got: ${fn.type}`)
  }
  const extendedEnvironment = extendFunctionEnvironment(fn, args)
  const evaluated = evaluate(fn.body, extendedEnvironment)
  return unwrapReturnValue(evaluated)
}

const extendFunctionEnvironment = (
  fn: FunctionObject,
  args: DataObject[]
): Environment => {
  const environment = new Environment(fn.environment)

  fn.parameters.forEach((param, i) => {
    environment.set(param.value, args[i])
  })

  return environment
}

const unwrapReturnValue = (obj: DataObject): DataObject => {
  if (isReturnValue(obj)) {
    return obj.value
  }
  return obj
}

const evaluateExpressions = (
  expressions: Expression[],
  environment: Environment
): DataObject[] => {
  const result: DataObject[] = []
  for (const exp of expressions) {
    const evaluated = evaluate(exp, environment)
    if (isError(evaluated)) {
      return [evaluated as DataObject]
    }
    result.push(evaluated)
  }

  return result
}

const EVALUATORS: Record<NodeType, (n: any, e: Environment) => DataObject> = {
  [NodeType.Statement]: notImplemented,
  [NodeType.Expression]: notImplemented,
  [NodeType.Program]: evaluateProgram,
  [NodeType.LetStatement]: evaluateLetStatement,
  [NodeType.ReturnStatement]: evaluateReturnStatement,
  [NodeType.ExpressionStatement]: evaluateExpressionStatement,
  [NodeType.BlockStatement]: evaluateBlockStatement,
  [NodeType.Identifier]: evaluateIdentifier,
  [NodeType.Boolean]: evaluateBoolean,
  [NodeType.NumberLiteral]: evaluateNumberLiteral,
  [NodeType.InfixExpression]: evaluateInfixExpression,
  [NodeType.PrefixExpression]: evaluatePrefixExpression,
  [NodeType.IfExpression]: evaluateIfExpression,
  [NodeType.FunctionLiteral]: evaluateFunctionLiteral,
  [NodeType.CallExpression]: evaluateCallExpression
}
