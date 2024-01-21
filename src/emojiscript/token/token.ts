type ValidKey = number | string

export const invertObj = <K extends ValidKey, V extends ValidKey>(
  object: Record<K, V>
): Record<V, K> =>
  Object.entries(object).reduce(
    (swapped, [key, value]) => ({ ...swapped, [value as ValidKey]: key }),
    {} as Record<V, K>
  )

export const CHARACTER = {
  A: '🅰️',
  B: '🅱️',
  C: '©️',
  M: 'Ⓜ️',
  O: '🅾️',
  R: '®️',
  P: '🅿️',
  I: 'ℹ️',
  H: '♓',
  S: '💲',
  AB: '🆎',
  CL: '🆑',
  COOL: '🆒',
  FREE: '🆓',
  ZZZ: '💤',
  ID: '🆔',
  NEW: '🆕',
  NG: '🆖',
  OK: '🆗',
  SOS: '🆘',
  UP: '🆙',
  VS: '🆚',
  abc: '🔤',
  abcd: '🔡',
  ABCD: '🔠'
}

export const CHARACTER_TO_TYPE = invertObj(CHARACTER)

export const isCharacter = (c: string | null) =>
  CHARACTER_TO_TYPE[c as keyof typeof CHARACTER_TO_TYPE] !== undefined

export const NUMBER = {
  '0': '0️⃣',
  '1': '1️⃣',
  '2': '2️⃣',
  '3': '3️⃣',
  '4': '4️⃣',
  '5': '5️⃣',
  '6': '6️⃣',
  '7': '7️⃣',
  '8': '🎱',
  '9': '9️⃣'
}

export const NUMBER_TO_TYPE = invertObj(NUMBER)

export const isNumber = (c: string | null) =>
  NUMBER_TO_TYPE[c as keyof typeof NUMBER_TO_TYPE] !== undefined

export const KEYWORD = {
  TRUE: '✅',
  FALSE: '❌',
  LET: '📝',
  IF: '🤔',
  ELSE: '⤵️',
  FUNCTION: '🔧',
  WHILE: '🔄',
  FOR: '🔁',
  BREAK: '⏹️',
  CONTINUE: '▶️',
  RETURN: '🔙'
}

export const KEYWORD_TO_TYPE = invertObj(KEYWORD)

export const isKeyword = (c: string | null) =>
  KEYWORD_TO_TYPE[c as keyof typeof KEYWORD_TO_TYPE] !== undefined

export const DELIMITER = {
  DECIMAL_SEPARATOR: '⏺️',
  ARGUMENT_SEPARATOR: '🔸',
  END_OF_LINE: '🚀',
  BLOCK_START: '🌅',
  BLOCK_END: '🌇'
}

export const DELIMITER_TO_TYPE = invertObj(DELIMITER)

export const isDelimiter = (c: string | null) =>
  DELIMITER_TO_TYPE[c as keyof typeof DELIMITER_TO_TYPE] !== undefined

export const OPERATOR = {
  PLUS: '➕',
  MINUS: '➖',
  TIMES: '✖️',
  DIVISION: '➗',
  BANG: '❗',
  AND: '🔺',
  OR: '🔻',
  EQ: '⚖️',
  GT: '🔼',
  LT: '🔽',
  ASSIGN: '➡️',
  LOOKUP: '🔍'
}

export const OPERATOR_TO_TYPE = invertObj(OPERATOR)

export const isOperator = (c: string | null) =>
  OPERATOR_TO_TYPE[c as keyof typeof OPERATOR_TO_TYPE] !== undefined

export const DATA_STRUCTURE = {
  LIST: '📋',
  HASH: '📦',
  KEY: '🔑'
}

export const DATA_STRUCTURE_TO_TYPE = invertObj(DATA_STRUCTURE)

export const isDataStructure = (c: string | null) =>
  DATA_STRUCTURE_TO_TYPE[c as keyof typeof DATA_STRUCTURE_TO_TYPE] !== undefined

export type TokenType =
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'END_OF_FILE'
  | 'ILLEGAL'
  | keyof typeof KEYWORD
  | keyof typeof DELIMITER
  | keyof typeof OPERATOR
  | keyof typeof DATA_STRUCTURE

export type Token = {
  type: TokenType
  literal: string
}

export const newToken = (
  type: TokenType,
  literal: string | string[]
): Token => ({
  type,
  literal: Array.isArray(literal) ? literal.join('') : literal
})
