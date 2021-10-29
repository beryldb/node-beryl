/*
 * node-beryl - NodeJS Client for BerylDB.
 * http://www.beryldb.com
 *
 * Copyright (C) 2021 - Carlos F. Ferry <cferry@beryldb.com>
 * 
 * This file is part of BerylDB. BerylDB is free software: you can
 * redistribute it and/or modify it under the terms of the BSD License
 * version 3.
 *
 * More information about our licensing can be found at https://docs.beryl.dev
 */
 
"use strict";

var ServerLink = require("./generic").ServerLink;

var ServerConnection = function(options) 
{
       ServerLink.call(this, "client", options);
};

ServerConnection.prototype = Object.create(ServerLink.prototype);

Object.defineProperty(ServerConnection.prototype, "constructor", 
{
       value      : ServerConnection,
       enumerable : false,
       writable   : true
});

function ToArray(value)
{
     if (Array.isArray(value))
     {
          return value.join(" ");
     }
     else
     {
          return value;
     }
}

function comillas(value) 
{
       return "\"" + value + "\"";
}

async function RemoveComillas(res)
{
       return res.then(function(data)
       {
            return Promise.resolve(data.substring(1).slice(0, -1));
            
       }).catch(function(err)
       {
             return Promise.reject(err);
       });
}

async function RemoveListComillas(res)
{
       var final = [];
       
       return res.then(function(data)
       {
            data.forEach(function(line)
            { 
                 final.push(line.substring(1).slice(0, -1));
            })
            
            return Promise.resolve(final);

       }).catch(function(err)
       {
             return Promise.reject(err);
       });
}

async function KeyVal(res)
{
       var final = new Map();
       
       return res.then(function(data)
       {
            data.forEach(function(line)
            { 
                 var aux = line.split(" ");            
                 var name = aux[0].toString();
               
                 aux.shift();
                 final.set(name, aux.join(" "));
            })
          
            return Promise.resolve(final);

       }).catch(function(err)
       {
            return Promise.reject(err);       
       });
}

ServerConnection.prototype._operation_$limits = function(command, key, offset = "", limit = "", done) 
{
      this.Send(command + " " + this.RemoveUnsafeCommandText(key) + " " + offset + " " + limit, done);
};

ServerConnection.prototype._operation_$triple = function(command, key, hash, value, done) 
{
       this.Send(command + " " + this.RemoveUnsafeCommandText(key) + " " + this.RemoveUnsafeCommandText(hash) + " " + this.RemoveUnsafeCommandText(value), done);
};

ServerConnection.prototype._operation_$hash = function(command, key, hash, done) 
{
       this.Send(command + " " + this.RemoveUnsafeCommandText(key) + " " + this.RemoveUnsafeCommandText(hash), done);
};

ServerConnection.prototype._operation_$basichash = function(command, key, hash, done) 
{
       this.Send(command + " " + this.RemoveUnsafeCommandText(key) + " " + hash, done);
};

ServerConnection.prototype._operation_$hashdual = function(command, key, hash, value, done) 
{
       this.Send(command + " " + this.RemoveUnsafeCommandText(key) + " " + this.RemoveUnsafeCommandText(hash) + " " + comillas(value), done);
};

ServerConnection.prototype._operation_$dual = function(command, key, value, done) 
{
       this.Send(command + " " + this.RemoveUnsafeCommandText(key) + " " + comillas(value), done);
};

ServerConnection.prototype._operation_$simple = function(command, key, done) 
{
      this.Send(command + " " + this.RemoveUnsafeCommandText(key), done);
};

ServerConnection.prototype._operation_$noarg = function(command, done) 
{
      this.Send(command, done);
};

ServerConnection.prototype.getset = function(key, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("dual", ["GETSET", key, value, done]);
      });
};

ServerConnection.prototype.setnx = function(key, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("dual", ["SETNX", key, value, done]);
      });
};

ServerConnection.prototype.avg = function(key, value = 1) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("hash", ["AVG", key, value, done]);
      });
};


ServerConnection.prototype.dbcreate = function(key, value = "") 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("hash", ["DBCREATE", key, value, done]);
      });
};

ServerConnection.prototype.settx = function(key, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("dual", ["SETTX", key, value, done]);
      });
};

ServerConnection.prototype.ntouch = function(dest) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["NTOUCH", ToArray(dest), done]);
       });
};

ServerConnection.prototype.copy = function(key, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("dual", ["COPY", key, value, done]);
      });
};

ServerConnection.prototype.exists = function(key) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("simple", ["EXISTS", key, done]);
      });
};

ServerConnection.prototype.move = function(key, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("dual", ["MOVE", key, value, done]);
      });
};

ServerConnection.prototype.touch = function(dest) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["TOUCH", ToArray(dest), done]);
       });
};

