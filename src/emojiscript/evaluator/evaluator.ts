import { Node, NodeType, NumberLiteral } from '../ast/ast'
import { DataObject, createNumber } from '../object/object'

const notImplemented = (node: Node): DataObject => {
  throw new Error('Missing evaluator for ' + node.type)
}

const evaluateNumberLiteral = (node: NumberLiteral): DataObject => {
  return createNumber(node.value)
}

const EVALUATORS: Record<NodeType, (n: any) => DataObject> = {
  [NodeType.Statement]: notImplemented,
  [NodeType.Expression]: notImplemented,
  [NodeType.Program]: notImplemented,
  [NodeType.LetStatement]: notImplemented,
  [NodeType.ReturnStatement]: notImplemented,
  [NodeType.ExpressionStatement]: notImplemented,
  [NodeType.BlockStatement]: notImplemented,
  [NodeType.Identifier]: notImplemented,
  [NodeType.Boolean]: notImplemented,
  [NodeType.NumberLiteral]: evaluateNumberLiteral,
  [NodeType.InfixExpression]: notImplemented,
  [NodeType.PrefixExpression]: notImplemented,
  [NodeType.IfExpression]: notImplemented,
  [NodeType.FunctionLiteral]: notImplemented,
  [NodeType.CallExpression]: notImplemented
}

export const evaluate = (node: Node): DataObject => {
  const evaluator = EVALUATORS[node.type]
  if (!evaluate) {
    return notImplemented(node)
  }
  return evaluator(node)
}
