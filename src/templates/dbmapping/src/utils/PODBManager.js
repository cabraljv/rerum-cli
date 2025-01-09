import { PODBConnection } from './PODBConnection.js';

//import { PODBTable } from './podbtable.js';

import HashMap from 'hashmap'

export class PODBError 
{

constructor ()
{
    this.hasError = false;
    this.dbResponse = null;
}

isOK()
{
  return !this.hasError;
}

getDBResponse ()
{
    return this.dbResponse;
}

setDBResponse (pRes)
{
  this.dbResponse = pRes;
}

}


export class PODBTransaction {
    
    constructor(pConnection) {
      this.connection = pConnection;
      this.count = 0;
      this.error = new PODBError();
    }
  
    async execQuery (pSqlStatement)
    {
        const sql = pSqlStatement;
        const res = await this.connection.query(sql);
        this.dbError.setDBResponse(res);
        return this.dbError;
    }

    async begin() {
      
      this.count = this.count + 1;
      
      if (this.count == 1)
      {
         const sql = "BEGIN";
         this.dbError =  await this.execQuery(sql);
      }

      return this.dbError;
    }
  
    async commit() {
   
      this.count = this.count - 1;
   
      if (this.count == 0)
        {
           const sql = "COMMIT";
           this.dbError =  await this.execQuery(sql);
        } 
      return this.dbError;
    }

    async abort() {
    
        this.count = 0;
        const sql = "ROLLBACK";
        this.dbError =  await this.execQuery(sql);
        return this.dbError;
      
    }
  }
  
  


export class PODBManager 
{

    constructor (pDBName)
    {
       this.name = pDBName;
       this.connection = new PODBConnection(pDBName);
       this.tables = new HashMap();
       this.pool = this.connection.getPool();
    }

    async getConnection ()
    {
        //return await this.connection.get();
        return await this.connection;
    }

    getPool ()
    {
      return this.pool;
    }
    registerDBTable(pID, pTable)
    {
       this.tables.set(pID, pTable);
    }

    retrieveDBTable (pTableID)
    {
        const lTable = this.tables.get(pTableID);
        return  lTable;
    }

}


/*
export class PODBPessoa extends PODBMapping {
    constructor (pPessoa)
    {
        this.objPessoa = null;
        this.rowPessoa = null;
    }

    covertDBToObject (pPessoa)
    {

    }

    convertObjectToPessoa (pPessoa)
    {

    }
}


export class TBPessoa extends POTable {

    constructor(pTableName) {
  
      super(pTableName);
  
    }

    
   
    defineFieldNames() {
  
      this.dbFieldName("objectid");
      this.dbFieldName("classid");
      this.dbFieldName("createdate");
      this.dbFieldName("lastupdate");
      this.dbFieldName("cpfcnpj");
      this.dbFieldName("cpfcnpj");
    
  
      return this.fieldNames.length;;
    }
  
    defineValues() {
  
      const values = [
        this.objectId,
        this.classId,
        this.createdate,
        this.lastupdate,
        this.cpfcnpj,
        this.dtnascimentooucriacao
      ];
  
      return values;
  
    }
  
  };*/