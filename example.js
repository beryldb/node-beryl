/* 
 * node-beryl - Node.js Driver for BerylDB.
 * http://www.beryldb.com
 *
 * This is an example script for node-beryl. You may modify it
 * and freely use it at your convenience. Feel free to join our
 * discord support server If you are interested about
 * BerylDB. 
 */

"use strict";

var Link = require("./connection");

/* Sets key 'hello' */

Link.set("hello", "world").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* We set a map 'a' with hash 'b' and value 'c'. */

Link.hset("a", "b", "c").then(function(data) 
{
        console.log(data)
})
.catch(function(error)
{
        console.log("error: " + error.message);
});

/* We create list 'd' and push item 'f' */

Link.lpush("d", "f").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.message);
});
