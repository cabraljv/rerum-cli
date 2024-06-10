import fs from 'fs'
import {
  type TagsItemValues,
  type GenerationConfig,
  type TagsItem,
} from '../types/general'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FileSystem {
  static getAllOdlFiles(dir: string): string[] {
    const files = fs.readdirSync(dir)
    return files
      .filter((file) => file.endsWith('.odl'))
      .map((file) => `${dir}/${file}`)
  }

  static readFileContent(file: string): string {
    return fs.readFileSync(file, 'utf-8')
  }

  static fileExists(file: string): boolean {
    return fs.existsSync(file)
  }

  static readTagsFile(file: string, className: string): TagsItem[] {
    const tagsDescription = fs.readFileSync(file, 'utf8')
    const isValidTagsItemValue = (value: string): value is TagsItemValues => {
      return ['name', 'type', 'className', 'isArray', 'id'].includes(
        value.trim(),
      )
    }
    const classTags = tagsDescription
      .replace(/\r/gm, '')
      .split('\n')
      .filter((tag) => !(tag.length === 0)) // remove empty lines
      .find((tag) => tag.split('=')[0] === className)

    if (!classTags) {
      return []
    }

    const tags = classTags
      .split('=')[1]
      .split(',')
      .map((tag) => {
        const [key, value] = tag.replace(/ /gm, '').split(':')
        if (!isValidTagsItemValue(value)) {
          throw new Error(`Invalid tag value: ${value}`)
        }
        return { key, value }
      })

    return tags
  }

  static removeDbFile(): void {
    if (fs.existsSync('database.sqlite')) {
      fs.unlinkSync('database.sqlite')
    }
  }

  static writeToFile(file: string, content: string): void {
    const dir = file.split('/').slice(0, -1).join('/')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(file, content, 'utf-8')
  }

  static getConfig(flags: any): GenerationConfig {
    const configsFile: string = flags?.config ?? 'rgen.conf.json'

    const configContentTxt = fs.readFileSync(configsFile, 'utf-8')
    const configJson = JSON.parse(configContentTxt)

    const config = {
      archetypesFiles: configJson?.archetypesFiles ?? [],
      tagsFile: configJson?.tagsFile ?? 'rgen.tags',
      outputDir: configJson?.outputDir ?? 'output',
    }
    return config
  }
}
