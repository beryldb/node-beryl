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

/* Inserts 'item' into list1. */

Link.lpush("list1", "item").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Returns all items on list 'list1' */

Link.lget("list1").then(function(data) 
{
        data.forEach(function(item)
        {
                console.log(item);
        })
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Returns all lists */

Link.lkeys("*").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Returns last item from a 'list1' */

Link.lback("list1").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Counts items on 'list1' */

Link.lcount("list1").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Resizes 'list1' to 1. */

Link.lresize("list1", 1).then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* Deletes item from 'list1' */

Link.ldel("list1", "item").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

