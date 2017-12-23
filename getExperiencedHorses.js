
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
  
     "databaseurl"     :"mongodb://rpuser:tTY473%^@52.31.122.201/rpdata",
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




var MongoClient= require('mongodb').MongoClient;

MongoClient.connect(nconf.get('databaseurl'),function(err,db){
  if(err) throw(err);

  db.collection('horses').find({}).forEach(function(horse){
     console.log("horse: " + JSON.stringify(horse));

  });





});

/*var horseCursor=db.horses.find({});

doProcessOneHorse();

function doProcessOneHorse(){
   console.log("got one");
  horseCursor.next(function(err, horse) {
    console.log("horse: " + JSON.stringify(horse));
    if(err){
      logger.error(err);
    }
     if(horse){
      console.log("There's horse");
        var count=Object.keys(horse.performances).length;
     
        logger.info(horse.id + " " + count);
        //doProcessOneHorse();
      }
      else{
        process.exit();
      }
    });
  }
  */


