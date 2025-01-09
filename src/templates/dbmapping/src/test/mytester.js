import {POTester} from './potester.js'

import { Person } from '../Person.js';
import { PersonPOMan } from '../Person-POManager.js';

export class MyTester extends POTester
{
    constructor ()
    {
        super();
    }
    
    async init()
    {
       const po = new PersonPOMan();
       po.init("SERVER");
       this.setPOMan(po);
       super.init();
       console.log ("PersonTester.init");
    }

    defineTestItens ()
    {
        super.defineTestItens();
        this.defineMenuItem("1", "Opcao 1 Insere Pessoa", "opcao1"); 
        this.defineMenuItem("2", "Opcao 2 Recupera ID TESTE1", "opcao2"); 
        this.defineMenuItem("3", "Opcao 3 Altera Nome ID TESTE1", "opcao3"); 
        this.defineMenuItem("4", "Opcao 4 Exclui ID TESTE2", "opcao4"); 
        this.defineMenuItem("5", "Opcao 5 Recupera Todas as Pessoas", "opcao5"); 
        this.defineMenuItem("6", "Opcao 6", "opcao6"); 
    }

    async opcao1 ()
    {
       console.log("Opcao 1");
       
         
       console.log("==== Opcao 1 ===");

       var lpf = new Person ();
       lpf.setName("João Cabral");
       lpf.setEmail("me@cabraljv.dev");
       lpf.setPhone("31984752284");
       const res1 = await lpf.insert();

       var lpf2 = new Person ();
        lpf2.setName("Carlos Assis");
        lpf2.setEmail("carlos@rerum.com");
        lpf2.setPhone("31984752284");
        const res2 = await lpf2.insert();

       return res1;
    }

    async opcao2 ()
    {

        console.log("Opcao 2");
          
        console.log("==== Opcao 2 ===");
        var lColpf = new Person ();
        const lpf = await lColpf.retrieve("11a05b04-9bb7-49e8-870d-b92715ac8419");
        console.log(lpf);
        console.log (lpf.getError().getResult());
        return lpf.getError().getResult();
    }

    async opcao3 ()
    {

        console.log("Opcao 3");
          
        console.log("==== Opcao 3 ===");
       
        var lColpf = new Person ();
        const lpf = await lColpf.retrieve("TESTE1");
        lpf.setName("Victor");
        await lpf.update();

        return lpf.getError().getResult();
    }

    async opcao4 ()
    {

        console.log("Opcao 4");
          
        console.log("==== Opcao 4 ===");
       
        var lCol = new Person ();
        const lpj = await lCol.retrieve("TESTE2");
       
        await lpj.erase();

        return lpj.getError().getResult();
    }

    async opcao5 ()
    {

        console.log("Opcao 5");
          
        console.log("==== Opcao 5 ===");
       
        var lColPessoa = new Pessoa ();
        const lstPessoas = await lColPessoa.retrieveAll();
        console.log(lstPessoas);	
       
       
        return "";
    }

    // async opcao6 ()
    // {

    //    let pField = new TString();
    //    pField.set("pessoa");

    //    console.log(" PField = " + pField.get());
     
    
    //    var lColPessoa = new ColPerson ();
    //    const pValues= lColPessoa.getClusterClassIDs();

    //    console.log(pValues);
    

    //   let strIN =  " " + "this.alias" + "." + pField.get() + " IN (";
  
    //   var lValue = pValues.getFirst();
    //   while (lValue != null)
    //   {
    //     if (typeof lValue.get() === "string")
    //       strIN = strIN + "'" + lValue.get() + "'";
    //     else
    //      strIN = strIN + lValue.get();    
    //     lValue = pValues.getNext();
    //     if (lValue != null)
    //       strIN = strIN + ",";
    //    }  
      
    //    strIN = strIN + ")"
    //    this.statement= this.statement + pField.get() + strIN;
    //    console.log(this.statement);
    //   return  this.statement;
    // }
}