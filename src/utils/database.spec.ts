import Database from './database'
import { v4 } from 'uuid'

describe('Database', () => {
  let db: Database

  beforeAll(async () => {
    db = new Database()
    await db.setup()
  })

  afterAll(async () => {
    await db.close()
  })

  it('should initialize and define models', async () => {
    const { Item, File, Association } = db.models

    expect(Item).toBeDefined()
    expect(File).toBeDefined()
    expect(Association).toBeDefined()
  })

  it('should create a new Item', async () => {
    const { Item } = db.models
    const itemId = v4()
    const newItem = await Item.create({
      id: itemId,
      name: 'TestItem',
      className: 'class',
    })

    expect(newItem).toBeDefined()
    expect(newItem.id).toBe(itemId)
    expect(newItem.name).toBe('TestItem')
    expect(newItem.className).toBe('class')
  })

  it('should create a new File', async () => {
    const { File } = db.models
    const newFile = await File.create({
      filename: 'testfile.txt',
    })

    expect(newFile).toBeDefined()
    expect(newFile.filename).toBe('testfile.txt')
  })

  it('should create a new Association', async () => {
    const { Item, Association } = db.models
    const item1 = await Item.create({
      id: v4(),
      name: 'Item1',
      className: 'class',
    })
    const item2 = await Item.create({
      id: v4(),
      name: 'Item2',
      className: 'class',
    })

    const newAssociation = await Association.create({
      id: v4(),
      associationType: 'testType',
      referenceId: item1.id,
      referencedId: item2.id,
    })

    expect(newAssociation).toBeDefined()
    expect(newAssociation.associationType).toBe('testType')
    expect(newAssociation.referenceId).toBe(item1.id)
    expect(newAssociation.referencedId).toBe(item2.id)
  })

  it('should handle pre-existent classes on setup', async () => {
    const { Item } = db.models

    const existingClass = await Item.findOne({
      where: { name: 'POForm', className: 'class' },
    })

    expect(existingClass).toBeDefined()
    expect(existingClass?.name).toBe('POForm')
    expect(existingClass?.className).toBe('class')
  })
})
