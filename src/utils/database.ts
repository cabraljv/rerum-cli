import { Sequelize, DataTypes, Model, type Optional } from 'sequelize'
import { v4 } from 'uuid'

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

class Database {
  private readonly sequelize: Sequelize
  public models: DBModels

  constructor() {
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    })
    this.models = {
      Item,
      File,
      Association,
    }
  }

  async setup(): Promise<void> {
    // Define models
    this.models.Item.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        className: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING },
        value: { type: DataTypes.STRING },
        isArray: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        sequelize: this.sequelize,
        modelName: 'Item',
        timestamps: false,
      },
    )

    this.models.File.init(
      {
        filename: { type: DataTypes.STRING, primaryKey: true },
      },
      {
        sequelize: this.sequelize,
        modelName: 'File',
        timestamps: false,
      },
    )

    this.models.Association.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        associationType: { type: DataTypes.STRING, allowNull: false },
        referenceId: { type: DataTypes.STRING, allowNull: false },
        referencedId: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize: this.sequelize,
        modelName: 'Association',
        timestamps: false,
      },
    )

    // Define associations
    this.models.Item.hasMany(Association, {
      as: 'references',
      foreignKey: 'referenceId',
    })
    this.models.Association.belongsTo(Item, {
      as: 'reference',
      foreignKey: 'referenceId',
    })
    this.models.Association.belongsTo(Item, {
      as: 'referenced',
      foreignKey: 'referencedId',
    })
    this.models.Item.hasMany(Association, {
      as: 'referenced',
      foreignKey: 'referencedId',
    })

    // Sync the database
    await this.sequelize.sync()

    const preExistentClasses = [
      {
        name: 'POForm',
      },
    ]

    for (const classToCreate of preExistentClasses) {
      const exists = await this.models.Item.findOne({
        where: { name: classToCreate.name, className: 'class' },
      })
      if (!exists) {
        await this.models.Item.create({
          id: v4(),
          name: classToCreate.name,
          className: 'class',
        })
      }
    }
  }

  async close(): Promise<void> {
    await this.sequelize.close()
  }
}

export default Database
