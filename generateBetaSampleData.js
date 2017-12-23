/*This app  assembles the data for a race in a form suitable for prediction - race data and past performance data*/
/*gets data from the races collection, using BF Past data for the Bets*/
/*Uses a Beta distribution to estimate probabilities*/


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
      "gpnodepath":"../../Node/node.js",
      "alpha":4,
      "beta":2
});



var collections=["races","horses","cards","tomonitor","spbets"];
var databaseUrl=nconf.get("databaseurl");
var db = require("mongojs").connect(databaseUrl, collections);
var gpnode=require(nconf.get("gpnodepath"));

var databaseUrl2=nconf.get("databaseurl2");
var collections2=["bfraces"];
var db2= require("mongojs").connect(databaseUrl2, collections2);






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




var request = require('request');
var srequest=require('sync-request');

//logger.info("raceid: " + nconf.get("raceid").toString() + (typeof nconf.get("raceid")));
generateBetaSampleData(nconf.get("horseid").toString(),predict);


function generateBetaSampleData(thehorseid,callback){
  var horsePredictObject={

    performances:[],
    predictions:[]
  }

  db.horses.findOne({_id:thehorseid},function(err,horse){
    if(err){
      logger.error(JSON.stringify(err));
    }
    else{
      var performances=horse.performances;
      var latest=null;
      var latestid=null;

      for(raceid in performances){
          var perf=performances[raceid];
          if(latest==null){
            latest=perf.date;
            latestid=raceid;
          }
          else if(perf.date > latest){
            latest=perf.date;
            latestid=raceid;
          }
              
      }

      var target=performances[raceid];

      for(raceid in performances){
          var perf=performances[raceid];
          var raceRaceType=1;
          if(target.racetype=='HURDLE'){
            raceRaceType=1
          }
          else if(target.racetype=='CHASE'){
             raceRaceType=2
          }

          var perfRaceType=1;
          if(perf.racetype=='HURDLE'){
            perfRaceType=1
          }
          else if(perf.racetype=='CHASE'){
             perfRaceType=2
          }

          var raceCode="FLAT";
          if(target.racetype=='CHASE'){

            raceCode="JUMPS";
          }
          else if(target.racetype=="HURDLE"){
            raceCode="JUMPS";
          }

          var perfCode="FLAT";
          if(perf.racetype=="CHASE"){
            perfCode="JUMPS";
          }
          else if(perf.racetype=="HURDLE"){
            perfCode="JUMPS";
          }

          //  if(goingsArray.indexOf(perf1.going)==-1){
           //   goingsArray.push(perf1.going);
          //  }

          if(perfCode==raceCode && perf.date < target.date && perf.speed < 30.0 && !isNaN(parseInt(perf.position))){
            var moment1=moment(perf.date);
            var moment2=moment(target.date);
            var diffDays = moment2.diff(moment1, 'days');
            var perfObject={
              horseid:horse._id,
              raceid:raceid,
              speed1:perf.speed,
              datediff:diffDays,
              going1:nconf.get('goingmappings')[perf.going],
              going2:nconf.get('goingmappings')[target.going],
              goingdiff:nconf.get('goingmappings')[target.going]-nconf.get('goingmappings')[perf.going],
              distance1:perf.distance,
              distance2:target.distance,
              distancediff:target.distance-perf.distance,
              weight1:perf.weight,
              weight2:target.weight,
              weightdiff:target.weight-perf.weight,
              type1:perfRaceType,
              type2:raceRaceType,
              typediff:raceRaceType-perfRaceType,
              racetype:perf.racetype,
              surface:perf.surface

            }
            horsePredictObject.performances.push(perfObject);
            //ro.name=cr.name;
           // logger.info("   perfObject: " + JSON.stringify(perfObject));
          }
          //break;
        }

      }

      //console.log(latestid + " " +JSON.stringify(latest));
      //console.log(JSON.stringify(horsePredictObject.performances));

      callback(horsePredictObject,target);
     

    
  });



}

function predict(horsePredictObject,target){
    

    //Now generate predictions for each performance;
    //var predictNode=new gpnode.parseNode(nconf.get('rule'));
    var predictNode;
    if(target.racetype=='FLAT'){
      predictNode=new gpnode.parseNode(nconf.get('flatrule'));
    }
    else if(rtarget.acetype=='CHASE'){
      predictNode=new gpnode.parseNode(nconf.get('jumpsrule'));
    }
    else if(target.racetype=='HURDLE'){
      predictNode=new gpnode.parseNode(nconf.get('jumpsrule'));
    }
    process.stdout.write('[');
  for(var i=0;i<horsePredictObject.performances.length;i++){

      var perf=horsePredictObject.performances[i];
       // logger.info(JSON.stringify(perf));

        var val=predictNode.eval(perf);
        var s1=perf.speed1;
        var predicted= s1 + ((s1*val)/100000);
        //logger.info('predicted: ' +predicted);
        //console.log('p:' + predicted);
        horsePredictObject.predictions.push(predicted);
        if(i==0)process.stdout.write(""+predicted );
        else process.stdout.write(","+predicted); 
               

  }
  process.stdout.write(']');
  process.exit(1);


}



