import { Command } from 'commander'

interface VerifyCommandOptions {
  _optionValues: {
    input: string
    output: string
    config: string
  }
}

const generateCommand = new Command('verify')
  .description('Generate code based on ODL files')
  .option('-i, --input <file>', 'Input ODL file')
  .action((_, options: VerifyCommandOptions) => {})

export default generateCommand
