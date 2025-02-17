import {
  type IItem,
  type GenerationConfig,
  type TagsItem,
  type TemplateInputs,
  type InputField,
} from '../types/general'
import { TYPES } from '../utils/config'
import { setupDb } from '../utils/database'
import { FileSystem } from '../utils/file-system'

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
interface MutableInputField extends InputField {
  [key: string]: string | boolean | number
}

export class GenerationService {
  constructor(private readonly config: GenerationConfig) {}

  async generateAllCodeFromObjectDict(): Promise<void> {
    console.log('Generating code')
    const { Association, Item } = await setupDb()

    const modules: IItem[] = await Item.findAll({
      where: { className: 'module' },
      include: [
        {
          model: Association,
          as: 'references',
          attributes: ['associationType'],
          include: [
            {
              model: Item,
              as: 'referenced',
              attributes: ['id', 'name', 'className', 'type'],
            },
          ],
        },
      ],
    })

    console.log(`Modules found: ${modules.length}`)

    for (const archetype of this.config.archetypesFiles) {
      if (archetype.singleFile) {
        const modulesToGenerate = modules.filter((module) =>
          archetype.modulesToGenerate.includes(module.name),
        )

        await this.generateAllCodeFromObjectDictSingleFile(
          modulesToGenerate,
          archetype.tplFile,
          FileSystem.fileExists(archetype.outputFileName)
            ? FileSystem.readFileContent(archetype.outputFileName)
            : '',
        )
        continue
      }
      for (const module of modules) {
        if (!module?.references) {
          module.references = []
        }

        if (archetype.modulesToGenerate.includes(module.name)) {
          await this.generateModuleCode(module.id, `${archetype.tplFile}`)
        }
      }
    }
  }

  async generateAllCodeFromObjectDictSingleFile(
    modulesToGenerate: IItem[],
    tplFile: string,
    existentOutputFileContent: string,
  ): Promise<void> {
    console.log(`Generating single file code using ${tplFile}`)
    let tplContent = FileSystem.readFileContent(tplFile)
    const contentTags = this.extractContentBetweenTags(tplContent)

    for (const contentTag of contentTags) {
      const currentTag = contentTag.split('@')[1]
      const currentTagType = currentTag.replace('begin_', '')
      // remove first and last tags
      const parsedContent = contentTag
        .replace(`@begin_${currentTagType}@`, '')
        .replace(`@end_${currentTagType}@`, '')

      let generatedModuleContent = ''

      for (const module of modulesToGenerate) {
        const contentWithVariables = await this.populateVariables(
          parsedContent,
          module,
          currentTagType,
        )
        const content = await this.insertItemContent(
          module.id,
          contentWithVariables,
          'module',
          existentOutputFileContent,
        )
        generatedModuleContent += content
      }
      tplContent = tplContent.replace(contentTag, generatedModuleContent)
    }

    const archetypeToGenerate = this.config.archetypesFiles.find(
      (item) => item.tplFile === tplFile,
    )
    if (!archetypeToGenerate) return

    const filename = archetypeToGenerate.outputFileName

    const outputFilePath = `${this.config.outputDir}/${filename}`

    FileSystem.writeToFile(outputFilePath, tplContent)
  }

  async generateModuleCode(moduleId: string, tplFile: string): Promise<void> {
    const { Item } = await setupDb()
    const moduleItem: IItem | null = await Item.findOne({
      where: { id: moduleId },
    })
    if (!moduleItem?.name) {
      throw new Error(`Module ${moduleId} not found`)
    }
    console.log(
      `Generating code for module ${moduleItem?.name} using ${tplFile}`,
    )

    const archetypeToGenerate = this.config.archetypesFiles.find(
      (item) => item.tplFile === tplFile,
    )
    if (!archetypeToGenerate) return

    const filename = archetypeToGenerate.outputFileName.replace(
      '@module@',
      `${moduleItem.name}`,
    )

    const outputFilePath = `${this.config.outputDir}/${filename}`

    const tplFileContent = FileSystem.readFileContent(tplFile)

    const content = await this.insertItemContent(
      moduleId,
      tplFileContent,
      outputFilePath,
      FileSystem.fileExists(outputFilePath)
        ? FileSystem.readFileContent(outputFilePath)
        : '',
    )

    FileSystem.writeToFile(outputFilePath, content)
  }

