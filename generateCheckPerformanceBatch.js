//Output all  speeds for given conditions

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
    "databaseurl"     : "52.31.122.201/rpdata",
    "going"			:"Standard",
    "surface"	    :"AW",
    "code"			:"FLAT",
    "mindistance" : 1600,
    "maxdistance" : 1620,
    "maxPermissibleSpeed": 100,
    "nbins" : 50,
    "ceiling": 18,
    "floor": 11,
    "loghorses": false
})




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

var MongoClient= require('mongodb').MongoClient;

var databaseUrl =  nconf.get("databaseurl");

//logger.info(JSON.stringify(query));

 MongoClient.connect("mongodb://" + databaseUrl,function(err,db){
    if(err) throw(err);
    db.collection('perfstocheck').find({message:{$exists:false}}).forEach(function(perf){
    	
      console.log("sudo node /home/ubuntu/GP/data/scrape-develop/checkperformance --conf /home/ubuntu/GP/data/scrapeconfig.json --raceid=" + perf.raceid + " --runnerid=" + perf.runnerid + " > /home/ubuntu/GP/data/checkperfs.txt");
      console.log("sleep1");
    	
    	
    	
    },function(err){
    	if(err)logger.err(JSON.stringify(err));
    	else{
    		//console.log(minSpeed + " " + maxSpeed);
    		process.exit();
    	}
    });
    

    
   
  });

