import { Command } from 'commander'
import generateCommand from './generate.controller'
import createCommand from './create.controller'

const program = new Command()

program.version('1.0.0').addCommand(generateCommand).addCommand(createCommand)

export default program
