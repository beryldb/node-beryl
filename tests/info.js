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

Link.flushall();

/* Returns database size */

Link.dbsize().then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Returns current select */

Link.current().then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Returns current version */

Link.version().then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Current database */

Link.db().then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});
