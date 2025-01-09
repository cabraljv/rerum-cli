import { TType, TInteger, TOClassId, TObjectId, TString } from './ToTypes.js';

export class TError extends TInteger
{
   constructor ()
   {
      super();
      this.hasError = false;
      this.code = 0;
      this.description = new TString();
      this.result = null;
   }

   setResult(pRes)
   {
      this.result= pRes;
   }

   getResult ()
   {
      return this.result;
   }
}

export class TOObject extends TType
{
    constructor ()
    {
       super();
       this.classId = new TOClassId();
       this.objectId = new TObjectId();
       this.error = new TError ();
       //this.className = new TString(this.constructor.name);
    }

    copy(pClone)
    {
       super.copy(pClone);
       pClone.classId = this.classId.clone();
       pClone.objectId = this.objectId.clone();
    }

    clone ()
    {
        var lClone = new TOObject();
        this.copy(lClone);
        return lClone;
    }

    setError(pCode)
    {
       this.error.set(pCode);
       return this.error.get(); 
    }

    getError ()
    {
       return this.error; 
    }

    setClassId (pClassId)
    {
       this.classId.set(pClassId); 
    }

    getClassId ()
    {
       return this.classId.get(); 
    }

    getClassName ()
    {
       //return this.className.get(); 
       return this.constructor.name
    }

    setClassName(pClassName)
    {
       this.className.set(pClassName);
       return this.className.get(); 
    }

    setObjectId(pObjectId)
    {
       this.objectId.set(pObjectId);
       return this.objectId.get(); 
    }

    getObjectId ()
    {
       return this.objectId.get(); 
    }
}
