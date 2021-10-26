
# node-beryl, a Node.js driver for BerylDB.

[![Mailing List](https://img.shields.io/badge/email-google%20groups-4285F4 "beryldb@googlegroups.com")](https://groups.google.com/g/beryldb)
[![Twitter](https://img.shields.io/twitter/follow/beryldb?color=%23179CF0&logo=twitter&style=flat-square "@beryldb on Twitter")](https://twitter.com/beryldb)
[![Discord Server](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/23f6w9sgAd)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
<br>


If you want to learn more about BerylDB and how to install it, feel free to check our
documentation at [docs.beryl.dev](https://docs.beryl.dev/).<br>
Follow us on [Twitter](https://twitter.com/beryldb).

![Logo](https://static.beryl.dev/smaller.png)

## QuickStart

The quick start guide will show you how to set up a simple application using
BerylDB's Node.js driver.

It scope is only how to set up the driver and perform the simple operations.
For more advanced coverage, we encourage reading our tutorial.

## Installation

The recommended way to get started using the Node.js 4.x driver is by using the npm (Node Package Manager) to install
node-beryl in your project.

First, you need to create your own project:

```
mkdir new-project
npm init
```

After you've created your own project, you can either download this driver
or use npm:

```
npm i beryldb
```

## Connecting to BerylDB

Let's create a new **connection.js** file that we will be using to show
basic operations. First, we need to add code to conenct to the remote
server:

```javascript
var Connection = require("./lib/server").Server;

var assert = require("assert");

var Link = new Connection({
                      host  : "127.0.0.1",            
                      port  : 6378,           
                      login : "root",
                      password: "default"
}).connect({
  
    connected : function() 
    {
         console.log("Connected to BerylDB server.");
    },

    disconnected : function() 
    { 
         console.error("Disconnected from BerylDB.");
    },

    timeout : function() 
    {
         console.error("Connection link has timed out.");
    },

    retrying : function() 
    {
         console.error("Trying to reconnect to BerylDB server.");
    },

    error : function(error) 
    {
         console.error("Unable to connect to server:", error);
    }
});
```

If you are familiar with BerylDB, you will soon learn that most functions
from this driver have the same name as its underlying function. 

Check Beryl's [full list of commands](https://docs.beryl.dev/commands/)

Let's look at an example exercising all the different available operations:

```javascript
Link.set("hello", "world").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.code);
});
```

```javascript
Link.hset("a", "b", "c").then(function(data) 
{
        console.log(data);
})
.catch(function(error)
{
        console.log("error: " + error.code);
});
```

These two code will have the following output (assuming that neither 'hello'
or 'a' are defined):

```
OK
```

## Querying for multiple data

You can use forEach in order to iterate a result that contains more than one
item:

```javascript
Link.keys("*").then(function(data) 
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
```

## Contributing

We are always welcoming new members. If you wish to start contributing code to the 
Beryl project in any form, such as in the form of pull requests via Github, 
a code snippet, or a patch, you will need to agree to release your work under the terms of the
BSD license.

## External Links

* [Documentation](https://docs.beryl.dev)
* [GitHub](https://github.com/beryldb/beryldb)
* [Support/Discord](https://discord.gg/23f6w9sgAd)
* [Twitter](https://twitter.com/beryldb)
