@begin_module@
@begin_class@
import {POColObject} from './utils/POColObject.js';
import {CLID, #ClassName#} from './#ClassName#.js';

export class Col#ClassName# extends POColObject
{
  constructor (pRMap)
  {
      super(pRMap);
      this.setClassName("#ClassName#");
      this.setClassID(CLID);
      // this.addClusterClassID(CLID_PessoaFisica);
  }

  newObject()
 {
   return new #ClassName#();
 }
}
@end_class@
@end_module@