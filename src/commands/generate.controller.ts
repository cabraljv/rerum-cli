import { Command } from 'commander'
import { FileSystem } from '../utils/file-system'
import { ValidationService } from '../services/validation.service'
import { Logger } from '../utils/logger'
import { ObjectDictService } from '../services/object-dict.service'
import { GenerationService } from '../services/generation.service'

interface GenerateCommandOptions {
  _optionValues: {
    input: string
    output: string
    config: string
  }
}

const validationService = new ValidationService()
const objectDictService = new ObjectDictService()

const generateCommand = new Command('generate')
  .description('Generate code based on ODL files')
  .option('-i, --input <dir>', 'Input ODLs dir')
  .option('-o, --output <output>', 'Output dir')
  .option('-c, --config <config>', 'Config file')
  .action(async (_, options: GenerateCommandOptions) => {
    const { input, config } = options._optionValues

    const odlFiles = FileSystem.getAllOdlFiles(input)
    for (const file of odlFiles) {
      const content = FileSystem.readFileContent(file)
      const validationErrorToken =
        await validationService.execValidation(content)
      if (validationErrorToken) {
        Logger.syntaxError({ token: validationErrorToken, file })
        return
      }
      console.log(`File ${file} is valid!`)
    }
    for (const file of odlFiles) {
      await objectDictService.populateObjectDict(file)
    }

    const generationConfig = FileSystem.getConfig(config)

    const generationService = new GenerationService(generationConfig)
    await generationService.generateAllCodeFromObjectDict()

    console.log('Done!')
  })

export default generateCommand
