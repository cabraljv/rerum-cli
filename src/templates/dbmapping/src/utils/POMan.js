
import { POObject } from './POObject.js';
import { POColObject } from './POColObject.js';
import { PODBManager } from './PODBManager.js';


import HashMap from 'hashmap'


export class POManager
{
    constructor ()
    {
      this.serverName = "local";
      this.persistenceObjFactory = null;
      this.db = null;
    }

    init(pServerName)
    {
        this.serverName = pServerName;
        this.persistenceObjFactory = new HashMap();
       
    }

    initDB (pDBName)
    {
        console.log("POManger::initDB");
        this.db = new PODBManager(pDBName);
    }

    getDB()
    {
        return this.db;
    }

    registerDBTable (pTable)
    {
         
         this.db.registerDBTable (pTable.getID(), pTable);
    }

    registerPersistenceCollection(pColObject)
    {
      this.persistenceObjFactory.set(pColObject.getClassID(), pColObject);
    }

    retrievePersistenceCollection (pClassId)
    {
        const lCol = this.persistenceObjFactory.get(pClassId);
        return  lCol;
    }

    retrieveORMap(pClassId)
    {
        lMap = this.persistenceObjFactory.get(pClassId).getORMap();
        return  lMap;
    }
   

    createObjectFromFactory (pClassId)
     { 
        const colObj=this.retrievePersistenceCollection(pClassId);
        return colObj.newObject();
     }

    async retrieveObject(pClassId, pObjectId)
    {
        console.log( "POMan Retrieve Object %d", pClassId, " - ", pObjectId );
        const colObj=this.retrievePersistenceCollection(pClassId);
        const lPObj = await colObj.retrieveObject(pObjectId);
        return lPObj;
    }

    async eraseObject(pClassId, pObjectId)
    {
        console.log( "POMan Erase Object %d", pClassId, " - ", pObjectId );
        var colObj=this.retrievePersistenceCollection(pClassId);
        const res= await colObj.eraseObject(pObjectId);
    }

    async insertObject(pPOObject)
    {
        console.log( "POMan Insert Object %d", pPOObject.getClassId(), " - ", pPOObject.getObjectId() );
        var colObj=pPOObject.getPOManager().retrievePersistenceCollection(pPOObject.getClassId());
        const res= await colObj.insertObject(pPOObject);
        return res;
    }

    async updateObject(pPOObject)
    {
        console.log( "POMan Update Object %d", pPOObject.getClassId(), " - ", pPOObject.getObjectId() );
        var colObj=pPOObject.getPOManager().retrievePersistenceCollection(pPOObject.getClassId());
        const res= await colObj.updateObject(pPOObject);
    }


    async retrieveAllObjects(pClassId)
    {
        console.log( "POMan Retrieve AllObjects %d", pClassId );
        const colObj=this.retrievePersistenceCollection(pClassId);
        const lList = await colObj.retrieveAllObjects();
        return lList;
    }

   
}