  async insertItemContent(
    moduleId: string,
    itemContent: string,
    type: string = 'module',
    existentOutputFileContent: string,
    currentClassId: string | null = null,
  ): Promise<string> {
    const { Association, Item } = await setupDb()

    const contentTags = this.extractContentBetweenTags(itemContent)

    for (const contentTag of contentTags) {
      const currentTag = contentTag.split('@')[1]
      const currentTagType = currentTag.replace('begin_', '')
      if (currentTagType === 'class') {
        const classesQuery: IItem | null = await Item.findOne({
          where: { id: moduleId },
          include: [
            {
              model: Association,
              as: 'references',
              attributes: ['associationType'],
              where: { associationType: 'module' },
              include: [
                {
                  model: Item,
                  as: 'referenced',
                  attributes: ['id', 'name', 'className', 'type'],
                },
              ],
            },
          ],
        })

        if (!classesQuery) {
          console.error(`Module ${moduleId} not found`)
          process.exit(1)
        }
        if (!classesQuery.references) {
          classesQuery.references = []
        }

        const classes = classesQuery.references
          .map((c) => ({
            id: `${c.referenced?.id}`,
            name: `${c.referenced?.name}`,
            className: `${c.referenced?.className}`,
            type: `${c.referenced?.type}`,
          }))
          .filter((c: any) => c.className === 'class')
        let generatedContent = ''
        for (const classItem of classes) {
          const parsedContent = contentTag
            .replace(`@begin_${currentTagType}@`, '')
            .replace(`@end_${currentTagType}@`, '')

          const contentWithVars = await this.populateVariables(
            parsedContent,
            await this.getCorrectClassVariables(classItem),
            currentTagType,
          )

          const insideClassCode = await this.insertItemContent(
            moduleId,
            contentWithVars,
            currentTagType,
            existentOutputFileContent,
            `${classItem.id}`,
          )
          generatedContent += insideClassCode
        }
        itemContent = itemContent.replace(contentTag, generatedContent)
      } else if (currentTagType === 'attribute') {
        const parsedContent = contentTag
          .replace(`@begin_${currentTagType}@`, '')
          .replace(`@end_${currentTagType}@`, '')

        const classAttributes = await this.getClassAttributes(
          currentClassId ?? moduleId,
        )

        let generatedContent = ''
        for (const attribute of classAttributes) {
          if (!attribute) continue
          generatedContent += await this.populateVariables(
            parsedContent,
            attribute,
            currentTagType,
          )
        }
        itemContent = itemContent.replace(contentTag, generatedContent)
      } else if (currentTagType === 'module') {
        // remove first and last tags
        const parsedContent = contentTag
          .replace(`@begin_${currentTagType}@`, '')
          .replace(`@end_${currentTagType}@`, '')

        const item = await Item.findOne({ where: { id: moduleId } })

        if (!item) {
          console.error(`Module ${moduleId} not found`)
          process.exit(1)
        }

        const contentWithVariables = await this.populateVariables(
          parsedContent,
          item,
          currentTagType,
        )

        const content = await this.insertItemContent(
          moduleId,
          contentWithVariables,
          type,
          existentOutputFileContent,
        )
        itemContent = itemContent.replace(contentTag, content)
      } else if (currentTagType === 'import') {
        const parsedContent = contentTag
          .replace(`@begin_${currentTagType}@`, '')
          .replace(`@end_${currentTagType}@`, '')

        const item: IItem | null = await Item.findOne({
          where: { id: moduleId },
          include: [
            {
              model: Association,
              as: 'references',
              where: { associationType: 'import' },
              include: [
                {
                  model: Item,
                  as: 'referenced',
                  attributes: ['id', 'name', 'className', 'type'],
                },
              ],
            },
          ],
        })
        if (!item) {
          itemContent = itemContent.replace(contentTag, '')
          continue
        }

        let generatedContent = ''
        if (!item.references) {
          console.error(`Module ${moduleId} not found`)
          process.exit(1)
        }
        for (const importItem of item.references) {
          if (!importItem.referenced) continue
          generatedContent += await this.populateVariables(
            parsedContent,
            importItem.referenced,
            currentTagType,
          )
        }
        itemContent = itemContent.replace(contentTag, generatedContent)
      } else if (currentTagType === 'code_block') {
        if (!existentOutputFileContent) {
          itemContent = itemContent.replace(contentTag, '')
        }
        const codeBlockId = contentTag
          .replace('@begin_code_block@', '')
          .replace('@end_code_block@', '')
          .trim()

        const codeBlockStartLine = existentOutputFileContent
          .split('\n')
          .findIndex((line) => line.includes(`begin_code_block=${codeBlockId}`))
        const codeBlockEndLine = existentOutputFileContent
          .split('\n')
          .findIndex((line) => line.includes(`end_code_block=${codeBlockId}`))

        if (codeBlockStartLine === -1 || codeBlockEndLine === -1) {
          itemContent = itemContent.replace(contentTag, '')
        }

        const codeBlockContent = existentOutputFileContent
          .split('\n')
          .slice(codeBlockStartLine, codeBlockEndLine + 1)
          .join('\n')

        itemContent = itemContent.replace(contentTag, codeBlockContent)
      } else if (currentTagType === 'template_inputs') {
        console.log('template inputs')
        if (!currentClassId) continue
        const usedClassName = await this.verifyClassUse(currentClassId)

        if (usedClassName !== 'POForm') {
          throw new Error("The unique 'use' class available is 'POForm'")
        }

        const templateInputs = await this.getClassTemplateInputs(currentClassId)
        if (!templateInputs) continue
        if (itemContent.includes('#JsonData#')) {
          const inputsStrConten: string = templateInputs.fields
            .map((i) => JSON.stringify(i, null, 2))
            .join(',')
          itemContent = itemContent.replace(contentTag, inputsStrConten)
        } else {
          itemContent = itemContent.replace(contentTag, '')
        }
        // console.log('templateInputs', templateInputs)
      }
    }

    return itemContent
  }

