import { type Token, type TokenType } from '../types/general'
import { RESERVED_CHARS, RESERVED_WORDS, TYPES } from './config'
import { type ITextUtils } from './utils'

export class TextUtils implements ITextUtils {
  parseTextTokens(textContent: string): Token[] {
    const lines = textContent.split('\n')

    const tokens: Token[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineTokens = this.parseLine(line, i)
      tokens.push(...lineTokens)
    }

    return tokens
  }

  parseLine(line: string, lineNumber: number): Token[] {
    const tokens: Token[] = []

    let startColumn = 0

    let lastToken = null

    const regex = /"([^"]*)"|\[([^\]]+)]|\S+/g
    const words = line.trim().match(regex) ?? []

    for (const word of words) {
      const initialColumn = line.indexOf(word, startColumn)
      let tokensAndChars = [word]
      if (
        (!word.startsWith('[') || !word.endsWith(']')) &&
        (!word.startsWith('"') || !word.endsWith('"'))
      ) {
        tokensAndChars = word
          .split(/(\b\w+\b|[{}();])/g)
          .filter((char) => char.trim() !== '')
      }

      for (const tokenOrChar of tokensAndChars) {
        const column = line.indexOf(tokenOrChar, initialColumn)
        const newToken: Token = {
          value: tokenOrChar,
          column,
          line: lineNumber + 1,
          type: this.getTokenType(tokenOrChar, lastToken?.value ?? ''),
        }
        tokens.push(newToken)
        startColumn = column + tokenOrChar.length
        lastToken = newToken
      }
    }

    return tokens
  }

  getTokenType(token: string, lastTokenValue: string): TokenType {
    if (RESERVED_CHARS.includes(token)) {
      return 'RESERVED_CHAR'
    }
    if (TYPES.includes(token)) {
      return 'TYPE'
    }
    if (RESERVED_WORDS.includes(token)) {
      return 'RESERVED_WORD'
    }
    const isStringValue = token.startsWith('"') && token.endsWith('"')
    const isArrayValue = token.startsWith('[') && token.endsWith(']')
    if (
      isStringValue ||
      isArrayValue ||
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)
    ) {
      if (lastTokenValue === 'attribute') {
        return 'TYPE'
      }
      if (lastTokenValue === '=') {
        return 'VALUE'
      }
      return 'IDENTIFIER'
    }
    // Add more checks for different token types as needed
    return 'UNKNOWN'
  }
}
