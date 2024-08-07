import { TYPES } from '../utils/config'
import { setupDb } from '../utils/database'
import { FileSystem } from '../utils/file-system'
import { TextUtils } from '../utils/text-utils'
import { Op } from 'sequelize'
import * as uuid from 'uuid'

export class ObjectDictService {
  async populateObjectDict(odlFile: string): Promise<void> {
    const { Association, Item, File } = await setupDb()

    const existentFile = await File.findOne({ where: { filename: odlFile } })
    if (existentFile !== null) {
      return
    }
    await File.create({ filename: odlFile })
    console.log(`Populating object dict for file: ${odlFile}`)
    const fileContent = FileSystem.readFileContent(odlFile)
    const tokens = TextUtils.parseTextTokens(fileContent)

    const importIdentifiers = []
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (token.type === 'IDENTIFIER' && tokens[i - 1].value === 'import') {
        importIdentifiers.push(token.value)
      }
    }

    for (const importIdentifier of importIdentifiers) {
      const indexDir = odlFile.split('/')[0]
      await this.populateObjectDict(`${indexDir}/${importIdentifier}.odl`)
    }

    let currentClassIdentifier = null
    let currentModuleIdentifier: string | null = null
    let currentInputIdentifier = null

    const moduleImportsAndGenerates = []
    const moduleIds = []

