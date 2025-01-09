import { type TokenType, type Token } from '../types/general'

interface ITextUtils {
  parseTextTokens: (textContent: string) => Token[]
  parseLine: (line: string, lineNumber: number) => Token[]
  getTokenType: (token: string, lastTokenValue: string) => TokenType
}