  private async verifyClassUse(classId: string): Promise<string | null> {
    const { Item, Association } = await setupDb()

    const currentClass = await Item.findByPk(classId)

    if (!currentClass) return null

    const useAssociation = await Association.findOne({
      where: {
        associationType: 'use',
        referenceId: classId,
      },
    })

    if (!useAssociation) return null

    const usedClass = await Item.findByPk(useAssociation.referencedId)

    return usedClass?.name ?? null
  }

  private async getClassAttributes(classId: string): Promise<IItem[]> {
    const { Item, Association } = await setupDb()
    const classUse = await this.verifyClassUse(classId)
    if (!classUse || classUse !== 'POForm') {
      const dbAssociationAttributes = await Association.findAll({
        where: {
          referenceId: classId,
          associationType: 'attribute',
        },
        include: [
          {
            model: Item,
            as: 'referenced',
          },
        ],
      })

      const validItems = dbAssociationAttributes.map(
        (association) => association.referenced,
      )
      const validItemsToReturn = []
      for (const item of validItems) {
        if (item) validItemsToReturn.push(item)
      }

      return validItemsToReturn
    } else {
      const dbAssociationAttributes = await Association.findAll({
        where: {
          referenceId: classId,
          associationType: 'attribute',
        },
        include: [
          {
            model: Item,
            as: 'referenced',
          },
        ],
      })
      const poObjectClass = dbAssociationAttributes.find(
        (as) => as.referenced?.name === 'poobject',
      )
      if (!poObjectClass) throw new Error('poobject attribute not found')

      const usedClassAttributes = await Association.findAll({
        where: {
          referenceId: poObjectClass.referenced?.type,
          associationType: 'attribute',
        },
        include: [
          {
            model: Item,
            as: 'referenced',
          },
        ],
      })

      const validItems = usedClassAttributes.map(
        (association) => association.referenced,
      )

      const validItemsToReturn = []
      for (const item of validItems) {
        if (item) validItemsToReturn.push(item)
      }

      return validItemsToReturn
    }
  }

