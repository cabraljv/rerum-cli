
import { TObjectId } from './ToTypes.js'
import { TOList } from './ToList.js'


export class PORMap {

    constructor(pTableId, pPOManager, pPODBManager) {
    
        this.poman = pPOManager;
        this.db =  pPODBManager;
        this.table = this.db.retrieveDBTable(pTableId);
        console.log("tableId = ", this.table.id);
        console.log("name = ", this.table.name);
        
    }
      
    convertObjectToRow (pObject)
    {
         this.table.row.objectid.set(pObject.getObjectId());
         this.table.row.classid.set(pObject.getClassId());
         this.table.row.createdate.set(pObject.getCreateDate());
         this.table.row.lastupdate.set(pObject.getLastUpdate());
       
    }

    convertRowToObject(pObject)
    {
      pObject.setObjectId(this.table.row.objectid);
      pObject.setClassId(this.table.row.classid);
      pObject.setCreateDate(this.table.row.createdate);
      pObject.setLastUpdate(this.table.row.lastupdate);  
    }
  
    async insertObject(pObj) {
      this.table.newRow();
      this.convertObjectToRow (pObj);
      const conn = await this.db.getConnection();
      this.table.setConnection(conn);
      const res= await this.table.insert();
      await conn.release();
      return (res);
    }

    async updateObject(pObj) {
      this.table.newRow();
      this.convertObjectToRow (pObj);
      const conn = await this.db.getConnection();
      this.table.setConnection(conn);
      const res= await this.table.update();
      await conn.release();
      return (res);
    }
  
    async eraseObjectByID (pObjectId) {
      const lObjectID = new TObjectId ();
      lObjectID.set(pObjectId);
      const conn = await this.db.getConnection();
      this.table.setConnection(conn);
      const res = await this.table.delete(lObjectID);
      await conn.release();
      return (res);
    }
  
  async retrieveObjectByID (pClassId, pObjectId)
  {
   
    const lObjectID = new TObjectId ();
    lObjectID.set(pObjectId);
    const conn = await this.db.getConnection();
    this.table.setConnection(conn);
    const res = await this.table.retrieveByID(lObjectID);
    var lPOObject = this.poman.createObjectFromFactory (pClassId);
    const lColObject = this.poman.retrievePersistenceCollection(pClassId);
    lColObject.ormap.convertRowToObject(lPOObject);
    lPOObject.getError().setResult(res);
    await conn.release();
    return lPOObject;
  }

 

  async retrieveAllObjects (pListClassIds)
  {
    
    const conn = await this.db.getConnection();
    this.table.setConnection(conn);
    const res = await this.table.retrieveAll(pListClassIds);
    var qtdRows = res.rows.length;
    var lList = new TOList();

    for(let i = 0; i < qtdRows; i++) {
      const row = res.rows[i];
      const lClassId = row.classid;
      var lPOObject = this.poman.createObjectFromFactory (lClassId);
      const lColObject = this.poman.retrievePersistenceCollection(lClassId);
      lColObject.ormap.convertRowToObject(lPOObject);
      lList.push(lPOObject);
    }  
    
    lList.getError().setResult(res);
    await conn.release();
    return lList;
  }

 
};
