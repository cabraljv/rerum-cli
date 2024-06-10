export const stateMachine = [
  {
    event: 'begin',
    initialState: '',
    finalState: 'include',
  },
  {
    event: 'begin',
    initialState: '',
    finalState: 'generate',
  },
  {
    event: 'token',
    initialState: 'generate',
    finalState: 'idGenerate',
  },
  {
    event: 'token',
    initialState: ';',
    finalState: 'generate',
  },
  {
    event: 'token',
    initialState: 'idGenerate',
    finalState: ';',
  },
  {
    event: 'begin',
    initialState: '',
    finalState: 'module',
  },
  {
    event: 'begin',
    initialState: '',
    finalState: 'import',
  },
  {
    event: 'token',
    initialState: 'import',
    finalState: 'idImport',
  },
  {
    event: 'token',
    initialState: 'idImport',
    finalState: ';',
  },
  {
    event: 'token',
    initialState: ';',
    finalState: 'import',
  },
  {
    event: 'token',
    initialState: 'class',
    finalState: 'idClass',
  },
  {
    event: 'token',
    initialState: 'idClass',
    finalState: 'extends',
  },
  {
    event: 'token',
    initialState: 'extends',
    finalState: 'idFather',
  },
  {
    event: 'token',
    initialState: 'idFather',
    finalState: '{',
  },
  {
    event: 'token',
    initialState: 'idClass',
    finalState: '{',
  },
  {
    event: 'token',
    initialState: '{',
    finalState: 'attribute',
  },
  {
    event: 'token',
    initialState: '{',
    finalState: '}',
  },
  {
    event: 'token',
    initialState: '}',
    finalState: '}',
  },
  {
    event: 'token',
    initialState: 'attribute',
    finalState: 'idType',
  },
  {
    event: 'token',
    initialState: 'idType',
    finalState: 'idAttribute',
  },
  {
    event: 'token',
    initialState: 'idAttribute',
    finalState: 'listof',
  },
  {
    event: 'token',
    initialState: 'listof',
    finalState: ';',
  },
  {
    event: 'token',
    initialState: 'idAttribute',
    finalState: ';',
  },
  {
    event: 'token',
    initialState: '}',
    finalState: ';',
  },
  {
    event: 'token',
    initialState: ';',
    finalState: '}',
  },
  {
    event: 'token',
    initialState: ';',
    finalState: 'module',
  },
  {
    event: 'token',
    initialState: 'module',
    finalState: 'idModule',
  },
  {
    event: 'token',
    initialState: 'idModule',
    finalState: '{',
  },
  {
    event: 'token',
    initialState: '{',
    finalState: 'typedef',
  },
  {
    event: 'token',
    initialState: 'typedef',
    finalState: 'idType',
  },
  {
    event: 'token',
    initialState: 'idType',
    finalState: 'idTypedef',
  },
  {
    event: 'token',
    initialState: 'idTypedef',
    finalState: ';',
  },
  {
    event: 'token',
    initialState: ';',
    finalState: 'typedef',
  },
  {
    event: 'token',
    initialState: ';',
    finalState: 'class',
  },
  {
    event: 'token',
    initialState: '{',
    finalState: 'class',
  },
  {
    event: 'token',
    initialState: ';',
    finalState: 'class',
  },
  {
    event: 'token',
    initialState: ';',
    finalState: 'attribute',
  },
  {
    event: 'end',
    initialState: ';',
    finalState: '',
  },
]