  private async getCorrectClassVariables(classItem: IItem): Promise<IItem> {
    const { Item, Association } = await setupDb()
    const classUse = await this.verifyClassUse(classItem.id)
    if (classUse) {
      const dbAssociationAttributes = await Association.findAll({
        where: {
          referenceId: classItem.id,
          associationType: 'attribute',
        },
        include: [
          {
            model: Item,
            as: 'referenced',
          },
        ],
      })
      const poObjectClass = dbAssociationAttributes.find(
        (as) => as.referenced?.name === 'poobject',
      )

      if (!poObjectClass?.referenced)
        throw new Error('poobject attribute not found')

      const poobjectClassType = await Item.findByPk(
        poObjectClass?.referenced.type,
      )
      if (!poobjectClassType)
        throw new Error('poobject attribute type not found')
      return poobjectClassType
    }
    return classItem
  }

  private async getClassTemplateInputs(
    classId: string,
  ): Promise<TemplateInputs | null> {
    const { Item, Association } = await setupDb()

    const classTemplate = await Association.findAll({
      where: {
        referenceId: classId,
      },
      include: [
        {
          model: Item,
          as: 'referenced',
        },
      ],
    })

    const templateAssociation = classTemplate.find(
      (i) => i.associationType === 'template',
    )

    if (!templateAssociation) {
      return null
    }

    const templateItemId = templateAssociation.referencedId

    const templateInputs = await Association.findAll({
      where: {
        referenceId: templateItemId,
      },
    })

    const inputs: InputField[] = []

    for (const templateInput of templateInputs) {
      const baseTemplateInput: MutableInputField = {
        type: 'text',
        label: 'Label',
        id: 'inputId',
        canFilter: true,
        canAdd: true,
        required: true,
      }

      const inputConfigs = await Association.findAll({
        where: {
          referenceId: templateInput.referencedId,
        },
        include: {
          model: Item,
          as: 'referenced',
        },
      })
      for (const inputConfigItem of inputConfigs) {
        if (!inputConfigItem.referenced) continue
        const inputItemKey = inputConfigItem.referenced.name
        if (
          Object.prototype.hasOwnProperty.call(baseTemplateInput, inputItemKey)
        ) {
          const isStr = ['type', 'label', 'id'].includes(inputItemKey)
          const isBool = ['canFilter', 'required', 'canAdd'].includes(
            inputItemKey,
          )
          const isInt = ['min', 'max', 'step'].includes(inputItemKey)
          const isCode = ['format'].includes(inputItemKey)
          if (isStr) {
            // remove first and last char
            const formattedValue =
              `${inputConfigItem.referenced.value}`.substring(
                1,
                `${inputConfigItem.referenced.value}`.length - 1,
              )
            baseTemplateInput[inputItemKey] = formattedValue
          }
          if (isBool) {
            baseTemplateInput[inputItemKey] =
              `${inputConfigItem.referenced.value}` === 'true'
          }
          if (isInt) {
            baseTemplateInput[inputItemKey] = parseInt(
              `${inputConfigItem.referenced.value}`,
            )
          }
          if (isCode) {
            const formattedValue =
              `${inputConfigItem.referenced.value}`.substring(
                1,
                `${inputConfigItem.referenced.value}`.length - 1,
              )
            baseTemplateInput[inputItemKey] = formattedValue
          }
        }
      }
      inputs.push(baseTemplateInput)
    }

    return {
      type: 'DataTable',
      fields: inputs,
    }
  }

