
import {MyTester} from './mytester.js'


// Usando async/await para capturar as respostas
async function exec() {
  try {
     var myTester = new MyTester();
     await myTester.exec();
   } catch (erro) {
    console.error('Erro:', erro);
  }
}

exec(); 