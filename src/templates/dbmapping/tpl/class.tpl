
@begin_module@
@begin_class@
import { TString, TDate, TInteger, TReal, TBoolean, TDateTime, TObjectId } from './utils/ToTypes.js';
import { POObject } from './utils/POObject.js';

export const CLID = 100;


export class #className# extends POObject {
  constructor() {
    super();
    this.setClassId(CLID);
    @begin_attribute@this.#attributeName# = new T#AttributeType#()
    @end_attribute@
  }
  @begin_attribute@set#AttributeName#(pValue) { this.#attributeName# = pValue; }
  get#AttributeName#() { return this.#attributeName#; }
  @end_attribute@
}
@end_class@
@end_module@