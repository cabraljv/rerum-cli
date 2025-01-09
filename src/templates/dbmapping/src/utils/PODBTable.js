
import { TDateTime, TOClassId, TObjectId } from './ToTypes.js'

export class PODBSelectionCriteria
{
  constructor()
  {
     this.statement = " WHERE ";
  }

  isEqual (pField, pValue)
  {
   
    let strEqual = "=";
    
    if (typeof pValue.get() === "string")
      strEqual = strEqual + "'" + pValue.get() + "'";
    else
      strEqual = strEqual + pValue.get();

    this.statement= this.statement + pField.getName() + strEqual;
    return  this.statement;
  }

  in (pField, pValues)
  {
   
    let strIN =  " " + pField.potable.alias + "." + pField.getName() + " IN (";

    var lValue = pValues.getFirst();
    while (lValue != null)
    {
      if (typeof lValue.get() === "string")
        strIN = strIN + "'" + lValue.get() + "'";
      else
       strIN = strIN + lValue.get();    
      lValue = pValues.getNext();
      if (lValue != null)
        strIN = strIN + ",";
     }  
    
    strIN = strIN + ")"

    this.statement= this.statement + strIN;

    console.log(this.statement);
    return  this.statement;
  }
 

}

export class PODBSQLStatement
{
  constructor ()
  {
    this.strSQL = "";
    this.criterias = null;
  }

  getStatement()
  {
    return this.strSQL;
  }

  finish()
  {
    return this.strSQL;
  }

}

export class PODBSelector extends PODBSQLStatement
{

  constructor () 
  {
    super ();
    this.strSQL = "SELECT ";
    this.strFROM = " FROM "; 
    this.tables = [];
    this.aliasList = ['a', 'b', 'c', 'd', 'e'];
    this.numTables = 0;
   
  }

  addTable (pPODBTable)
  {
    //this.fields.push(pPODBTable);
    const tableName =  pPODBTable.getName();
    this.strFROM = this.strFROM + tableName + " ";
    pPODBTable.setAlias(this.aliasList[this.numTables]);
    this.numTables = this.numTables + 1;
    if (this.numTables > 1)
      this.strFROM = this.strFROM + ", ";
    this.strFROM = this.strFROM + pPODBTable.getAlias() + " ";
  }

  addCriteria (pCriteria)
  {
     this.criterias = pCriteria;
    //this.strSQL = this.strSQL + pCriteria.statement;
  }

  addAllColumns()
  {
    this.strSQL = this.strSQL + "* ";
  }

  finish()
  {
    this.strSQL= this.strSQL + this.strFROM;
    if (this.criterias != null)
      this.strSQL = this.strSQL + this.criterias.statement;
    return this.strSQL;
  }

}

export class PODBCollumn
{
  constructor (pFieldName, pTable)
  {
    this.name = pFieldName;
    this.potable = pTable;
  }

  getName()
  {
    return this.name;
  }

}

export class DBRowPOObject {
  
  constructor ()
  {
      this.objectid = new TObjectId();
      this.classid = new TOClassId();
      this.createdate = new TDateTime();
      this.lastupdate = new TDateTime();

  }
  

}



export class PODBTable {

    constructor(pID, pTableName) {
  
      this.tableName = pTableName;
      this.fieldNames = [];
      this.values = [];
      this.alias = "";

      this.defineFieldNames();

      this.id = pID;
  
      this.conn = null;

      this.row = null;

//values
      
//columns
       this.clObjectid = new PODBCollumn ("objectid", this);
       this.clClassid  = new PODBCollumn ("classid", this);
       this.clCreatedate = new PODBCollumn ("createdate", this);
       this.clLastUpdate = new PODBCollumn ("lastupdate", this);
  

    }

    setAlias(pAlias)
    {
      this.alias = pAlias;
    }

    getAlias ()
    {
      return this.alias;
    }
    
    getID()
    {
      return this.id;
    }

    getName()
    {
      return this.name;
    }

    setConnection(pConnection)
    {
      this.conn = pConnection;
    }
    
    createRow ()
    {
      this.row = new DBRowPOObject();
    }

    pushFieldName(pFieldName) {
      this.fieldNames.push(pFieldName);
      return (pFieldName);
    }
  
  
    defineFieldNames() {
      this.pushFieldName("objectid");
      this.pushFieldName("classid");
      this.pushFieldName("createdate");
      this.pushFieldName("lastupdate");
      
      return;// this.fieldNames.length;
    }

    pushValue(pValue) {
        this.values.push(pValue);
        return (pValue);
    }
  
