
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
  
    "databaseurl"     : "rpuser:tTY473%^@dimplecds.com/rpdata",
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
     "host":"localhost",
     "port":"3000",
     "processtimeout":1800000 //half an hour
});


var moment=require('moment');

var rpCollections=["races","horses","perfstocheck"];
var rpDatabaseUrl=nconf.get("databaseurl");
var rpdb=require("mongojs").connect(rpDatabaseUrl, rpCollections);



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


//get the races on this date

rpdb.races.find({date:new Date(nconf.get("date"))},function(err,races){
    var meetings={};
    //iterate over the dates
    for(var i=0;i<races.length;i++){
      var race=races[i];
      var meeting=race.meeting;
      var racetype=race.racetype;
      if(typeof meetings[meeting]=='undefined'){
        meetings[meeting]={};
        meetings[meeting][racetype]='present';
      }
      else if(typeof meetings[meeting][racetype]=='undefined'){
        meetings[meeting][racetype]='present';
      }
      //logger.info("race: " + JSON.stringify(race));
    }
   // logger.info(JSON.stringify(meetings));
    for(m in meetings){
      var meeting=meetings[m];
      if((meeting["FLAT"]=='present')&&(meeting["CHASE"]=='present' ||meeting["HURDLE"]=='present')){
        console.log("node scrape/updateToNHFlat --date=" + nconf.get("date") +" --meeting=" + m);
      }
    }

    process.exit();

})

/*var dateCursor=rpdb.races.find({date:nconf.get("date")});

doProcessOneDate();

function doProcessOneDate(){
   
  horseCursor.next(function(err, horse) {
     if(horse){
         // logger.info(JSON.stringify(horse));
          var performances=horse.performances;

          for(raceid in performances){
                var perf=performances[raceid];
                if((perf.position == 1) &&(perf.speed < 10.0)){
                  logger.info(horse ._id + " " + JSON.stringify(perf));
                   rpdb.perfstocheck.insert({runnerid:horse._id,raceid:raceid,raceurl:perf.resulturl,replace:true},function(err){
                       //process.exit();
                   });
                }
            }

          setTimeout( doProcessOneHorse, 0);
        }
        else{
          process.exit();
        }

        
      
      
    });
  }*/


