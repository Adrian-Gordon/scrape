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
  
    "databaseurl"     : "dimplecds.com/rpdata",
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

//var betCursor=db.bets.find({rpraceid:{$exists:true},horseids:{$exists:false}});
//var betCursor=db.bets.find({rpraceid:{$exists:true},_id:ObjectId("56e84e1d084b8d8d646d859f")});
//var betCursor=db.bets.find({rpraceid:'644585'});
var betCursor=db.bets.find({rpraceid:{$exists:true},horseids:false});
doProcessOne();

function doProcessOne(){
  betCursor.next(function(err, bet) {
     if(bet){
      applyHorseIds(bet);
    }
    else{
      process.exit();
    }

  })

 /* db.bets.findOne({rpraceid:{$exists:true},horseids:{$exists:false}},function(err,bet){
    if(bet){
      applyHorseIds(bet);
    }
    else{
      process.exit();
    }

  });*/
}

function applyHorseIds(bet){
  logger.info("Update bet: " + bet._id);
 // logger.info(JSON.stringify(bet));
  var rpRaceid=bet.rpraceid;
  var horses=bet.horses;
  if(rpRaceid && horses){
    //get the rp result
    var url="http://" + nconf.get("host") + ":" + nconf.get("port") + "/getraceresult?raceid=" + rpRaceid ;
    //logger.info("url: " + url);
    request(url, function(err,resp,body){
      if(err){
        logger.error(JSON.stringify(err));
        doProcessOne();

      }
      else{
       
        var res;
        try{
          res=JSON.parse(resp.body);
        
        
        }catch(exception){
          logger.error(JSON.stringify(exception) + 'at: ' + url);
          doProcessOne();
          return;
        }
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

/*
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

*/





