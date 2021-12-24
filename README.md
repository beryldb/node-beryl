<p align="center">
  <img src="https://static.beryl.dev/smaller.png">
</p>

# node-beryl, a Node.js driver for BerylDB.

[![Mailing List](https://img.shields.io/badge/email-google%20groups-4285F4 "beryldb@googlegroups.com")](https://groups.google.com/g/beryldb)
[![Twitter](https://img.shields.io/twitter/follow/beryldb?color=%23179CF0&logo=twitter&style=flat-square "@beryldb on Twitter")](https://twitter.com/beryldb)
[![Discord Server](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/23f6w9sgAd)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
<br>


If you want to learn more about BerylDB and how to install it, feel free to check our
documentation at [docs.beryl.dev](https://docs.beryl.dev/).<br>
Follow us on [Twitter](https://twitter.com/beryldb).

## QuickStart

The quick start guide will show you how to set up a simple application using
BerylDB's Node.js driver.

It scope is only how to set up the driver and perform the simple operations.
For more advanced coverage, we encourage reading our tutorial.

## Installation

The recommended way to get started using the Node.js 4.x driver is by using the npm (Node Package Manager) to install
node-beryl in your project.

First, you need to create your own project:

```bash
$ mkdir new-project
$ npm init
```

After you've created your own project, you can either download this driver
or use npm:

```bash
$ npm i beryldb
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

Check BerylDB's [full list of commands](https://docs.beryl.dev/commands/)

## Querying

Let's look at an example exercising all the different available operations

We define a key **``hello``** with value **world**

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

We set a map **``a``** with value **b**

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

## Querying for lists

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

## Join our community 👋

We invite people from different backgrounds 🌈👨❤️ 

If you are just getting started as programmer, there are several ways that you can
collaborate. There is no need to be a senior programmer. At BerylDB, we
are problem solvers and welcome people having this vision 👍

### How do I get involved?
 
 - 🎓 Check our pending issues, or create your own.
 - 🌵 Contribute to our Drivers ([Node.js](https://github.com/beryldb/node-beryl), [PHP](https://github.com/beryldb/php-beryl), [Python](https://github.com/beryldb/python-beryl)).
 - 🙋 Become a QA: Test our software and report back ([Check our Google group](https://groups.google.com/g/beryldb)).
 - 💬 Get to know our team and join our [Discord server](https://discord.gg/23f6w9sgAd).

## External Links

* [Documentation](https://docs.beryl.dev)
* [GitHub](https://github.com/beryldb/beryldb)
* [Support/Discord](https://discord.gg/23f6w9sgAd)
* [Twitter](https://twitter.com/beryldb)
