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

//var cursor = db.getCollection('races').find({racetype:'FLAT',iscomplete:{$exists:false}},{_id:1}).sort({date:-1}).limit(100);
//while(cursor.hasNext()) {
//    print("\"" + cursor.next()._id + "\",");
//}

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
     "host":"localhost",
     "port":"3000",
     "raceids":[]
      });



var collections=["races","horses","perfstocheck"];
var databaseUrl=nconf.get("databaseurl");
var db = require("mongojs").connect(databaseUrl, collections);


var raceid=nconf.get("raceid");



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



processRaceData(''+raceid);



var count=0;

function processRaceData(raceid){
	db.races.findOne({_id:raceid},function(err,race){
      if(err){
        logger.error(JSON.stringify(err));
      }
      else{
      	logger.info(JSON.stringify(race));
      	if((typeof race.iscomplete != 'undefined') && (race.iscomplete==true)){
      		logger.info("Race: " + raceid + " is Complete");
           process.exit();
      	}
      	else{

      		//mark the race as complete
      		db.races.update({"_id": raceid},{$set:{iscomplete:true}});

	      	var horseids=race.runners;
          var count=horseids.length;
	      	for(var i=0;i<horseids.length;i++){
	      		var runnerid=horseids[i];
	      		//logger.info("raceid: " + raceid + " runnerid: " + runnerid);
	      		var horseUrl="http://" + host + ":" + port + "/gethorseraces?horseid="+runnerid;
	      		//logger.info("url: " + horseUrl);
	      		var fn = function(hid){
					request({url:horseUrl},function(error,response,body){
            count--;

            try{
  						var horseraces=JSON.parse(body);
  						//logger.info(hid + " races: " + JSON.stringify(horseraces));

  						for(var j=0;j<horseraces.length;j++){
  							var hraceid=horseraces[j];
  							var tocheck={
  								runnerid:hid,
  								raceid:hraceid
  							}
  							//logger.info("insert in perfstocheck: " + JSON.stringify(tocheck));
  							 db.perfstocheck.insert(tocheck);
              }
  					}catch(err){
                logger.error("parse error: " + err.message + " when parsing " + body + " for horse " + hid);
                process.exit();
              }

              if(count==0){
                //mark the race as complete
                db.races.update({"_id": raceid},{$set:{iscomplete:true}},function(){
                  //wait 2 seconds in the hope that all db manipulations will have completed
                  setTimeout(function(){
                   process.exit();
                  },2000);
                });
               
              }
            

					});
				}(runnerid);

	      	}
	      }

      }});


}


