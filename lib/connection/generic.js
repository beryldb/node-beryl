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

var net  	= require("net");
var Protocol    = require('./protocol');

var ServerLink = function(mode, options) 
{
      this.host			  =      null;
      this.port			  =	 null;
      
      if (typeof options !== "object") 
      {
            throw new Error("Invalid or missing options");
      }
      
      if (typeof options.port !== "number" || options.port < 0 || options.port > 65535) 
      {
           throw new Error("Invalid or missing options.port (because options.host is set)");
      }
      
      var SendQueueMaxSizeDefault   =    500;
      
      this.__options                = 
      {
               host     : (options.host || null),
               port     : (options.port || null),
               login    : (options.login || null),
               password : (options.password || null),
               
               SendQueueMaxSize : (typeof options.SendQueueMaxSize === "number" ? options.SendQueueMaxSize : SendQueueMaxSizeDefault)
      };
      
      this.Client          	    =    null;
      this.stacking	     	    =    [];
      this.stack	     	    =    false;
      this.ran			    =    [];
      this.running		    =    false;
      this.lasterq	            =    null;
      this.Quitting       	    =    false;
      this.LastError       	    =    null;
      this.RetryTimeOut    	    =    null;
      
      this.PendingFlush             =    [];
      this.FlushPending             =    {};
      this.EventsCallBacks  	    =    {};
      this.OfflineStack    	    =    [];
      
      this.UnsafePatterns = [
         [/\\/g, '\\\\'],
         [/\n/g, '\\n'],
         [/"/g,  '\\"']
      ];
}

ServerLink.prototype.connect = function(handlers) 
{
     var self = this;
     handlers = Object.assign({}, self.ConnectHandlers, handlers);

     if (self.RetryTimeOut !== null) 
     {
          clearTimeout(self.RetryTimeOut);
          self.RetryTimeOut = null;
     }

     if (self.Client === null) 
     {
          var isConnected = false;
          
          self.ConnectHandlers = 
          {
               connected    : handlers.connected,
               disconnected : handlers.disconnected,
               timeout      : handlers.timeout,
               retrying     : handlers.retrying,
               error        : handlers.error
         };
         
         try
         {
              var client = new net.Socket();
              client.setNoDelay(true);
              client.setTimeout(60000);              
              var data_buffer = "";
              
              client.connect(
              {
                    port : self.__options.port,
                    host : self.__options.host
              },

              function() 
              {
                    self.host = self.__options.host;
                    self.port = self.__options.port;
                    
                    isConnected = true        
                    self.LastError = null;                  
                    self.Send(("ilogin js1 " + self.__options.password + " " + self.__options.login), undefined, client);
              });
             
              client.on("data", function(data) 
              {
                    if (data)
                    {
                          data_buffer += data.toString();                   
                          
                          if (data_buffer.length > 0  && data_buffer[data_buffer.length - 1] === "\n") 
                          {
                               var lines = data_buffer.trim().split("\n");
                               data_buffer = "";                              
                               
                               for (var i = 0; i < lines.length; i++) 
                               {
                                     var line = lines[i].trim();                                 
                                     
                                     if (line) 
                                     {
                                          self.HandleDataLine.bind(self)(client, line);
                                     }
                               }
                          }                           
                    }
              });
             
              client.on("timeout", function() 
              { 
                    client.end();
                    self.ConnectHandler("timeout");
              });
             
              client.on("error", function(error) 
              {
                    self.LastError = (error || null);
                    
                    if (isConnected === false) 
                    {
                         client.destroy();
                         self.ConnectHandler("error", error);
                    }
              });

              client.on("close", function() 
              {
                       client.destroy();             
                 
                       if (self.Quitting === true) 
                       {
                           self.PopCallBack("quit");
                       }
                       
                       var orphanCallbacks = [].concat(
                            [self.FlushPending.callback],

                            self.PendingFlush.map(function(item) 
                            {
                                 return item[1];
                            }),

                            Object.values(self.EventsCallBacks)
                       );
          
                       self.PendingFlush       =   [];
                       self.EventsCallBacks    =   {};

                       delete self.FlushPending.callback;
                       
                       self.ConnectHandler("disconnected", (self.LastError || null));

               	   self.HandleDisconnected.bind(self)();
                       self.LastError = null;
              });                                                   
         }      
         catch (error) 
         {      
             console.log(error);
         }
     } 
     else
     {
          self.ConnectHandler("connected");
     }
     
     return self;       
};

ServerLink.prototype.RemoveUnsafeCommandText = function(text) 
{
      text = (text || "");

      for (var i = 0; i < this.UnsafePatterns.length; i++) 
      {
           var pattern = this.UnsafePatterns[i];
           text = text.replace(pattern[0], pattern[1]);
      }

      return text;
};

ServerLink.prototype.Send = function(command, done, client) 
{
        if (this.FlushPending.callback === undefined) 
        {
               this.SocketSend(command, done, client);
        }
        else
        {
               if (this.PendingFlush.length > this.__options.SendQueueMaxSize) 
               {
                    (client || this.Client).destroy(new Error("full: " + this.__options.SendQueueMaxSize + " entries)"));
               }
               else
               {
                    this.PendingFlush.push([command, done]);
               }
        }
};


ServerLink.prototype.SocketSend = function(command, done, client) 
{
        if (this.FlushPending.callback !== undefined) 
        {
             throw new Error("Trying to send command on socket, but last command response not handled");
        }
        
        if (this.Client !== null || client) 
        {
               (client || this.Client).write(command + "\n");
        }
        
        if (typeof done !== "function") 
        {
            done = null;
        }

        this.FlushPending.callback = done;
}

ServerLink.prototype.PopCallBack = function(data, error, execute) 
{
        data = (data === undefined ? null : data);
        error = (error === undefined ? null : error);

        var callback = this.FlushPending.callback;

        if (this.running)
        {
              this.ran.push({ data: data, error: error });
              return;
        }

        delete this.FlushPending.callback;

        this.PopNext();

        if (callback !== undefined) 
        {
             if (execute !== false && typeof callback === "function") 
             {
                  callback(data, error);
             }

             return (callback || null);
        }

        return undefined;
};

ServerLink.prototype.SetPromise = function(fn_operation) 
{
        var self = this;

        return new Promise(function(resolve, reject) 
        {
                fn_operation.call(self, function(data, error) 
                {
                      if (error) 
                      {
                           return reject(error);
                      }
                      
                      return resolve(data);
                });        
        });        
};

ServerLink.prototype.HandleDataLine_ended = function(client, argument) 
{
      this.PopCallBack(argument);
      client.destroy();
};

function LoopDel(loops, data)
{
      for (var i = 0; i < loops; i++)
       {
             data.shift();
       }

       return data.join(" ");
}

ServerLink.prototype.HandleDataLine = function(client, line) 
{
        var match = line.match(this.__responsePattern);
        var words = line.split(" ");        

        /* PING request */ 
        
        if (words[0] == 110)
        {
              var handler = this["HandleDataLine_pong"];        
              handler.bind(this)(client, match);
              return;
        }

        if (match && words[1]) 
        {
              var handler = this["HandleDataLine_" + words[1].toLowerCase()];        

              if (typeof handler === "function") 
              {
                   handler.bind(this)(client, match);
              } 
              else 
              {
                   switch (parseInt(words[1]))
                   {
                          case Protocol.BRLD_OK2:
                          
                              this.PopCallBack(LoopDel(4, words).join(" ").substring(1));
                              return;
                          
                          break;

                          case Protocol.BRLD_MULTI_START:
                              
                              this.running	=	true;
                              this.ran 		= 	[];
                              return;
                              
                          break;
                          
                          case Protocol.BRLD_MULTI_STOP:
                            
                             this.running 	= 	false;
                             
                             this.PopCallBack(this.ran);
                             this.ran 	  	=	[];
                             return;
                             
                          break;
                          
                          case Protocol.BRLD_QUEUED:
                          
                             this.PopCallBack("QUEUED");
                             return;
                          
                          break;
                          
                          case Protocol.BRLD_OK:
                              
                              this.PopCallBack(LoopDel(3, words).substring(1));
                              return;
                          
                          break;
                          
                          case Protocol.ERR_INPUT:
                               
                              var error = { code: words[1], message: LoopDel(3, words).substring(1)};

                              this.PopCallBack(null, error);
                              return;
                                             
                          break;
                          
                          case Protocol.ERR_INPUT2:

                              var error = { code: words[1], message: LoopDel(4, words).substring(1)};
                          
                              this.PopCallBack(null, error);
                              return;
                                             
                          break;
                          
                          case Protocol.ERR_INPUT3:
                           
                              return;

                          break;
                          
                          case Protocol.BRLD_ITEM_LIST:
                    
                              if (this.stack == true)
                              {
                                   this.stacking.push(LoopDel(3, words).substring(1));
                                   return;
                              }                          
                             
                          break;
                          
                          case Protocol.BRLD_START_LIST:
                          
                              this.stack = true;
                              return;
                             
                          break;
                          
                          case Protocol.BRLD_END_LIST:
                              
                              this.stack = false;
                              this.PopCallBack(this.stacking);
                              this.stacking = [];
                              return;
                              
                          break;
                          
                          default:
                               return;                          
                   }
                   
                  //this.PopCallBack(words.join(" ").substring(2).slice(0, -1));
              }
        } 
        else 
        {
             throw new Error("Handled invalid data line");
        }
};

ServerLink.prototype.HandleDisconnected = function() 
{
       var self 	         =    this;
       self.Client           =    null;
       self.__environment    =    {};
     
       if (self.Quitting !== true && self.RetryTimeOut === null) 
       {
            self.RetryTimeOut = setTimeout(function() 
            { 
                 self.RetryTimeOut = null;
                 self.ConnectHandler("retrying");

                 self.connect({error : function() 
                 {
                     self.HandleDisconnected();
                 }});
           
            }, 2000);
       }

       self.Quitting = false;
};

ServerLink.prototype.__handleConnected = function(client) 
{
     var self = this;
     
     if (self.Client === null) 
     {
           self.Client = client;     
           
           if (self.OfflineStack.length > 0) 
           {
                    setTimeout(function() 
                    {
                         while (self.OfflineStack.length > 0) 
                         {
                              self.Execute.apply(self, self.OfflineStack.shift());
                         }
               }, 500);
           }     
     }
 
     self.ConnectHandler("connected");
};

ServerLink.prototype.HandleDataLine_pong = function(done)
{
       self.Send("PONG :1", undefined);
       this.PopCallBack(null);
};

ServerLink.prototype.HandleDataLine_108 = function(client, argument)
{
       this.PopCallBack(argument);
       this.__handleConnected(client);
};

ServerLink.prototype.ConnectHandler = function(type, data) 
{
       if (typeof this.ConnectHandlers[type] === "function") 
       {
            this.ConnectHandlers[type](data);
       }
};

ServerLink.prototype.Defer = function(operation, args) 
{
       if (this.OfflineStack.length > this.__options.offlineStackMaxSize) 
       {
           throw new Error("Error" + this.__options.offlineStackMaxSize + " entries)");
       }

       this.OfflineStack.push([operation, (args || [])]);
};

ServerLink.prototype.Schedule = function(operation, args) 
{
       this.lastreq = operation;

       if (this.Client !== null) 
       {
            this.Execute(operation, args);
            return true;
       }

       this.Defer(operation, args);
       return false;
};

ServerLink.prototype.PopNext = function() 
{
       var nextEmit = this.PendingFlush.shift();

       if (nextEmit !== undefined) 
       {
            this.SocketSend(nextEmit[0], nextEmit[1]);
       }
};

ServerLink.prototype.Execute = function(operation, args) 
{
      this["_operation_$" + operation].apply(this, (args || []));
};

ServerLink.prototype.HandleDataLine_err = function(client, argument)
{
      var match = argument.match(this.__errorReasonPattern);
      var error = {};
      
      if (match && match[1]) 
      {
               error.code    = match[1];
               error.message = (match[2] || "");
      } 
      else 
      {
               error.code    = "unexpected_error";
               error.message = (argument || "");
      }

      this.PopCallBack(null, error);
};

exports.ServerLink = ServerLink;
