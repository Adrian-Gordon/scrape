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
     "ndates":10,
     "startid": 866691
    
  
});



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
var ndates=nconf.get('ndates');
var count=0;



var request = require('request');


var datesProcessed=[];

while(count < ndates){

  var datesUrl= "http://" + host + ":" + port + "/gethorsedates?horseid="+startid--;

 var srequest=require('sync-request');


  var dateResp=srequest('GET',datesUrl);
  var body=dateResp.getBody();
  var dates=JSON.parse(body);
  //logger.info(body);

  for(var i=0;i<dates.length;i++){
    var date= dates[i];
    //logger.info(date);
    if(datesProcessed.indexOf(date)==-1){
      datesProcessed.push(date);
       count++;
       logger.info(count);
    }
  }
 


}

logger.info(JSON.stringify(datesProcessed));











