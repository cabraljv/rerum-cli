import { POObject } from './POObject.js';
import { TOClassId } from './ToTypes.js';
import { TOList } from './ToList.js';

export class POColObject 
{
    constructor (pRMap)
    {
      this.classId = new TOClassId();
      this.className = "POObject";
      //this.poman = pPOMan;
      this.clustersIDs = new TOList();
      this.ormap = pRMap
    }

 newObject()
 {
   return new POObject();
 }

 getClassID ()
 {
    return this.classId.get();
 }

 setClassID (pClassId)
 {
    this.classId.set(pClassId);
    this.addClusterClassID(pClassId);
 }

 getClusterClassIDs ()
  {
    return this.clustersIDs;
  }

 addClusterClassID(pClassId)
 {
   var lClassId = new TOClassId();
   lClassId.set(pClassId);
   this.clustersIDs.push(lClassId);
 }

 getClassName ()
 {
    return this.className;
 }

 setClassName (pClassName)
 {
    this.className = pClassName;
 }
  pomanager ()
  {
    return this.poman;
  }

  getORMap()
  {
     return this.ormap;
  }


 
async eraseObject(pObjectId)
 {
    console.log( "ColObject Erase Object %d", this.getClassID(), " - ", pObjectId );
    const lPObj= await this.ormap.eraseObjectByID (pObjectId);  
    return lPObj;
 }

async insertObject(pPOObject)
{
    console.log( "ColObject Insert Object %d", this.getClassID(), " - ", pPOObject.getObjectId() );
    const res= await this.ormap.insertObject (pPOObject);  
    return res;
}

async updateObject(pPOObject)
{
    console.log( "ColObject Update Object %d", this.getClassID(), " - ", pPOObject.getObjectId() );
    const res= await this.ormap.updateObject (pPOObject);  
    return res;
}

async retrieveObject(pObjectId)
 {
    console.log( "ColObject Retrieve Object %d", this.getClassID(), " - ", pObjectId );
    const lPObj= await this.ormap.retrieveObjectByID (this.getClassID(), pObjectId);  
    return lPObj;
 }

 async retrieveAllObjects()
 {
    console.log( "ColObject Retrieve AllObjects %d", this.getClassID());
    const lListObjects= await this.ormap.retrieveAllObjects (this.getClusterClassIDs());  
    return lListObjects;
 }  
}
