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

var Link = require("../connection");

/* FlushDB */

Link.flushdb().then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* FlushAll */

Link.flushall().then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Returns all modules */

Link.modules().then(function(data) 
{
      for (var entry of data.entries()) 
      {
           var name  = entry[0];
           var desc  = entry[1];
           console.log(name + " => " + desc); 
      }
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Returns all coremodules */

Link.coremodules().then(function(data) 
{
      for (var entry of data.entries()) 
      {
           var name  = entry[0];
           var desc  = entry[1];
           console.log(name + " => " + desc); 
      }
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

Link.dblist().then(function(data) 
{
      for (var entry of data.entries()) 
      {
           var dbname  = entry[0];
           var dbpath  = entry[1];
           console.log(dbname + " => " + dbpath); 
      }
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Current working directory */

Link.pwd().then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});


/* Load a module */

Link.loadmodule("forcejoin").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});
