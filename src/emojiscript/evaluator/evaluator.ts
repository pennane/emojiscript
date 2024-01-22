import {
  Boolean,
  ExpressionStatement,
  InfixExpression,
  Node,
  NodeType,
  NumberLiteral,
  PrefixExpression,
  Program,
  Statement
} from '../ast/ast'
import {
  BooleanObject,
  DataObject,
  DataObjectType,
  NumberObject,
  createBoolean,
  createNull,
  createNumber,
  isNumber
} from '../object/object'
import { OPERATOR } from '../token/token'

export const evaluate = (node: Node | null): DataObject => {
  if (!node) {
    return createNull()
  }
  const evaluator = EVALUATORS[node.type]
  if (!evaluate) {
    return notImplemented(node)
  }
  return evaluator(node)
}

const notImplemented = (node: Node | DataObject | string): DataObject => {
  if (typeof node === 'string') {
    throw `Missing evaluator for ${node}`
  }
  throw new Error(`Missing evaluator for type ${node.type}`)
}

const evaluateNumberLiteral = (node: NumberLiteral): DataObject => {
  return createNumber(node.value)
}

const evaluateBoolean = (node: Boolean): DataObject => {
  return createBoolean(node.value)
}

const evaluateProgram = (node: Program): DataObject => {
  return evaluateStatements(node.statements)
}

const evaluateExpressionStatement = (node: ExpressionStatement): DataObject => {
  return evaluate(node.expression)
}

const evaluatePrefixExpression = (node: PrefixExpression): DataObject => {
  switch (node.operator) {
    case OPERATOR.BANG: {
      return evaluateBangOperatorExpression(evaluate(node.right))
    }
    case OPERATOR.MINUS: {
      return evaluateMinusPrefixOperatorExpression(evaluate(node.right))
    }
    default: {
      return notImplemented(node)
    }
  }
}

const evaluateBangOperatorExpression = (right: DataObject): DataObject => {
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
  right: DataObject
): DataObject => {
  if (!isNumber(right)) {
    return createNull()
  }

  const value = right.value * -1
  return createNumber(value)
}

const evaluateInfixExpression = (node: InfixExpression): DataObject => {
  const left = evaluate(node.left)
  const right = evaluate(node.right)
  if (isNumber(left) && isNumber(right)) {
    return evaluateIntegerInfixExpression(node.operator, left, right)
  }
  const operator = node.operator
  switch (operator) {
    case OPERATOR.EQ: {
      return createBoolean(left === right)
    }
    default: {
      return notImplemented(operator)
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
      return notImplemented(operator)
    }
  }
}

const evaluateStatements = (statements: Statement[]): DataObject => {
  let result: DataObject = createNull()
  for (const statement of statements) {
    result = evaluate(statement)
  }
  return result
}

const EVALUATORS: Record<NodeType, (n: any) => DataObject> = {
  [NodeType.Statement]: notImplemented,
  [NodeType.Expression]: notImplemented,
  [NodeType.Program]: evaluateProgram,
  [NodeType.LetStatement]: notImplemented,
  [NodeType.ReturnStatement]: notImplemented,
  [NodeType.ExpressionStatement]: evaluateExpressionStatement,
  [NodeType.BlockStatement]: notImplemented,
  [NodeType.Identifier]: notImplemented,
  [NodeType.Boolean]: evaluateBoolean,
  [NodeType.NumberLiteral]: evaluateNumberLiteral,
  [NodeType.InfixExpression]: evaluateInfixExpression,
  [NodeType.PrefixExpression]: evaluatePrefixExpression,
  [NodeType.IfExpression]: notImplemented,
  [NodeType.FunctionLiteral]: notImplemented,
  [NodeType.CallExpression]: notImplemented
}