    defineValues() {

         this.values = [];
         this.pushValue (this.row.objectid.get());
         this.pushValue (this.row.classid.get());
         this.pushValue (this.row.createdate.get());
         this.pushValue (this.row.lastupdate.get());
        

       // return this.values;
    
      }

    toFormFieldNames() {
  
      var strFieldNames = "";
      for (let i = 0; i < this.fieldNames.length; i++) {
        strFieldNames = strFieldNames + this.fieldNames[i];
        if (i != (this.fieldNames.length - 1)) {
          strFieldNames = strFieldNames + ' ,';
        }
      }
  
      return strFieldNames;
  
    }
  
  
    toFormInserter() {
      let strInsert = "";
      strInsert = 'INSERT INTO '
        + this.tableName
        + ' ('
        + this.toFormFieldNames()
        + ' ) VALUES (';
  
      var strAliasValues = "";
      for (let i = 1; i <= this.fieldNames.length; i++) {
        strAliasValues = strAliasValues + '$' + i.toString();
        if (i != (this.fieldNames.length))
          strAliasValues = strAliasValues + ',';
      }
      strInsert = strInsert + strAliasValues + ");"
  
      return strInsert;
    }

    toFormSelector() {
      let strSelect = "";
      strSelect = 'SELECT * FROM ' + this.tableName;
      return strSelect;
    }
  
    toFormUpdater() {
      let strUpdate = "";
      if (this.fieldNames.length == 1)
        return str;
      strUpdate = 'UPDATE '
        + this.tableName
        + ' SET ';
  
      var strAliasValues = "";
      for (let i = 2; i <= this.fieldNames.length; i++) {
        strAliasValues = strAliasValues + this.fieldNames[i - 1] + ' = $' + i.toString();
        if (i != (this.fieldNames.length))
          strAliasValues = strAliasValues + ',';
      }
      strUpdate = strUpdate + strAliasValues + ' WHERE ' + this.clObjectid.getName() +  ' = $1';
  
      return strUpdate;
    }
  

    toFormDeleter(pObjectID) {
      let strDelete = "";
      if (this.fieldNames.length == 1)
        return str;
      strDelete = 'DELETE FROM '
        + this.name;
       // + ' WHERE ';
  
      const criteria = new PODBSelectionCriteria();

      strDelete = strDelete + criteria.isEqual(this.clObjectid, pObjectID);
      
      return strDelete;
    }
  
  
    async update() {
    
      let sql = this.toFormUpdater();
      this.defineValues();
      console.log("SQL  =", sql);
      console.log("Values =", this.values);
      const dbConn = await this.conn.get();
      const res = await dbConn.query(sql, this.values);
      return res;
    }
  
    async delete(pObjectId) {
    
      let sql = this.toFormDeleter(pObjectId);
      console.log("SQL  =", sql);
      console.log("Values =", this.values);
      const dbConn = await this.conn.get();
      const res = await dbConn.query(sql, this.values);
      return res;
    }
   
  
  async insert() 
  {
      const sql = this.toFormInserter();
      this.defineValues();
      console.log("SQ1L  =", sql);
      console.log("Values =", this.values);
      const dbConn = await this.conn.get();
      const res = await dbConn.query(sql, this.values);
      return res;
    }
  
  convertResultObject(pRow)
  {
    this.objectid.set(pRow.objectid.get());
    this.classid.set(pRow.classid.get());
    this.nome.set(pRow.nome.get());

  }

  async retrieveByID (pObjectID)
  {
    let sql = this.toFormSelector();
     
    const criteria = new PODBSelectionCriteria();

    sql = sql + criteria.isEqual(this.clObjectid, pObjectID);
    this.newRow();
    const dbConn = await this.conn.get();
    const res = await dbConn.query(sql);
    console.log("SQL = ", sql);
    this.row = res.rows[0];
    //this.convertResultObject(lRow);
    console.log("ROW = ", this.row);
    return res;
    
  }

  
  async retrieveAll (pListClassIds)
  {
    const selector = new PODBSelector();
    selector.addTable(this);
    selector.addAllColumns();
    
    const criteria = new PODBSelectionCriteria();

    criteria.in(this.clClassid, pListClassIds);
    selector.addCriteria(criteria);
    const sql = selector.finish();
    //const sql = this.toFormSelector();
    this.newRow();
    const dbConn = await this.conn.get();
    const res = await dbConn.query(sql);

   // console.log(sql);
    return res;
    //return res;
  }




newRow ()
{
  //this.row = new DBRowPOObject();
  this.row = null;
}
  

};
