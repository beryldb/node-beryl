/*
 * node-beryl - Node.js Driver for BerylDB.
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

/* Adds Latitude and Longitude coordinates for Miami */

Link.geoadd("Miami", "25.761681", "-80.191788").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Adds Latitude and Longitude coordinates for Los Angeles */

Link.geoadd("Los_Angeles", "34.052235", "-118.243683").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Calculates distance between Miami and Los Angeles */

Link.gcalc("Miami", "Los_Angeles").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});
