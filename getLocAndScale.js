//Generate a histogram of speeds for given conditions

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
var minDist= nconf.get("mindistance");
var maxDist=nconf.get("maxdistance");
var going=nconf.get("going");
var code=nconf.get("code");
var surface=nconf.get("surface");

var minSpeed=0.0;
var maxSpeed=0.0;
var maxPermissibleSpeed=nconf.get("maxPermissibleSpeed");

var nbins=nconf.get("nbins");
var ceiling=nconf.get("ceiling")
var floor=nconf.get("floor");
var binwidth=(ceiling-floor) / nbins;

var loghorses=nconf.get('loghorses');
var horseid=nconf.get('horseid');

var hist=new Array(nbins);
for(var i=0; i< nbins;i++){
	hist[i]=0;
}

var maxHorseCount=0;
var maxHorseid;

var query={};

if(typeof horseid !== 'undefined'){
	query={_id:""+horseid}
}

//logger.info(JSON.stringify(query));

 MongoClient.connect("mongodb://" + databaseUrl,function(err,db){
    if(err) throw(err);
    db.collection('horses').find(query).forEach(function(horse){
    	var horseid=horse._id;
    	var horseCount=0;

    	var performances = horse.performances;
    	for(raceid in performances){
    		var perf=performances[raceid];
    		if(perf.distance >= minDist && perf.distance <= maxDist && perf.going == going && perf.surface==surface && perf.racetype==code){
    			if(perf.speed < maxPermissibleSpeed){
    				horseCount++;

	    			if(minSpeed == 0) minSpeed=perf.speed;
	    			if(maxSpeed == 0) maxSpeed=perf.speed;

	    			if(perf.speed > maxSpeed)maxSpeed=perf.speed;
	    			if(perf.speed < minSpeed)minSpeed=perf.speed;

	    			var index=Math.floor((perf.speed - floor) / ((ceiling - floor)/nbins));
	    			//console.log(perf.speed + " " + index);
	    			if(index > 99) index=99;
	    			hist[index]=hist[index]+1;
	    		}
    		}
    	}

    	if(maxHorseCount==0){
    		maxHorseCount=horseCount;
    		maxHorseid=horseid;
    		if(loghorses)logger.info(maxHorseid + " " + maxHorseCount);
    	}
    	if(horseCount > maxHorseCount){
    		maxHorseCount=horseCount;
    		maxHorseid=horseid;
    		if(loghorses)logger.info(maxHorseid + " " + maxHorseCount);
    	}
    	
    	
    },function(err){
    	if(err)logger.err(JSON.stringify(err));
    	else{
    		console.log("#" + minDist + "-" + maxDist + "m-" + going + "-" + code + "-" + surface + (typeof(horseid) != 'undefined'? "-" + horseid:""));
    		console.log("#minspeed " + minSpeed + " maxspeed " + maxSpeed);
    		console.log("#binwidth: " + binwidth);
    		for(var i=0;i<nbins; i++){
    			var speed = floor + (i * binwidth) + (binwidth/2);
    			console.log(speed.toFixed(2) + " " + hist[i]);
    		}
            var fname=minDist + "-" + maxDist + "m-" + going + "-" + code + "-" + surface + (typeof(horseid) != 'undefined'? "-" + horseid:"");
            console.log("#gnuplot -e \"set terminal png size 1200,400;set output '" + fname + ".png';set xtics rotate;plot '"+fname +".dat' using 2: xtic(1) with boxes\"");
            process.exit();
            
    	}
    });
    

    
   
  });

