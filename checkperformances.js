
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
     "processtimeout":1800000 //half an hour
});


var moment=require('moment');

var collections=["races","horses","cards","perfstocheck"];
var databaseUrl=nconf.get("databaseurl");
var db = require("mongojs").connect(databaseUrl, collections);



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





var host=nconf.get("host");
var port=nconf.get("port");




var request = require('request');
var srequest=require('sync-request');


function processOnePerformance(){

  db.perfstocheck.findOne({},function(err,perf){
    if(perf){
      var id=perf._id;
      var horseid=perf.runnerid;
      var raceid=perf.raceid;
     // logger.info('check ' + horseid + " " + raceid);

      //now go check the performance
      var fn = function(hid,rid,pid){
          db.horses.findOne({_id:horseid},function(err,horse){
            if(!horse){
              logger.info("horse not there: " + hid);

              var url="http://" + nconf.get("host") + ":" + nconf.get("port") + "/getraceresult?raceid=" + rid + "&adddata=true";
              request(url, function(err,resp,body){
                if(err){
                  logger.error(JSON.stringify(err));
                }
                else{
                  try{
                    var res=JSON.parse(resp.body);
                    if(res.status=='ERROR'){
                      logger.error(JSON.stringify(res));
                    }
                  }catch(err){
                    logger.error("error: " + err + " url: " + url);
                  }
                  
                }
                db.perfstocheck.remove({_id:id},function(err){

                    processOnePerformance();//get the next one
                })

              });

            }
            else{
              var horsePerfs=horse.performances;
              //logger.info("horsePers: " + JSON.stringify(horse));
              var thisPerf=horsePerfs[rid];

              if(typeof thisPerf=='undefined'){
                logger.info("horse perf not there: " + hid + " " + rid);
                var url="http://" + nconf.get("host") + ":" + nconf.get("port") + "/getraceresult?raceid=" + rid + "&adddata=true";
                request(url, function(err,resp,body){
                  if(err){
                    logger.error(JSON.stringify(err));
                  }
                  else{
                    try{
                      var res=JSON.parse(resp.body);
                      if(res.status=='ERROR'){
                        logger.error(JSON.stringify(res));
                      }
                    }
                    catch(err){
                       logger.error(JSON.stringify(err));
                    }
                    
                  }
                  db.perfstocheck.remove({_id:id},function(err){

                      processOnePerformance();//get the next one
                  })

                });
              }
              else{
                 db.perfstocheck.remove({_id:id},function(err){

                    processOnePerformance();//get the next one
                })
              }

            }

           
          });


      }(horseid,raceid,id);
      


    
    }
    else{
      process.exit();
    }


  })
}


processOnePerformance();

/*
var perfs=db.perfstocheck.find({});

var count=0;


perfs.forEach(function (err, doc) {
  count++;
  logger.info("check: " + JSON.stringify(doc));

  var horseid=doc.runnerid;
  var raceid=doc.raceid;
  //get the horseRecord
  db.horses.find(_id:horseid, function(err,horse){
    count--;
    if(count==0){
      process.exit();
    }

  }

  //count--;
 // if(count==0){
  //  process.exit();
 // }
})
*/

