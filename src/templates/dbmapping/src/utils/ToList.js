import { TOObject } from './ToObject.js';

export class TOList extends TOObject
{
    constructor ()
    {
       super();
       this.mCurrent = 0;
       this.values = [];
    }

    copyValues(pClone)
    {
     var lItem = this.getFirst();
     while (lItem != null) {
         pClone.values.push(lItem);
         lItem = myList.getNext();
       }
    }

    copy(pClone)
    {
       super.copy(pClone);
       pClone.mCurrent = this.mCurrent;
       pClone.values = this.copyValues(pClone);
    }

    clone ()
    {
        var lClone = new TOList();
        this.copy(lClone);
        return lClone;
    }

    push(pItem)
    {
        var lCopy = pItem.clone(pItem);
        this.values.push(lCopy);
        return lCopy;
    }

    pop (pItem)
    {
        this.values.pop(pItem);
        return pItem;
    }

   /* release (pIndex)
    {
       if (pIndex = null)
         pIndex = this.mCurrent;

         if pIndex >=0 and pIndex <= this.getLength()
             for ()
    }*/

    getLength ()
    {
        return this.values.length;
    }

    getFirst ()
    {
       if (this.getLength() > 0)
        {
            this.mCurrent = 1;
            return this.values[this.mCurrent-1];
        }
       else 
        return null;
    }

    getNext ()
    {
       if (this.mCurrent <= this.getLength()-1)
        {
            this.mCurrent = this.mCurrent + 1;
            return this.values[this.mCurrent-1];
        }
       else 
        return null;
    }

    getPrevious ()
    {
        if (this.mCurrent > 0)
        {
            this.mCurrent = this.mCurrent - 1;
            return this.values[this.mCurrent-1];
        }
       else 
        return null;
     }

    getLast ()
    {
        if (this.getLength() > 0)
        {
            this.mCurrent = this.getLength();
            return this.values[this.mCurrent-1];
        }
       else 
        return null;
    }
}