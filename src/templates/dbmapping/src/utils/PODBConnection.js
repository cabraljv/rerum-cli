import PG from 'pg';
const { Pool } = PG;
import 'dotenv/config'


 function connectionPool() {
    
    if (global.connection)
      return global.connection;
    
    const connectionString = process.env.CONNECTION_STRING;
    const configConnection = JSON.parse(connectionString);
    const pool = new Pool(configConnection);

    console.log("Criou pool de conexões no PostgreSQL!");
      
     global.connection = pool;
     return pool;
  };


  export class PODBConnection
{

    constructor (pConnectionString)
    {
        this.connectionString = pConnectionString;
        this.clientConnection = null;
   
    }

    async get()
    {
     // console.log("Conexao ", this.clientConnection);
       if (this.clientConnection == null)
       {
         const lPool = connectionPool();
         this.clientConnection = await lPool.connect();
        }
        
        return  this.clientConnection;
    }

    getPool()
    {
        return connectionPool();
    }

  
    async release()
    {
        var res = null;
       if  (this.clientConnection != null)
       {
          res= await this.clientConnection.release();
          this.clientConnection = null;
        }
       return res;
    }
}