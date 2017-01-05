//nconf is used globally
nconf=require('nconf');

//favour environment variables and command line arguments
nconf.env().argv();

//if 'conf' environment variable or command line argument is provided, load 
//the configuration JSON file provided as the value
if(path=nconf.get('conf')){
  //logger.info("use file: " + path);
  nconf.file({file:path});
 
}

nconf.defaults(
{
  
    "databaseurl"     : "54.154.22.54/rpdata",
    "logging":{
        "fileandline":true,
        "logger":{
           "console":{
            "level":"info",
            "colorize":true,
            "label":"scrape",
            "timestamp":true
            }
          }

     },
     "startdate":"2015-06-13",
     "host":"localhost",
     "port":"3000",
     "nhorses":100,
     "startid": 866318
    
  
});

//866691

//configure logging
var winston=require('winston');
var loggingConfig=nconf.get('logging');


var fileAndLine=loggingConfig.fileandline;



Object.keys(loggingConfig).forEach(function(key){
   
    if(key!= "fileandline")winston.loggers.add(key,loggingConfig[key]);

});

//logger is used globally

logger=require('winston').loggers.get('logger');
logger.exitOnError=false;

if(fileAndLine){
  var logger_info_old=logger.info;
  logger.info=function(msg){
    var fandl=traceCaller(1);
    return(logger_info_old.call(this,fandl + " " + msg));
  }


  var logger_error_old=logger.error;
  logger.error=function(msg){
    var fandl=traceCaller(1);
    return(logger_error_old.call(this,fandl + " " + msg));
  }
 
}

function traceCaller(n) {
    if( isNaN(n) || n<0) n=1;
    n+=1;
    var s = (new Error()).stack
      , a=s.indexOf('\n',5);
    while(n--) {
      a=s.indexOf('\n',a+1);
      if( a<0 ) { a=s.lastIndexOf('\n',s.length); break;}
    }
    b=s.indexOf('\n',a+1); if( b<0 ) b=s.length;
    a=Math.max(s.lastIndexOf(' ',b), s.lastIndexOf('/',b));
    b=s.lastIndexOf(':',b);
    s=s.substring(a+1,b);
    return s;
  }

//end logging config

//logger.info("databaseUrl: " + databaseUrl);




var startid=nconf.get("startid");
var host=nconf.get("host");
var port=nconf.get("port");
var nhorses=nconf.get('nhorses');
var count=0;



var request = require('request');


var racesProcessed=[];

while(count < nhorses){

  var datesUrl= "http://" + host + ":" + port + "/gethorseraces?horseid="+startid--;

 var srequest=require('sync-request');


  var dateResp=srequest('GET',datesUrl);
  var body=dateResp.getBody();
  var races=JSON.parse(body);
  //logger.info(body);

  for(var i=0;i<races.length;i++){
    var race= races[i];
    //logger.info(date);
    if(racesProcessed.indexOf(race)==-1){
      racesProcessed.push(race);
       count++;
       logger.info(count);
    }
  }
 
 


}

 logger.info("horseid: " + startid);

logger.info(JSON.stringify(racesProcessed));











