
# node-beryl, a Node.js driver for BerylDB.

[![Mailing List](https://img.shields.io/badge/email-google%20groups-4285F4 "beryldb@googlegroups.com")](https://groups.google.com/g/beryldb)
[![Twitter](https://img.shields.io/twitter/follow/beryldb?color=%23179CF0&logo=twitter&style=flat-square "@beryldb on Twitter")](https://twitter.com/beryldb)
[![Discord Server](https://img.shields.io/discord/823028202318200912?color=7289da&logo=discord "Discord Server")](https://discord.gg/GRCEuMdYRt)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
<br>


If you want to learn more about BerylDB and how to install it, feel free to check our
documentation at [docs.beryl.dev](https://docs.beryl.dev/).<br>
Follow us on [Twitter](https://twitter.com/beryldb).

![Logo](https://docs.beryl.dev/img/smaller.png??)

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

After you've created your own project downloading this driver.

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

* Check Beryl's [full list of commands](https://docs.beryl.dev/using/commands/)

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

## Development

Contributions to php-beryl are appreciated either in the form of pull requests for new features, 
bug fixes, or simple to report a bug. If you wish to join our [Google groups](https://groups.google.com/g/beryldb).