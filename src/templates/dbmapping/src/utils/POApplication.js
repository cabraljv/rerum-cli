//import {POManager} from './poman.js'

class POTrace 

{
    constructor ()
    {
        this.type = 0;
        this.nivel = 0;
        this.alive = false;
    }

    isAlive ()
    {
         return this.alive;
    }

    set(pNivel)
    {
        this.nivel = pNivel;
        this.alive = true;
    }

    reset()
    {
        this.alive = false;
    }

    
    log(pMessage)
    {
        if (this.isAlive()) 
        {
            console.log(pMessage);
        }

    }
}

export const TRACE = new POTrace ();

export var POMAN = null; 

export function POMANAGER()
{
    return POMAN;
}

export class POApplication
{
    constructor ()
    {
        this.poman = null;
        TRACE.set(0);
    }

    setPOMan (pPOMan)
    {
        this.poman = pPOMan;
        POMAN = pPOMan;
    } 

    getPOMan ()
    {
        return this.poman;
    }

    async init()
    {
        TRACE.log("POApplication.init");
    }
    
    async end()
    {
      const db= this.poman.getDB();
      const lPool = db.getPool(); 
      await lPool.end();
     }
}




//module.exports = {TRACE};