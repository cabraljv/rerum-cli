import { type OdlValidationError } from '../types/general'
import { FileSystem } from './file-system'
import chalk from 'chalk'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Logger {
  static log(message: string): void {
    console.log(message)
  }

  static error(message: string): void {
    console.error(message)
  }

  static syntaxError(error: OdlValidationError): void {
    const token = error.token
    const file = error.file
    const fileContent = FileSystem.readFileContent(file)
    const lines = fileContent.split('\n')

    // Index of the error line in the lines array
    const errorLineIndex = token.line - 1

    // Extract the error line from the full content
    const errorLine = lines[errorLineIndex]

    // Highlight the token causing the error
    const highlightedErrorLine =
      errorLine.substring(0, token.column) +
      chalk.bold.red(token.value) +
      errorLine.substring(token.column + token.value.length)

    // Determine the context range
    const contextStart = Math.max(0, errorLineIndex - 2)
    const contextEnd = Math.min(lines.length, errorLineIndex + 3)

    // Extract lines around the error line
    const contextLines = lines.slice(contextStart, contextEnd)

    // Replace the line with the error with the highlighted version
    contextLines[errorLineIndex - contextStart] = highlightedErrorLine

    // Print the error message with the highlighted context
    console.error(
      chalk.bold.red(`Syntax error: Unexpected token "${token.value}"`),
    )
    console.error(
      `${chalk.bold('File:')} ${file}:${token.line}:${token.column}`,
    )
    console.error(chalk.gray('Context:'))
    console.error(contextLines.join('\n')) // no need for additional chalk.gray, as the highlighted token is already colored
  }

  static unexpectedError(error: Error): void {
    console.error('An unexpected error occurred:', error)
  }
}
