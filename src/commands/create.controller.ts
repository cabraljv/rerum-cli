import { Command } from 'commander'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs-extra'
import * as path from 'path'

const execAsync = promisify(exec)

interface CreateCommandOptions {
  _optionValues: {
    type: string
    name: string
  }
}

const createCommand = new Command('create')
  .description('Create a new project based on rerum-cli generator')
  .option('-t, --type <type>', 'Project type: vue, express')
  .option('-n, --name <name>', 'Project name')
  .action(async (_, options: CreateCommandOptions) => {
    console.log('Creating project...')
    const { type, name } = options._optionValues
    const createProject = {
      vue: async () => {
        // create vue project
        console.log(`Creating Vue project ${name}`)
        await execAsync(`yarn create vite ${name} --template vue`)

        console.log('Installing vuetify and dependencies...')
        await execAsync(
          `cd ${name} && yarn add @faker-js/faker@^8.3.1 @mdi/font@7.0.96 core-js@^3.29.0 date-fns@^2.30.0 faker@^6.6.6 roboto-fontface@* vue@^3.2.0 vue-router@^4.0.0 vuetify@^3.0.0`,
        )
        console.log('Installing dev dependencies...')

        await execAsync(
          `cd ${name} && yarn add -D @vitejs/plugin-vue@^4.0.0 eslint@^8.0.1 eslint-config-prettier@^9.1.0 eslint-config-standard@^17.1.0 eslint-plugin-import@^2.25.2 eslint-plugin-n@^15.0.0 eslint-plugin-prettier@^5.0.1 eslint-plugin-promise@^6.0.0 eslint-plugin-vue@^9.19.2 prettier@^3.1.1 sass@^1.60.0 unplugin-fonts@^1.0.3 vite@^4.2.0 vite-plugin-vuetify@^1.0.0`,
        )

        console.log('Copying template files...')
        // copy all template files from folder templates/vue to the project
        const templateDir = path.join(__dirname, '../templates/vue')
        const targetDir = process.cwd() // Directory where the CLI is executed

        await fs.copy(templateDir, `${targetDir}/${name}`, { overwrite: true })

        console.log('Creating rerum-cli aux config files...')

        fs.mkdirSync(`${name}/odl`, { recursive: true })
      },
    }
    if (!Object.keys(createProject).includes(type)) {
      console.log(`Project type ${type} is not supported`)
      return
    }
    try {
      await createProject.vue()
    } catch (error) {
      console.log('Error creating project', error)
      await fs.remove(name)
    }
    console.log('Done!')
  })

export default createCommand
