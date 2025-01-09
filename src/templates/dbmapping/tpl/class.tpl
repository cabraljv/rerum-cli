
@begin_module@
@begin_class@
import { TString, TDate, TInteger, TReal, TBoolean, TDateTime, TObjectId } from './totypes.js';
import { POObject } from './poobject.js';

const TCNPJ = TString;
const TCPF = TString;
const TDataNascimento = TDate;

export const CLID = 100;


export class #className# extends POObject {
  constructor() {
    super();
    this.setClassId(CLID);
    @begin_attribute@this.#name#@end_attribute@ = new T#Type#()
  }
}
@end_class@
@end_module@