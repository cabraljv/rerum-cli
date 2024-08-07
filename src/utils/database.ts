import { Sequelize, DataTypes, Model, type Optional } from 'sequelize'
import { v4 } from 'uuid'

// Initializing the SQLite database
const db = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false,
})

interface ItemAttributes {
  id: string
  name: string
  className?: string
  type?: string
  value?: string
  isArray?: boolean
}

interface ItemCreationAttributes extends Optional<ItemAttributes, 'id'> {}

class Item
  extends Model<ItemAttributes, ItemCreationAttributes>
  implements ItemAttributes
{
  public id!: string
  public name!: string
  public className?: string
  public value?: string
  public references?: Association[]
  public type?: string
  public isArray?: boolean
}

interface FileAttributes {
  filename: string
}

interface FileCreationAttributes extends Optional<FileAttributes, 'filename'> {}

class File
  extends Model<FileAttributes, FileCreationAttributes>
  implements FileAttributes
{
  public filename!: string
}

interface AssociationAttributes {
  id: string
  associationType: string
  referenceId: string
  referencedId: string
}

interface AssociationCreationAttributes
  extends Optional<AssociationAttributes, 'id'> {}

class Association
  extends Model<AssociationAttributes, AssociationCreationAttributes>
  implements AssociationAttributes
{
  public id!: string
  public associationType!: string
  public referenceId!: string
  public referenced?: Item
  public referencedId!: string
}

interface DBModels {
  Item: typeof Item
  File: typeof File
  Association: typeof Association
}

export const setupDb = async (): Promise<DBModels> => {
  // Define models
  Item.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      className: { type: DataTypes.STRING, allowNull: false },
      type: { type: DataTypes.STRING },
      value: { type: DataTypes.STRING },
      isArray: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      sequelize: db,
      modelName: 'Item',
      timestamps: false,
    },
  )

  File.init(
    {
      filename: { type: DataTypes.STRING, primaryKey: true },
    },
    {
      sequelize: db,
      modelName: 'File',
      timestamps: false,
    },
  )

  Association.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      associationType: { type: DataTypes.STRING, allowNull: false },
      referenceId: { type: DataTypes.STRING, allowNull: false },
      referencedId: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize: db,
      modelName: 'Association',
      timestamps: false,
    },
  )

  // Define associations
  Item.hasMany(Association, { as: 'references', foreignKey: 'referenceId' })
  Association.belongsTo(Item, { as: 'reference', foreignKey: 'referenceId' })
  Association.belongsTo(Item, { as: 'referenced', foreignKey: 'referencedId' })
  Item.hasMany(Association, { as: 'referenced', foreignKey: 'referencedId' })

  // Sync the database
  await db.sync()

  const preExistentClasses = [
    {
      name: 'POForm',
    },
  ]

  for (const classToCreate of preExistentClasses) {
    const exists = await Item.findOne({
      where: { name: classToCreate.name, className: 'class' },
    })
    if (!exists)
      await Item.create({
        id: v4(),
        name: classToCreate.name,
        className: 'class',
      })
  }

  return {
    Item,
    File,
    Association,
  }
}
