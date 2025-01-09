import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

export class TType
{
    constructor ()
     {
         this.mIsValid = true;
         this.mType = "null";
         this.mFormat = "";
         this.mValue = null;
     }

     isValid ()
     {
        return this.mIsValid;
     }

     myType ()
     {
        return this.mType;
     }

     setValue(pValue)
     {
        if (pValue != null)
          this.mValue = pValue;
         return null;
     }   
     
     setType(pType)
     {
        this.mType = pType;
     }

     setIsValid(pIsValid)
     {
        this.mIsValid = pIsValid;
     }

     setFormat(pFormat)
     {
        this.mFormat = pFormat;
        return this.mFormat;
     }

     isValidArgType (pValue)
     {
        if (typeof pValue === this.mType)
          return true;
        else 
          return false;
     }

     get ()
     {
         return this.mValue;
     }

     getValue ()
     {
         return this.mValue;
     }

    set (pValue)
     {
        if (this.isValidArgType(pValue))
           {
             this.setValue(pValue);
           }
        else 
          {
            this.mIsValid = false;
          }
        return this.mValue;
     } 

     getStr ()
     {
         return this.mValue;
     }
     
     copy (pClone)
     {
        pClone.setValue(this.mValue);
        pClone.setIsValid(this.mIsValid);
        pClone.setType(this.mType);
        pClone.setFormat(this.mFormat);
     }

     clone()
     {
        var lClone = new TType();
        lClone=this.copy(lClone);
        return lClone;
     }

     log()
     {
        console.log(this.myType(), "  - ", typeof this.mValue, "  - ", typeof this.get(), " - ", this.isValid());
     }
}

export class TString extends TType
{
    constructor ()
    {
        super();
        this.mValue = "";
        this.mType = "string"
    }
 
    getStr ()
    {
        return this.get();
    }

    copy(pClone)
    {
       super.copy(pClone);
    }

    clone ()
    {
        var lClone = new TString();
        this.copy(lClone);
        return lClone;
    }

}

export class TInteger extends TType
{
    constructor ()
    {
        super();
        this.mValue = 0;
        this.mType = "number"
    }


    getStr ()
    {
        return this.get().toString();
    }


    isValidArgType (pValue)
    {
       if ((typeof pValue === this.mType) && pValue % 1 === 0)
         return true;
       else 
         return false;
    }

    copy(pClone)
    {
       super.copy(pClone);
    }

    clone ()
    {
        var lClone = new TInteger();
        this.copy(lClone);
        return lClone;
    }

}

export class TReal extends TType
{
    constructor ()
    {
        super();
        this.mValue = 0.0;
        this.mType = "number";
    }

    copy(pClone)
    {
       super.copy(pClone);
    }

    clone ()
    {
        var lClone = new TReal();
        this.copy(lClone);
        return lClone;
    }
}
  


export class TBoolean extends TType
{
    constructor ()
    {
        super();
        this.mValue = false;
        this.mType = "boolean";
    }

    copy(pClone)
    {
       super.copy(pClone);
    }

    clone ()
    {
        var lClone = new TBoolean();
        this.copy(lClone);
        return lClone;
    }
}

export class TDateTime extends TType
{
    constructor ()
    {
        super();
        this.mValue = moment();
        this.mValue.utc();
        this.mType = "datetime";
        this.mFormat="YYYY-MM-DD HH:mm:ss.SSS-03";
        
    }

    isValidArgType (pValue)
    {
       var dtAux = moment(pValue);
       return dtAux.isValid();
    }

    setValue(pValue)
    {
        var dtAux = moment(pValue, this.mFormat);
        dtAux.utc();
        super.setValue(dtAux);
    }

    copy(pClone)
    {
       super.copy(pClone);
    }

    clone ()
    {
        var lClone = new TDateTime();
        this.copy(lClone);
        return lClone;
    }

    get ()
    {
        return this.getValue().format(this.mFormat);
    }

    getStr ()
    {
        return this.get().format(this.mFormat);
    }

    log()
     {
        if (this.isValid())
           console.log(this.get().format(this.mFormat));
        console.log(this.myType(), "  - ", typeof this.mValue, "  - ", typeof this.get(), " - ", this.isValid());
     }
}

export class TDate extends TDateTime
{
    constructor ()
    {
        super();
        this.mType = "date";
        this.mFormat="YYYY-MM-DD";
      
    }

   /* isValidArgType (pValue)
    {
       var dtAux = moment(pValue).format(this.mFormat);
       return dtAux.isValid();
    }*/

    clone ()
    {
        var lClone = new TDate();
        this.copy(lClone);
        return lClone;
    }

   
}


export class TObjectId extends TType
{
    constructor ()
    {
        super();
        this.mValue = uuidv4();
        this.mType = "objectid";
    }

    new ()
    {
        this.mValue = uuidv4(); 
    }

    isValidArgType (pValue)
    {
       if (typeof pValue === "string")
         return true;
       else 
         return false;
    }


    copy(pClone)
    {
       super.copy(pClone);
    }

    clone ()
    {
        var lClone = new TObjectId();
        this.copy(lClone);
        return lClone;
    }

    log()
     {
        if (this.isValid())
           console.log(this.get());
        console.log(this.myType(), "  - ", typeof this.mValue, "  - ", typeof this.get(), " - ", this.isValid());
     }
}

export class TOClassId extends TInteger
{
    constructor ()
    {
        super();
        //this.mType = "classid";
    }

   
    copy(pClone)
    {
       super.copy(pClone);
    }

    clone ()
    {
        var lClone = new TOClassId();
        this.copy(lClone);
        return lClone;
    }

    
    log()
     {
        if (this.isValid())
           console.log(this.get());
        console.log(this.myType(), "  - ", typeof this.mValue, "  - ", typeof this.get(), " - ", this.isValid());
     }
}