  extractContentBetweenTags(template: string): string[] {
    const parts = []
    interface TagStackItem {
      tagName: string
      position: number
      tag: string
    }
    const tagStack: TagStackItem[] = []
    const regex = /@begin_(.*?)@|@end_(.*?)@/g

    let match
    while ((match = regex.exec(template)) !== null) {
      const tag = match[0]
      const position = match.index

      if (tag.startsWith('@begin_')) {
        const tagName = tag.replace('@begin_', '').replace('@', '')
        tagStack.push({ tagName, position, tag })
      } else {
        const tagName = tag.replace('@end_', '').replace('@', '')
        if (
          tagStack.length === 0 ||
          tagStack[tagStack.length - 1].tagName !== tagName
        ) {
          console.error(`Unmatched end tag: ${tag}`)
          process.exit(1)
        }
        const tagStackItem = tagStack.pop()
        if (!tagStackItem) continue
        const { position: startPosition } = tagStackItem
        const content = template.substring(startPosition, position + tag.length)
        parts.push(content)
      }
    }

    if (tagStack.length > 0) {
      console.error(`Unmatched begin tag: ${tagStack[tagStack.length - 1].tag}`)
      process.exit(1)
    }
    parts.reverse()

    return parts
  }

  async populateVariables(
    content: string,
    item: IItem,
    type: string,
  ): Promise<string> {
    const tagsContent = this.extractContentBetweenTags(content)

    // must add variables that is not between tags

    let filteredContent = content
    let tagIndex = 0
    for (const tagContent of tagsContent) {
      filteredContent = filteredContent.replace(tagContent, `$${tagIndex++}$`)
    }

    const variableRegex = /#(.*?)#/g
    const variablesInContent = (filteredContent.match(variableRegex) ?? [])
      .filter((variable) => variable.replace(/\s/gm, '') !== '')
      .map((variable) => variable.replace(/#/g, ''))

    const variablesObj = FileSystem.readTagsFile(
      this.config.tagsFile,
      `${type}`,
    )

    for (const variable of variablesInContent) {
      const isIf = variable.includes('?')
      const firstChar = variable.charAt(0) // verify is first letter is capital
      let isCapitalized = false
      if (firstChar === firstChar.toUpperCase()) {
        isCapitalized = true
      }
      if (isIf) {
        const [key, value] = variable.split('?')
        const variableKey = variablesObj.find(
          (v: TagsItem) => v.key.toLowerCase() === key.toLowerCase(),
        )
        if (!variableKey) {
          console.error(`Variable ${key} not found in tags file2`)
          process.exit(1)
        }

        const [ifTrue, ifFalse] = value.split(':')
        if (item[variableKey.value]) {
          filteredContent = filteredContent.replace(`#${variable}#`, ifTrue)
        } else {
          filteredContent = filteredContent.replace(`#${variable}#`, ifFalse)
        }
      } else {
        const variableKey = variablesObj.find(
          (v: TagsItem) =>
            v.key.trim().toLowerCase() === variable.trim().toLowerCase(),
        )
        if (!variableKey) {
          console.error(
            `Variable ${JSON.stringify(item)}  ${JSON.stringify(variablesObj)} ${variable} not found in tags file5`,
          )
          process.exit(1)
        }
        let variableValue = item[variableKey.value]
        if (
          variableKey.value === 'type' &&
          !TYPES.includes(`${variableValue}`)
        ) {
          const { Item } = await setupDb()
          const typeItem: IItem | null = await Item.findOne({
            where: { id: variableValue },
          })
          if (typeItem?.className === 'typedef') {
            variableValue = typeItem.type
          } else {
            variableValue = typeItem?.name
          }
        }
        if (isCapitalized && variableValue) {
          variableValue =
            `${variableValue}`.charAt(0).toUpperCase() +
            `${variableValue}`.slice(1)
        }
        filteredContent = filteredContent.replace(
          `#${variable}#`,
          `${variableValue}`,
        )
      }
    }

    tagIndex = 0
    for (const tagContent of tagsContent) {
      filteredContent = filteredContent.replace(`$${tagIndex++}$`, tagContent)
    }

    return filteredContent
  }
}
