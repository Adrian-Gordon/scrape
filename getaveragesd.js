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
  
    "databaseurl"     : "52.31.122.201/rpdata",
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
        });



var collections=["races","horses","trainingset","bets"];
var databaseUrl=nconf.get("databaseurl");
var db = require("mongojs").connect(databaseUrl, collections);
var goingMappings={"Firm":-3,"Good To Firm":-2,"Standard":-1,"Good":-1,"Good To Soft":0,"Good To Yielding":-1,"Standard To Slow":0,"Yielding":1,"Yielding To Soft":1,"Soft":1,"Soft To Heavy":2,"Heavy":3,"Very Soft":3}





//configure logging
var winston=require('winston');
var loggingConfig=nconf.get('logging');
var moment=require('moment');


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

Date.prototype.stdTimezoneOffset = function() {
var jan = new Date(this.getFullYear(), 0, 1);
var jul = new Date(this.getFullYear(), 6, 1);
return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dst = function() {
return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

var host=nconf.get("host");
var port=nconf.get("port");




var request = require('request');

//logger.info("databaseUrl: " + databaseUrl);

//db.bets.findOne({rpraceid:{$exists:true},horseids:{$exists:false}}, function(err,bet){
//  count++;
//  applyHorseIds(bet);
//})


/*

var betCursor=db.bets.find({rpraceid:{$exists:true},horseids:{$exists:false}},{limit:2000});
//var betCursor=db.bets.find();
var count=0;
betCursor.forEach(function(err,bet){
  setTimeout(function(){
    count++;
    if(err){
      logger.error(err);
    }
   
    //logger.info("bet");
    if(bet !== null){
      
        applyHorseIds(bet);
     
       
    }
   // else{
    //  process.exit();
    //}

  },20000)
    
}
);
*/

var betCursor=db.bets.find({rpraceid:{$exists:true},horseids:{$exists:true},marketType:'WIN',racetype:'FLAT'});

doProcessOne();

function doProcessOne(){
  betCursor.next(function(err, bet) {
     if(bet){
      getHorseSD(bet);
    }
    else{
      process.exit();
    }

  })

 
}


function getHorseSD(bet){
  var horses=bet.horses;
  for(var horse in horses){
    var horseData=horses[horse];
    var mean=horseData.gaussianDistribution.mean;
    var sd=horseData.gaussianDistribution.standardDeviation;
    var sdOverMean=sd/mean;
    console.log(sdOverMean);
  }
  doProcessOne();

}

function applyHorseIds(bet){
  logger.info("Update bet: " + bet._id);
  var rpRaceid=bet.rpraceid;
  var horses=bet.horses;
  if(rpRaceid && horses){
    //get the rp result
    var url="http://" + nconf.get("host") + ":" + nconf.get("port") + "/getraceresult?raceid=" + rpRaceid ;
    request(url, function(err,resp,body){
      if(err){
        logger.error(JSON.stringify(err));
        doProcessOne();

      }
      else{
        var res=JSON.parse(resp.body);
        if(res.status=='ERROR'){
          logger.error(JSON.stringify(res));
          doProcessOne();
        }
        else{
         // logger.info(JSON.stringify(res));
          var horseMissing=false;
          var rpHorses=res.horses;
          for(var rpHorseid in rpHorses){
            var rpHorseName=rpHorses[rpHorseid].name;
            //logger.info(rpHorseid + " " + rpHorses[rpHorseid].name);
            rpHorseName=rpHorseName.replace(/'/g,'´');
            if(horses[rpHorseName]){
              horses[rpHorseName].rphorseid=rpHorseid;
            }
            else{
              logger.error("horsename: " + rpHorseName + " not found in " + bet._id);
              horseMissing=true;
            }
          }

          //logger.info(JSON.stringify(horses));

          if(!horseMissing){
          //now the db update
          db.bets.update({_id:db.ObjectId(bet._id)},{$set:{horses:horses,horseids:true}},function(err){
              doProcessOne();
            });
          }
          else{
            doProcessOne();
          }

          

        }
      }
     

    });

  }

}






