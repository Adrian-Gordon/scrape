/*This app gets assembles the data for a racecard in a form suitable for prediction - card data and past performance data*/
 gaussian=require('gaussian');
//nconf is used globally
nconf=require('nconf');

var execSync=require('child_process').execSync

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
  
    "databaseurl"     : "54.194.65.32/rpdata",
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
      "goingmappings":{"Firm":-3,"Good To Firm":-2,"Standard":-1,"Good":-1,"Good To Soft":0,"Good To Yielding":-1,"Standard To Slow":0,"Yielding":1,"Yielding To Soft":1,"Soft":1,"Soft To Heavy":2,"Heavy":3},
      "variables":['speed1','distance1','distance2','distancediff','weight1','weight2','weightdiff','going1','going2','goingdiff','type1','type2','typediff'],
       'functionSet':['+','-','*','/','^','if<='],
      "flatrule":["-","-","-","^",-2.2635,8.0547,"*",4.9096,"/","+",-8.7345,"*","distance2","goingdiff","-","if<=","weightdiff",-8.7345,"*",4.9096,"if<=",7.3357,"distancediff",-2.2635,"if<=",-1.4868,"weight2",-2.2635,"-","if<=","weightdiff","^","if<=",-1.4868,"weight2",-2.2635,"*","if<=","-","if<=","weightdiff","speed1","weight2","distance1","*",4.9096,"distancediff","weight2","distance1",7.3357,"distancediff",8.0547,"going1",7.3357,"-","+","if<=","*","+","+","if<=","distance1","/","^","if<=",-1.4868,"-","if<=","+",-1.4868,"weight2","weightdiff","speed1","weight1","^","^","distance1",-2.2635,"^","*","-",-2.7546,"distance1","/",2.5947,8.0547,"*","distance1","goingdiff",-2.2635,"/",2.3792,-3.4093,"speed1","+",-3.1683,"+","/",2.8033,"goingdiff","distance2",4.9096,"weight2","-","if<=","distance1","-","distancediff","*",4.9096,"/","-","^","-","if<=","distance1","going1","distance2","weight2","if<=","^","*","+","distance1","distance1","*","if<=",-0.0999,-2.5417,"goingdiff","distancediff","*","going1",-8.7345,"/","if<=",-1.4868,"weight2",-2.2635,"*","if<=","*",4.9096,"distancediff",-0.0999,"distancediff","distance2",-2.4760,"distance2","*","if<=",-2.2635,"goingdiff","going1","distancediff","*",8.0547,-8.7345,"+","^",-2.7546,-0.7124,"*",-2.2635,"goingdiff","weight2","/","going2","goingdiff","-","+","+","if<=","distance1","-","-","^","if<=",-1.4868,8.0547,-2.2635,"^",-2.2635,8.0547,8.0547,"+","if<=",-5.2669,-6.6087,"going1",-2.6198,"going2","distance2",4.9096,"weight2","-","if<=","distance1",-1.9041,-2.5417,"if<=","^","*","+","goingdiff","distance1","*","if<=",-0.0999,-2.5417,"going1","distancediff","*","going1","distance1","/","going2","goingdiff","*","if<=","distance2","weight2","going1","distancediff","distance2","+","^",-7.9920,8.0547,"distance1","-","-","^",-2.2635,8.0547,"if<=","distance1","going1","speed1","/","*","distance2","goingdiff","-","weight2","*",4.9096,-2.4760,"*",4.9096,"distancediff","if<=","^","*","+",-0.7124,"/","*","distance2","goingdiff","-","if<=","weightdiff","speed1","*","distance1","goingdiff",7.3357,"*","distancediff",-2.4760,"*","if<=",-0.0999,-2.5417,"going1","distancediff","*","going1","going1",-7.9920,"weight2","+","distancediff","*","distance2","goingdiff",-1.4868,-9.2846,"if<=","*",4.9096,"distancediff","distance1","distance1",-2.2635,"-","if<=","weightdiff","speed1","weight2",7.3357,"*",4.9096,-2.4760,-2.5417,"weight2","distance1",-9.2846,"distancediff","*",4.9096,"distance1","distancediff","distance2",-0.7124,"distance1","*",4.9096,-2.4760,"*","distancediff",-2.7546,"*",4.9096,"distancediff","*","distance1","goingdiff"],
      "jumpsrule":["+","+","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=",4.3861,"speed1","weightdiff",4.3859,"/",4.3861,"type2","*","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/",4.3861,"type2","*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-",6.3901,"/",-9.5462,0.1577,-9.6067,"distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,0.1577,4.3859,"/","distancediff","type2","*","*",-6.8748,"*",-9.6067,"going2",5.0496,"if<=","+",4.7778,-6.6693,"+",-8.6235,-0.6790,"+","weightdiff","going2","^","going2","*","distance1","distancediff","-","^",4.3861,-5.4509,"^",-4.4569,"distancediff","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"*","*",-3.7677,"*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-","/","-","/","-","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,"distancediff","^",-0.9028,-6.8748,-6.5566,"weight1","/",-9.5462,0.1577,-9.6067,"-","-",6.3901,-0.9028,-0.9028,"typediff","/",5.5662,"type2","*","distance1","distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/","^","goingdiff",7.4575,"type2","*","*",-6.8748,"if<=",4.3861,6.4425,"weightdiff",4.3859,"*","distance1","distancediff","if<=","+",4.7778,-6.6693,"+","-",6.3901,-0.9028,-0.6790,"+","weightdiff","going2","^","going2","*","distance1","distancediff","-","^",4.3861,-5.4509,"^",-4.4569,"distancediff","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"+","+","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=",4.3861,"speed1","weightdiff",4.3859,"/",4.3861,"type2","*","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/",4.3861,"type2","*",-8.6235,"*","if<=","goingdiff","going2","goingdiff",-8.6235,-9.6067,"distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/","distancediff","type2","*","*",-6.8748,"*",-9.6067,"going2","*","distance1","distancediff","if<=","+",4.7778,-6.6693,"+",-8.6235,"distancediff","+","weightdiff","going2","^","distancediff","*","distance1","distancediff","-","^",4.3861,-5.4509,"^",-4.4569,"distancediff","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"*","*",-3.7677,"*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-","/","-","/","-","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,"distancediff","^",-0.9028,-6.8748,-6.5566,"weight1","/",-9.5462,0.1577,-9.6067,"-","-",6.3901,-0.9028,-0.9028,"typediff","/",4.3861,"type2","*","distance1","distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/","^","goingdiff",7.4575,"type2","*","*",-6.8748,"if<=",4.3861,6.4425,"weightdiff",4.3859,"*","distance1","distancediff","if<=",4.3861,"speed1","weightdiff",4.3859,"-","^",4.3861,-5.4509,"^",-4.4569,"going2","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"*","*",-3.7677,"*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-","/","-","/","-",5.5662,"distancediff","^",-0.9028,-6.8748,-6.5566,"^",4.3861,-5.4509,"/",-9.5462,0.1577,-9.5462,"-","-",6.3901,-0.9028,-0.9028,"typediff","-",5.5662,"distancediff",-9.6067,"typediff","-",5.5662,"distancediff",-9.6067],
      "referencecount":20,//number of performances to be considered a 'reference' horse
      "distancepm": 10, //+- 10m
      "weightpm":0,    //+= 0lbs
      "nperfsforgaussian":100,
      "classpath":"/Users/adriangordon/Development/Gaussian/:/Users/adriangordon/Development/Gaussian/flanagan.jar:/Users/adriangordon/Development/Gaussian/json-20160212.jar",
      "montecarlotrials":100000,
      "gpnodepath":"../../Node/node.js"
});



