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

var Connection = require("./lib/server");

var Link = new Connection({
                      host  : "127.0.0.1",            
                      port  : 6378,           
                      login : "root",
                      password: "default"
}).connect({
     connected : function() 
     {
          console.log("Connected to BerylDB server: " + Link.host + ":" + Link.port);
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

module.exports = Link;
