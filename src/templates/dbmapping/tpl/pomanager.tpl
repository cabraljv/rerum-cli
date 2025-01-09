@begin_module@
@begin_class@
import {POManager} from './utils/POMan.js'
import { POM#ClassName# } from './#ClassName#-PORMap.js';
import { Col#ClassName# } from './Col#ClassName#.js';
import { CLID } from './#ClassName#.js';
import { TB#ClassName# } from './#ClassName#-PODTable.js';

export class #ClassName#POMan extends POManager
{
    constructor ()
    {
        super();
    }

    initDB(pDBName)
    {
        super.initDB(pDBName);
        this.registerDBTable(new TB#ClassName#(CLID, "#ClassName#"));
    }

    init(pServerName)
    {
        super.init(pServerName);
        this.initDB("teste");
        this.registerPersistenceCollection(new Col#ClassName#(new POM#ClassName#(CLID, this, this.getDB())));
    }
    
}
@end_class@
@end_module@