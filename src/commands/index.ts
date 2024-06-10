import { Command } from 'commander'
import generateCommand from './generate.controller'

const program = new Command()

program.version('1.0.0').addCommand(generateCommand)

export default program