ServerConnection.prototype.change = function(dest) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["CHANGE", dest, done]);
       });
};

ServerConnection.prototype.sflush = function(key) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["SFLUSH", key, done]);
       });
};


ServerConnection.prototype.current = function() 
{
       return this.SetPromise(function(done) 
       {
            this.Schedule("noarg", ["CURRENT", done]);
       });
};

ServerConnection.prototype.version = function() 
{
       return this.SetPromise(function(done) 
       {
            this.Schedule("noarg", ["VERSION", done]);
       });
};

ServerConnection.prototype.vexists = function(key, value) 
{
       return this.SetPromise(function(done) 
       {
            this.Schedule("dual", ["VEXISTS", key, value, done]);
       });
};

ServerConnection.prototype.lexists = function(key, value) 
{
       return this.SetPromise(function(done) 
       {
            this.Schedule("dual", ["LEXISTS", key, value, done]);
       });
};

ServerConnection.prototype.gcalc = function(from, to) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("hash", ["GCALC", from, to, done]);
       });
};

ServerConnection.prototype.geoaddnx = function(key, hash, value) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("triple", ["GEOADDNX", key, hash, value, done]);
       });
};

ServerConnection.prototype.geoadd = function(key, hash, value) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("triple", ["GEOADD", key, hash, value, done]);
       });
};

ServerConnection.prototype.use = function(key) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["USE", key, done]);
       });
};

ServerConnection.prototype.dbdelete = function(key) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["DBDELETE", key, done]);
       });
};

ServerConnection.prototype.multi = function() 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("noarg", ["MULTI", done]);
       });
};

ServerConnection.prototype.multireset = function() 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("noarg", ["multireset", done]);
       });
};

ServerConnection.prototype.mrun = function() 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("noarg", ["MRUN", done]);
       });
};

ServerConnection.prototype.restart = function() 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("noarg", ["RESTART", done]);
       });
};

ServerConnection.prototype.exec = function(key) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["EXEC", key, done]);
       });
};

ServerConnection.prototype.rkey = function() 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("noarg", ["RKEY", done]);
       });
};

ServerConnection.prototype.type = function(key) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["EXEC", key, done]);
       });
};

ServerConnection.prototype.asbool = function(key) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["ASBOOL", key, done]);
       });
};

ServerConnection.prototype.isbool = function(key) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["ISBOOL", key, done]);
       });
};

ServerConnection.prototype.cancel = function(key) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["CANCEL", key, done]);
       });
};

ServerConnection.prototype.shutdown = function(reason) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["SHUTDOWN", reason, done]);
       });
};

ServerConnection.prototype.pwd = function() 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("noarg", ["PWD", done]);
       });
};

ServerConnection.prototype.listusers = function() 
{
       var res = this.SetPromise(function(done) 
       {
             this.Schedule("noarg", ["LISTUSERS", done]);
       });
       
       return KeyVal(res);
};

ServerConnection.prototype.listadmins = function() 
{
       var res = this.SetPromise(function(done) 
       {
             this.Schedule("noarg", ["LISTADMINS", done]);
       });
       
       return KeyVal(res);
};

ServerConnection.prototype.dblist = function() 
{
       var res = this.SetPromise(function(done) 
       {
             this.Schedule("noarg", ["DBLIST", done]);
       });
       
       return KeyVal(res);
};

ServerConnection.prototype.flushdb = function(where) 
{
       return this.SetPromise(function(done) 
       { 
             this.Schedule("simple", ["flushdb", where, done]);
       });
};

ServerConnection.prototype.flushall = function() 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("noarg", ["FLUSHALL", done]);
       });
};

ServerConnection.prototype.future = function(key, hash, value) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("hashdual", ["FUTURE", key, hash, value, done]);
       });
};

ServerConnection.prototype.setex = function(key, hash, value) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("hashdual", ["SETEX", key, hash, value, done]);
       });
};

ServerConnection.prototype.hsetnx = function(key, hash, value) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("hashdual", ["HSETNX", key, hash, value, done]);
       });
};

ServerConnection.prototype.hset = function(key, hash, value) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("hashdual", ["HSET", key, hash, value, done]);
       });
};

ServerConnection.prototype.hash = function(key, value) 
{
       return this.SetPromise(function(done) 
       {
            this.Schedule("simple", ["INCRBY", key, value, done]);
       });
};

ServerConnection.prototype.expireat = function(key, epoch) 
{
       return this.SetPromise(function(done) 
       {
            this.Schedule("basichash", ["EXPIREAT", key, epoch, done]);
       });
};

ServerConnection.prototype.mdel = function(key, value) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("hash", ["MDEL", key, value, done]);
       });
};

ServerConnection.prototype.hdel = function(key, value) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("hash", ["HDEL", key, value, done]);
       });
};

