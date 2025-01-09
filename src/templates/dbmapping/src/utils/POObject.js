import { TOObject } from './ToObject.js';
import { TDateTime } from './ToTypes.js';
import { POMANAGER } from './POApplication.js';

export class POObject extends TOObject
{
    constructor ()
    {
        super();
       // this.setObjectId("-1");
        this.createDate = new TDateTime();
        this.lastUpdate = new TDateTime();
        this.pomanager = POMANAGER();
    }

    setCreateDate (pDate)
    {
       this.createDate.set(pDate); 
    }

    getCreateDate ()
    {
      var lDate =  this.createDate;
      return lDate.get(); 
    }

    setLastUpdate (pDate)
    {
       this.createDate.set(pDate); 
    }

    getLastUpdate ()
    {
       return this.lastUpdate.get(); 
    }

    getNome ()
    {
       return this.nome.get(); 
    }

 async retrieve(pObjectID)
 {
   console.log( "Retrieve Object %d", this.getClassId(), " - ", pObjectID);
   const pObj=await this.pomanager.retrieveObject(this.getClassId(), pObjectID);
   return pObj;  
 }

 
async erase()
 {
    console.log( "Erase Object %d", this.getClassId(), " - ", this.getObjectId()  );
    const res=await this.pomanager.eraseObject(this.getClassId(), this.getObjectId() );
    return res;  
 }

async insert()
{
    console.log( "Insert Object %d", this.getClassId(), " - ", this.getObjectId() );
    const res=await this.pomanager.insertObject(this);
    return res;  
}

async update()
{
    console.log( "Update Object %d", this.getClassId(), " - ", this.getObjectId() );
    const res=await this.pomanager.updateObject(this);
    return res;  
}

async retrieveAll()
 {
   console.log( "RetrieveAll Objects %d", this.getClassId());
   const pList=await this.pomanager.retrieveAllObjects(this.getClassId());
   return pList;  
 }

setPOManager(pPOManager)
{
    this.pomanager = pPOManager;
}

getPOManager(pPOManager)
{
    return this.pomanager;
}

}
