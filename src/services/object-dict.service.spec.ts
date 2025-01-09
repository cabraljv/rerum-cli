import { ObjectDictService } from './object-dict.service'
import { FileSystem } from '../utils/file-system'
import { TextUtils } from '../utils/text-utils'
import Database from '../utils/database'
import fs from 'fs'

jest.mock('../utils/file-system')
jest.mock('../utils/text-utils')
jest.mock('../utils/database')

describe('ObjectDictService', () => {
  let objectDictService: ObjectDictService
  let mockFileSystem: jest.Mocked<FileSystem>
  let mockTextUtils: jest.Mocked<TextUtils>
  let mockDb: jest.Mocked<Database>

  beforeEach(() => {
    mockFileSystem = new FileSystem() as jest.Mocked<FileSystem>
    mockTextUtils = new TextUtils() as jest.Mocked<TextUtils>
    mockDb = new Database() as jest.Mocked<Database>

    // Mock implementations
    mockFileSystem.readFileContent.mockImplementation(
      (path: string) => `Content of ${path}`,
    )
    mockTextUtils.parseTextTokens.mockImplementation((text: string) => [
      { type: 'IDENTIFIER', value: 'import' } as any,
      { type: 'STRING', value: 'example.odl' } as any,
    ])

    mockDb.models = {
      Association: {
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
      } as any,
      Item: {
        create: jest.fn(),
        findOne: jest.fn(),
        findAll: jest.fn(),
      } as any,
      File: { create: jest.fn(), findOne: jest.fn() } as any,
    }

    objectDictService = new ObjectDictService(
      mockTextUtils,
      mockFileSystem,
      mockDb,
    )
  })

  afterAll(() => {
    jest.restoreAllMocks()
    if (fs.existsSync('testFile.odl')) {
      fs.unlinkSync('testFile.odl')
    }
  })

  describe('populateObjectDict', () => {
    it('should correctly populate object dictionary from file', async () => {
      const testFile = 'testFile.odl'

      const { File } = mockDb.models

      const mockedCreateFunction = jest.fn()
      mockedCreateFunction.mockResolvedValueOnce({
        filename: testFile,
      })
      const mockFindOneFunction = jest.fn()
      mockFindOneFunction.mockResolvedValueOnce(null)
      File.findOne = mockFindOneFunction
      File.create = mockedCreateFunction

      const validOdl = `module TestModule {
  class Item1 {
    attribute string value;
  }
}
`

      mockTextUtils.parseTextTokens.mockImplementationOnce(() => [
        { type: 'RESERVED_WORD', value: 'module' } as any,
        { type: 'IDENTIFIER', value: 'TestModel' } as any,
        { type: 'RESERVED_WORD', value: 'class' } as any,
        { type: 'IDENTIFIER', value: 'Item1' } as any,
        { type: 'RESERVED_WORD', value: 'attribute' } as any,
        { type: 'TYPE', value: 'string' } as any,
        { type: 'IDENTIFIER', value: 'value' } as any,
        { type: 'RESERVED_CHAR', value: ';' } as any,
      ])

      fs.writeFileSync(testFile, validOdl)
      await objectDictService.populateObjectDict(testFile)
      fs.unlinkSync(testFile)

      // Assert File creation

      expect(mockedCreateFunction).toHaveBeenCalled()
      expect(mockedCreateFunction).toHaveBeenCalledWith({ filename: testFile })
      expect(mockFindOneFunction).toHaveBeenCalled()

      // Assert more based on the tokens parsed and DB interactions
    })

    it('should not repopulate for existing files', async () => {
      const testFile = 'path/to/existentFile.odl'

      // Cast the findOne method to Jest's mock type
      const { File } = mockDb.models
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const mockFindOne = File.findOne as jest.MockedFunction<
        typeof File.findOne
      >
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockFindOne.mockResolvedValueOnce(true as any) // Simulate finding an existing file

      await objectDictService.populateObjectDict(testFile)

      // You can now call Jest mock functions such as mockResolvedValueOnce on mockFindOne
    })

    // Add more tests...
  })

  describe('getObjectDict', () => {
    it('should retrieve object dictionary', async () => {
      // Mock response from the database

      const { Item } = mockDb.models
      const mockedFunc = jest.fn()
      mockedFunc.mockReturnValueOnce([
        { name: 'Item1', className: 'class' },
        { name: 'Item2', className: 'class' },
      ])
      Item.findAll = mockedFunc

      const result = await objectDictService.getObjectDict()

      // Assertions on the result
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      // Expect certain items based on the mocked DB response
    })

    // Add more tests as needed to cover edge cases and error conditions...
  })

  it('does not re-process already processed files', async () => {
    const { File } = mockDb.models
    const mockCreate = jest.fn()
    mockCreate.mockResolvedValueOnce({ filename: 'existingFile.odl' })
    File.create = mockCreate

    const mockFindOne = jest.fn()
    mockFindOne.mockResolvedValueOnce(true)
    File.findOne = mockFindOne

    await objectDictService.populateObjectDict('existingFile.odl')

    // Ensure File.create was not called since file exists
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('throws an error for non-existent class in use', async () => {
    const { Item } = mockDb.models
    const mockFindOne = jest.fn()
    mockFindOne.mockResolvedValueOnce(null)
    Item.findOne = mockFindOne

    mockTextUtils.parseTextTokens.mockImplementationOnce(() => [
      { type: 'RESERVED_WORD', value: 'module' } as any,
      { type: 'IDENTIFIER', value: 'TestModuleUse' } as any,
      { type: 'RESERVED_WORD', value: 'class' } as any,
      { type: 'IDENTIFIER', value: 'Item1' } as any,
      { type: 'RESERVED_WORD', value: 'use' } as any,
      { type: 'IDENTIFIER', value: 'SomeClass' } as any,
      { type: 'RESERVED_WORD', value: 'attribute' } as any,
      { type: 'IDENTIFIER', value: 'SomeClass' } as any,
      { type: 'IDENTIFIER', value: 'value' } as any,
      { type: 'RESERVED_CHAR', value: ';' } as any,
    ])

    await expect(
      objectDictService.populateObjectDict('testFile.odl'),
    ).rejects.toThrow("The class 'SomeClass' doesn't exist to be used")
  })

  // Additional tests to cover other methods and edge cases...
})