ServerConnection.prototype.hexists = function(key, value) 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("hash", ["HEXISTS", key, value, done]);
       });
};


ServerConnection.prototype.hget = function(key, value) 
{
       var res = this.SetPromise(function(done) 
       {
             this.Schedule("hash", ["HGET", key, value, done]);
       });
       
       return RemoveComillas(res);
};

ServerConnection.prototype.search = function(key = "", offset = "", limit = "") 
{
       var res = this.SetPromise(function(done) 
       {
             this.Schedule("limits", ["SEARCH", key, offset, limit, done]);
       });
       
       return KeyVal(res);
};

ServerConnection.prototype.commands = function(key = "") 
{
       var res = this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["COMMANDS", key, done]);
       });
       
       return KeyVal(res);
};

ServerConnection.prototype.modules = function(key = "") 
{
       var res = this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["MODULES", key, done]);
       });
       
       return KeyVal(res);
};

ServerConnection.prototype.coremodules = function(key = "") 
{
       var res = this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["COREMODULES", key, done]);
       });
       
       return KeyVal(res);
};

ServerConnection.prototype.keys = function(key = "") 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("simple", ["KEYS", key, done]);
       });
};

ServerConnection.prototype.getpersist = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["GETPERSIST", key, done]);
       });
};

ServerConnection.prototype.getdel = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["GETDEL", key, done]);
       });
};

ServerConnection.prototype.strlen = function(value, to) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["STRLEN", value, done]);
       });
};

ServerConnection.prototype.isnum = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["ISNUM", key, done]);
       });
};

ServerConnection.prototype.unloadmodule = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["UNLOADMODULE", key, done]);
       });
};

ServerConnection.prototype.loadmodule = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["LOADMODULE", key, done]);
       });
};

ServerConnection.prototype.lresize = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["LRESIZE", key, done]);
       });
};

ServerConnection.prototype.vresize = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["VRESIZE", key, done]);
       });
};

ServerConnection.prototype.lfront = function(key) 
{
       var res = this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["LFRONT", key, done]);
       });
       
       return RemoveComillas(res);
};

ServerConnection.prototype.lback = function(key) 
{
       var res = this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["LBACK", key, done]);
       });
       
       return RemoveComillas(res);
};

ServerConnection.prototype.vback = function(key) 
{
       var res = this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["VBACK", key, done]);
       });
       
       return RemoveComillas(res);
};

ServerConnection.prototype.vfront = function(key) 
{
       var res = this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["VFRONT", key, done]);
       });
       
       return RemoveComillas(res);
};

ServerConnection.prototype.copy = function(value, to) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["COPY", value, to, done]);
       });
};

ServerConnection.prototype.persist = function(value) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["PERSIST", value, done]);
       });
};

ServerConnection.prototype.hstrlen = function(value, to) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("hash", ["HSTRLEN", value, to, done]);
       });
};

ServerConnection.prototype.renamenx = function(value, to) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("hash", ["RENAMENX", value, to, done]);
       });
};

ServerConnection.prototype.epoch = function(server = "") 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["EPOCH", server, done]);
       });
};

ServerConnection.prototype.time = function(server = "") 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["TIME", server, done]);
       });
};

ServerConnection.prototype.del = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["DEL", key, done]);
       });
};

ServerConnection.prototype.whoami = function() 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("noarg", ["WHOAMI", done]);
       });
};

ServerConnection.prototype.rename = function(value, to) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("hash", ["RENAME", value, to, done]);
       });
};

ServerConnection.prototype.expire = function(key, seconds) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("basichash", ["EXPIRE", key, seconds, done]);
       });
};

ServerConnection.prototype.vget = function(key, offset = "", limit = "") 
{
       var res = this.SetPromise(function(done) 
       {
              this.Schedule("limits", ["VGET", key, offset, limit, done]);
       });
       
       return RemoveListComillas(res);
};

ServerConnection.prototype.lget = function(key, offset = "", limit = "") 
{
       var res = this.SetPromise(function(done) 
       {
              this.Schedule("limits", ["LGET", key, offset, limit, done]);
       });
       
       return RemoveListComillas(res);
};

ServerConnection.prototype.reset = function() 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("noarg", ["RESET", done]);
       });
};

ServerConnection.prototype.tte = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["TTE", key, done]);
       });
};

ServerConnection.prototype.ttlat = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["TTLAT", key, done]);
       });
};

ServerConnection.prototype.ttl = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["TTL", key, done]);
       });
};

ServerConnection.prototype.lpos = function(key, value) 
{
       var res = this.SetPromise(function(done) 
       {
              this.Schedule("basichash", ["LPOS", key, value, done]);
       });

      return RemoveComillas(res);
};

