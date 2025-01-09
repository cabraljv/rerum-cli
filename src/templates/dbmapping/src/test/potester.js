import readline from 'readline'
import { POApplication, TRACE } from '../utils/POApplication.js';

//const trace = require('./poapplication.js');
const trace = TRACE;

class MenuItem 
{
    constructor (pOption, pDescription, pFunction)
    {
        this.option = pOption;
        this.description = pDescription;
        this.function = pFunction;
    }

}

export class POTester extends POApplication
{
    constructor ()
    {
        super();
        const argv = process.argv;
        const argc = argv.length - 2;
        this.options = [];
        this.rl = null;
       this.opcao = "";
     
        if (argc == 0) 
        {
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
              });
          }
        else 
        {
          console.log ("ArgC =", argc, " - ", argv[argc]  )
          this.rl = null;
          this.opcao = argv[2];
        }
    }

    defineMenuItem (pOption, pDescription, pFunction)
    {
       this.options.push( new MenuItem (pOption, pDescription, pFunction)); 
    }

    defineTestItens ()
    {
        this.defineMenuItem("t", "Teste","test"); 
        this.defineMenuItem("s", "Finaliza Teste","end"); 
    }

    test ()
    {
        console.log("Teste OK");
    }
   
    async end ()
    {
      trace.log("Finalizando o Teste");
      console.log("");
      if (this.rl != null)
         this.rl.close();
       await super.end();
    
    }

    sortMenuOptions ()
    {
        this.options.sort((a, b) => a.option.localeCompare(b.option));
    }

    showMenu()
    {
        this.options.forEach(item => console.log(`${item.option}  -   ${item.description}`));
    }

    async init()
    {
        await super.init();
        this.defineTestItens();
        this.sortMenuOptions();
        console.log ("POTester.init");
    }

    async execMenu() {

        console.log("======");
       if (this.opcao != "")
       {
         var optFound = this.options.find((element) => element.option == this.opcao);
         console.log("Funcao = ", this.opcao);
        const instancia = this;
        await instancia[optFound.function]();
        this.opcao = "";
        await this.end();
        return;
       }
       else
       { 
            this.showMenu();
            this.rl.question("Escolha uma opção: ", (lOption) => {
            var optFound = this.options.find((element) => element.option == lOption);
            if (optFound != null)
            {
                console.log("Funcao = ", optFound.function);
                const instancia = this;
                instancia[optFound.function]();
                if (optFound.option == 's')
                {
                  return;    
                }
             }
            else
            {
                console.log("Opção inválida.");
            }
            console.log("");
            this.execMenu();
        });

       }
        
     }

  
    async exec()
    {   await this.init();
        await this.execMenu();
    }
}