    console.log(tokens)

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (token.type === 'IDENTIFIER') {
        const lastToken = tokens[i - 1]
        const nextToken = tokens[i + 1]
        const itemId = uuid.v4()

        if (lastToken.value === 'module') {
          await Item.create({
            id: itemId,
            name: token.value,
            className: 'module',
          })
          currentModuleIdentifier = itemId
          moduleIds.push(itemId)
          continue
        }
        if (lastToken.value === 'use') {
          const existentClass = await Item.findOne({
            where: { name: token.value, className: 'class' },
          })
          if (!existentClass)
            throw new Error(
              `The class '${token.value}' doesn't exist to be used`,
            )
          await Association.create({
            id: uuid.v4(),
            associationType: 'use',
            referenceId: `${currentClassIdentifier}`,
            referencedId: existentClass.id,
          })

          continue
        }
        if (lastToken.value === 'template') {
          await Item.create({
            id: itemId,
            name: token.value,
            className: 'template',
          })
          const inputsEnabled = nextToken.value
            .replace('[', '')
            .replace(']', '')
            .split(',')
            .map((input) => input.trim())

          // search all inputs with the same name in the same module and create associations
          const inputs = await Association.findAll({
            where: {
              associationType: 'module',
              referenceId: `${currentModuleIdentifier}`,
            },
            include: [
              {
                model: Item,
                as: 'referenced',
                where: { className: 'input' },
                attributes: ['id', 'name', 'className'],
                include: [
                  {
                    model: Association,
                    as: 'references',
                    include: [
                      {
                        model: Item,
                        as: 'referenced',
                        where: { className: 'module' },
                        attributes: ['id'],
                      },
                    ],
                  },
                ],
              },
            ],
          })

          // get only valid inputs
          const items = inputs
            .filter((i) => !!i.referenced && i.referenced.className === 'input')
            .map((input) => input.referenced)

          const validInputs = items.filter(
            (input) => input && inputsEnabled.includes(input.name),
          )

          if (validInputs.length !== inputsEnabled.length) {
            throw new Error('Invalid inputs')
          }
          for (const input of validInputs) {
            if (!input) continue
            await Association.create({
              id: uuid.v4(),
              associationType: 'input',
              referenceId: itemId,
              referencedId: input.id,
            })
          }

          await Association.create({
            id: uuid.v4(),
            associationType: 'template',
            referenceId: `${currentClassIdentifier}`,
            referencedId: itemId,
          })

          continue
        }
        if (lastToken.value === 'input') {
          currentInputIdentifier = itemId
          await Item.create({
            id: itemId,
            name: token.value,
            className: 'input',
          })
          await Association.create({
            id: uuid.v4(),
            associationType: 'module',
            referenceId: `${currentModuleIdentifier}`,
            referencedId: itemId,
          })
          continue
        }
        if (lastToken.value === 'config') {
          const inputValue = tokens[i + 2]
          await Item.create({
            id: itemId,
            name: token.value,
            value: inputValue.value,
            className: 'config',
          })
          await Association.create({
            id: uuid.v4(),
            associationType: 'input',
            referenceId: `${currentInputIdentifier}`,
            referencedId: itemId,
          })
          continue
        }

        if (lastToken.value === 'class') {
          currentClassIdentifier = itemId
          await Item.create({
            id: itemId,
            name: token.value,
            className: 'class',
          })
          await Association.create({
            id: uuid.v4(),
            associationType: 'module',
            referenceId: `${currentModuleIdentifier}`,
            referencedId: itemId,
          })
          continue
        }

        if (lastToken.value === 'extends') {
          const item: any = await Item.findOne({
            where: { name: token.value, className: 'class' },
          })
          await Association.create({
            id: uuid.v4(),
            associationType: 'extends',
            referenceId: `${currentClassIdentifier}`,
            referencedId: item.id,
          })
          continue
        }
        if (lastToken.value === 'use') {
          await Association.create({
            id: uuid.v4(),
            associationType: 'extends',
            referenceId: `${currentClassIdentifier}`,
            referencedId: token.value,
          })
          continue
        }

        if (lastToken.value === 'import') {
          const item: any = await Item.findOne({
            where: { name: token.value, className: 'module' },
          })
          moduleImportsAndGenerates.push({
            id: uuid.v4(),
            associationType: 'import',
            referencedId: item.id,
          })
          continue
        }

        if (lastToken.value === 'generate') {
          const item: any = await Item.create({
            id: itemId,
            name: token.value,
            className: 'generate',
          })
          moduleImportsAndGenerates.push({
            id: uuid.v4(),
            associationType: 'generate',
            referencedId: item.id,
          })
          continue
        }

        if (lastToken.type === 'TYPE') {
          const last2Token = tokens[i - 2]
          if (last2Token.value === 'attribute') {
            let attributeType = lastToken.value
            if (!TYPES.includes(attributeType)) {
              const item: any = await Item.findOne({
                where: {
                  name: attributeType,
                  className: { [Op.or]: ['typedef', 'class'] },
                },
              })
              if (!item) throw new Error(`Unknown type: ${attributeType}`)
              attributeType = item.id
            }
            const isArray = nextToken.value === 'listof'
            await Item.create({
              id: itemId,
              name: token.value,
              className: 'attribute',
              type: attributeType,
              isArray,
            })
            await Association.create({
              id: uuid.v4(),
              associationType: 'attribute',
              referenceId: `${currentClassIdentifier}`,
              referencedId: itemId,
            })
            continue
          }
          if (last2Token.value === 'typedef') {
            const typedefType = lastToken.value
            if (!TYPES.includes(typedefType)) {
              throw new Error(
                `"typedef" is only allowed on primitive types, unknown type: ${typedefType}`,
              )
            }
            await Item.create({
              id: itemId,
              name: token.value,
              className: 'typedef',
              type: typedefType,
            })
          }
        }
      }
    }

    for (const moduleImport of moduleImportsAndGenerates) {
      for (const moduleId of moduleIds) {
        await Association.create({
          ...moduleImport,
          referenceId: moduleId,
          id: uuid.v4(),
        })
      }
    }
  }

  async getObjectDict(): Promise<any[]> {
    const { Association, Item } = await setupDb()

    const items: any = await Item.findAll({
      where: { type: 'class' },
      attributes: ['name', 'type', 'className'],
      include: [
        {
          model: Association,
          as: 'references',
          attributes: ['associationType'],
          include: [
            {
              model: Item,
              as: 'referenced',
              attributes: ['name', 'className', 'type'],
            },
          ],
        },
      ],
    })

    return items
  }
}