ServerConnection.prototype.vpos = function(key, value) 
{
       var res = this.SetPromise(function(done) 
       {
              this.Schedule("basichash", ["VPOS", key, value, done]);
       });
       
       return RemoveComillas(res);
};

ServerConnection.prototype.decrby = function(key, value) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("hash", ["DECRBY", key, value, done]);
       });
};

ServerConnection.prototype.incrby = function(key, value) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("hash", ["INCRBY", key, value, done]);
       });
};

ServerConnection.prototype.incr = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["INCR", key, done]);
       });
};

ServerConnection.prototype.db = function() 
{
       return this.SetPromise(function(done) 
       {
             this.Schedule("noarg", ["DB", done]);
       });
};

ServerConnection.prototype.dbsize = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["DBSIZE", key, done]);
       });
};

ServerConnection.prototype.decr = function(key) 
{
       return this.SetPromise(function(done) 
       {
              this.Schedule("simple", ["DECR", key, done]);
       });
};

ServerConnection.prototype.expires = function(key) 
{
      return this.SetPromise(function(done) 
      {
          this.Schedule("simple", ["EXPIRES", key, done]);
      });
};

ServerConnection.prototype.get = function(value) 
{
      var res = this.SetPromise(function(done) 
      {
          this.Schedule("simple", ["GET", value, done]);
      });
      
      return RemoveComillas(res);
};

ServerConnection.prototype.lavg = function(key) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("simple", ["LAVG", key, done]);
      });
};

ServerConnection.prototype.vavg = function(key) 
{
       return this.SetPromise(function(done) 
       {
            this.Schedule("simple", ["VAVG", key, done]);
       }); 
};

ServerConnection.prototype.vhigh = function(key) 
{
       return this.SetPromise(function(done) 
       {
            this.Schedule("simple", ["VHIGH", key, done]);
       });
};

ServerConnection.prototype.vlow = function(key) 
{
       return this.SetPromise(function(done) 
       {
            this.Schedule("simple", ["VLOW", key, done]);
       });
};

ServerConnection.prototype.vsum = function(key) 
{
      return this.SetPromise(function(done) 
      {
           this.Schedule("simple", ["VSUM", key, done]);
      });
};

ServerConnection.prototype.ldel = function(key, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("dual", ["LDEL", key, value, done]);
      });
};

ServerConnection.prototype.vdel = function(key, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("dual", ["VDEL", key, value, done]);
      });
};

ServerConnection.prototype.set = function(key, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("dual", ["SET", key, value, done]);
      });
};

ServerConnection.prototype.mpushnx = function(key, hash, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("hashdual", ["MPUSHNX", key, hash, value, done]);
      });
};

ServerConnection.prototype.mpush = function(key, hash, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("hashdual", ["MPUSH", key, hash, value, done]);
      });
};

ServerConnection.prototype.mget = function(key, offset = "", limit = "") 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("limits", ["MGET", key, offset, limit, done]);
      });
};

ServerConnection.prototype.lpush = function(key, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("dual", ["LPUSH", key, value, done]);
      });
};

ServerConnection.prototype.vpush = function(key, value) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("dual", ["VPUSH", key, value, done]);
      });
};

ServerConnection.prototype.keys = function(key = "*", offset = "", limit = "")
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("limits", ["KEYS", key, offset, limit, done]);
      });
};

ServerConnection.prototype.vcount = function(key) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("simple", ["VCOUNT", key, done]);
      });
};

ServerConnection.prototype.lcount = function(key) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("simple", ["LCOUNT", key, done]);
      });
};

ServerConnection.prototype.lsort = function(key) 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("simple", ["LSORT", key, done]);
      });
};

ServerConnection.prototype.vkeys = function(key = "*", offset = "", limit = "")
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("limits", ["VKEYS", key, offset, limit, done]);
      });
};

ServerConnection.prototype.miter = function(key, offset = "", limit = "")
{
      var res = this.SetPromise(function(done) 
      {
            this.Schedule("limits", ["MITER", key, offset, limit, done]);
      });
      
      return RemoveListComillas(res);
};

ServerConnection.prototype.lkeys = function(key = "*", offset = "", limit = "")
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("limits", ["LKEYS", key, offset, limit, done]);
      });
};

ServerConnection.prototype.hvals = function(key, offset = "", limit = "") 
{
      var res = this.SetPromise(function(done) 
      {
            this.Schedule("limits", ["HVALS", key, offset, limit, done]);
      });

      return RemoveListComillas(res);
};

ServerConnection.prototype.mget = function(key, offset = "", limit = "") 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("limits", ["MGET", key, offset, limit, done]);
      });
};

ServerConnection.prototype.hlist = function(key, offset = "", limit = "") 
{
      return this.SetPromise(function(done) 
      {
            this.Schedule("limits", ["HLIST", key, offset, limit, done]);
      });
};


exports.ServerConnection = ServerConnection;