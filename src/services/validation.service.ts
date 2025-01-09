import { stateMachine } from '../config/state-machine'
import { type Token } from '../types/general'
import { type TextUtils } from '../utils/text-utils'

export class ValidationService {
  constructor(private readonly textUtils: TextUtils) {}

  async execValidation(odlContent: string): Promise<null | Token> {
    const tokens = this.textUtils.parseTextTokens(odlContent)

    let currentState = ''
    let currentEvent = 'begin'

    const verifiedTokens = []

    for (const token of tokens) {
      const existentTransition = stateMachine.find((transition) => {
        if (currentEvent === 'end') {
          return token
        }
        const valueToCompare = token.value

        const isSameInitialState = transition.initialState === currentState
        const isSameFinalState = transition.finalState === valueToCompare
        const canBeIdentifier =
          token.type === 'IDENTIFIER' && currentState !== ';'
        const canBeValue = token.type === 'VALUE' && currentState !== ';'
        return (
          isSameInitialState &&
          (canBeValue ||
            canBeIdentifier ||
            token.type === 'TYPE' ||
            isSameFinalState)
        )
      })

      const isPossibleEndToken = stateMachine.find((transition) => {
        const valueToCompare = token.value
        if (valueToCompare === ';') {
          return (
            transition.initialState === valueToCompare &&
            transition.event === 'end'
          )
        }
        return false
      })
      if (existentTransition == null && isPossibleEndToken == null) {
        console.log(
          '!existentTransition && !isPossibleEndToken',
          verifiedTokens,
          token,
        )

        // return next token if there is no transition for the current token

        return token
      }

      if (existentTransition != null) {
        verifiedTokens.push(token)
      }

      if (isPossibleEndToken != null && existentTransition == null) {
        if (verifiedTokens.length !== tokens.length) {
          console.log('verifiedTokens.length!==tokens.length')
          return token
        }
        return null
      }

      if (existentTransition == null) {
        continue
      }

      currentState = existentTransition.finalState
      currentEvent = existentTransition.event
    }
    return null
  }
}
