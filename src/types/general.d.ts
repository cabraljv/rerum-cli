export type TokenType =
  | 'RESERVED_CHAR'
  | 'RESERVED_WORD'
  | 'IDENTIFIER'
  | 'TYPE'
  | 'UNKNOWN'

export interface Token {
  value: string
  column: number
  line: number
  type: TokenType
}

export interface OdlValidationError {
  token: Token
  file: string
}

export interface IItem {
  id: string
  name: string
  className?: string
  type?: string
  isArray?: boolean
  references?: IAssociation[]
}

export interface IAssociation {
  id: string
  associationType?: string
  referenceId?: string
  referencedId?: string
  referenced?: IItem
}

export interface GenerationConfig {
  archetypesFiles: Array<{
    tplFile: string
    outputFileName: string
    modulesToGenerate: string[]
    singleFile?: boolean
    alias: string
  }>
  tagsFile: string
  outputDir: string
}

type TagsItemValues = 'name' | 'type' | 'className' | 'isArray' | 'id'

export interface TagsItem {
  key: string
  value: TagsItemValues
}
