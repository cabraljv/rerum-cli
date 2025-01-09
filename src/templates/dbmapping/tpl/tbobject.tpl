@begin_module@
@begin_class@
import { DBRowPOObject, PODBCollumn, PODBTable } from "./utils/PODBTable.js";
import { TDate, TString } from "./utils/ToTypes.js";

class DBRow#ClassName# extends DBRowPOObject {
  
  constructor ()
  {
      super();
      @begin_attribute@this.#attributeName# = new T#AttributeType#()
      @end_attribute@
  }
  

}

export class TB#ClassName# extends PODBTable {

  constructor(pID, pTableName) {
    super (pID, pTableName);
    @begin_attribute@this.#attributeName# = new PODBCollumn ("#attributeName#", this);
    @end_attribute@
  }

  defineFieldNames() {
    super.defineFieldNames();
    @begin_attribute@this.pushFieldName("#attributeName#");
    @end_attribute@
    return; //this.fieldNames.length;
  }

  defineValues() {
    super.defineValues();
    @begin_attribute@this.pushValue(this.row.#attributeName#.get());
    @end_attribute@
  }
  
  newRow ()
  {
     this.row = new DBRow#ClassName#();
  }

};
@end_class@
@end_module@