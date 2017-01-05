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
     "raceids":["608242","637033","614602","610358","610755","616158","614153","612200","608241","610970","641302","615009","608421","609332","627447","608424","614623","611850","608327","613872","609614","637454","611877","610128","608326","610792","609425","629067","613892","611210","613326","608173","628612","628832","625422","613621","612439","610845","609711","610111","634899","633314","633914","632163","626500","624371","611712","609955","608194","606911","630267","627570","617511","611590","610741","609385","627963","625831","610271","634880","633756","633070","632190","630284","627940","626410","625147","624327","609582","607977","606905","635794","634042","632568","631284","630289","628897","625030","623095","633215","631567","627608","612728","611323","609977","608171","608023","606924","636351","635409","632637","631392","628961","626558","625183","622415","610006","608021","606898","634151","632117","630825","629444","628924","627916","627316","623686","607782","606960"]
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



logger.info("databaseUrl: " + databaseUrl);

var count=0;
 var goingsArray=[];
var betCursor=db.bets.find({rpraceid:{$exists:false}});
//var betCursor=db.bets.find();
var count=0;
betCursor.forEach(function(err,bet){
  count++;
  if(err){
    logger.error(err);
  }
  //logger.info("bet");
  if(bet !== null){
    var bet_id=bet._id;
    var venue=bet.venue;
    var offtime=new Date(bet.offtime);
    var offDate=moment(offtime).format('YYYY-MM-DD');
    var newDateOffDate=new Date(offDate);
   
    var hours = offtime.getHours();

    if(newDateOffDate.dst()){ //Daylight Saving Time
      hours-=1; //an hour earlier
    }
    
    if(hours > 12) hours -=12;
    var minutes = offtime.getMinutes();
    if(minutes < 10){
      minutes='0' + minutes;
    }

    var offtimetime=hours + ':' + minutes;
  // logger.info("venue: " + venue + " offtime: " + offtime + " offDate: " + offDate + "offtimetime " + offtimetime);
    //find the rprace
    var vS=new RegExp(offtimetime);
   // logger.info("vS: " + vS);
    //db.races.findOne({venue:venue,offtime:vS,date:moment(offDate).toISOString()},function(err,race){

      var newDateOffDate;
      var fn=function(bid){
          db.races.findOne({meeting:venue,offtime:vS,date:new Date(offDate)},function(err,race){
          if(err){
            logger.error(err);
          }
          if(race){
            //  logger.info("betid: " + bid)
            //logger.info(JSON.stringify(race));
            var rpraceid=race._id;
            db.bets.update({_id:db.ObjectId(bid)},{$set:{rpraceid:rpraceid}},function(err){
              logger.info("Update: " + bid);
              count--;
              if(count==0){
                process.exit();
              }
              //process.exit();
            });

          }
          else {
            logger.error("Race not found: " + bet_id + " " + venue + " " + vS + " " + new Date(offDate));
            count--;
            if(count==0){
                process.exit();
              }
          }
          
          
        })
      }(bet_id)
   // process.exit();

  }
  else{
    process.exit();
  }

})