var collections=["races","horses","cards","tomonitor"];
var databaseUrl=nconf.get("databaseurl");
var db = require("mongojs").connect(databaseUrl, collections);
var gpnode=require(nconf.get("gpnodepath"));





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


var moment=require('moment');


var host=nconf.get("host");
var port=nconf.get("port");

var runners=new Array(100);
var winners=new Array(100);
var probs=new Array(100);
for(var i=0;i<100;i++){
  runners[i]=0;
  winners[i]=0;
  probs[i]=0.0
}


var request = require('request');

var url="http://" + nconf.get("host") + ":" + nconf.get("port") + "/betsreport?market=WIN&bettype=BACK&code=FLAT";

request(url, function(err,resp,body){
  var bets=JSON.parse(resp.body);
  for(var i=0;i<bets.length;i++){

    var bet=bets[i];

    var prob=bet.probability;
    var index=Math.floor(bet.probability *100);
    logger.info("prob: " + prob + " index: " + index);

    runners[index]=runners[index]+1;
    if(bet.actualReturn > 0){
      winners[index]=winners[index]+1;
    }

  }
  for(var i=0;i< 100;i++){
    probs[i]=winners[i]/runners[i];
  }
  console.log(JSON.stringify(runners));
  console.log(JSON.stringify(winners));
  console.log(JSON.stringify(probs));
});

