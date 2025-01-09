@begin_module@
@begin_class@
import { PORMap } from './utils/PORMap.js';

export class POM#ClassName# extends PORMap
{

  constructor(pTableId, pPOManager, pPODBManager)
  {
  
    super(pTableId, pPOManager, pPODBManager);
      
  }
   
  convertObjectToRow (pObject)
  {
       super.convertObjectToRow(pObject);

       @begin_attribute@if(pObject.get#AttributeName#()){
        this.table.row.#attributeName#.set(pObject.get#AttributeName#());
       }
       @end_attribute@
     
  }

  convertRowToObject(pObject)
  {
    super.convertRowToObject(pObject);
    @begin_attribute@if(this.table.row.#attributeName#){
      pObject.set#AttributeName#(this.table.row.#attributeName#);
    }
    @end_attribute@
  }
};
@end_class@
@end_module@