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
     "raceids":["608242","637033","614602","610358","610755","616158","614153","612200","608241","610970","641302","615009","608421","609332","627447","608424","614623","611850","608327","613872","609614","637454","611877","610128","608326","610792","609425","629067","613892","611210","613326","608173","628612","628832","625422","613621","612439","610845","609711","610111","634899","633314","633914","632163","626500","624371","611712","609955","608194","606911","630267","627570","617511","611590","610741","609385","627963","625831","610271","634880","633756","633070","632190","630284","627940","626410","625147","624327","609582","607977","606905","635794","634042","632568","631284","630289","628897","625030","623095","633215","631567","627608","612728","611323","609977","608171","608023","606924","636351","635409","632637","631392","628961","626558","625183","622415","610006","608021","606898","634151","632117","630825","629444","628924","627916","627316","623686","607782","606960"]
      });



var collections=["races","horses","trainingset"];
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

//logger.info("databaseUrl: " + databaseUrl);

var count=0;
 var goingsArray=[];
var horseCursor=db.horses.find({});

horseCursor.forEach(function(err,horse){
  if(horse !== null){
     var performances=horse.performances;
      //  logger.info(JSON.stringify(horse));
        var keys=Object.keys(performances);
      //  logger.info("Keys: " + JSON.stringify(keys));
      var n= Object.keys(performances).length;
      if(n > 20){         //only horses with > 20 runs
        var performanceArray=[];

        for(var j=0;j<n;j++){
          var key=keys[j];
          var perf=performances[key];


           //if((perf.racetype=="FLAT")&&(perf.going=='Fast')){
           ///   stats.total=stats.total+perf.speed;
            //  stats.runners=stats.runners+1;
          // }


          if((perf.racetype=="CHASE")||(perf.racetype=="HURDLE")){
              perf.goingLookup=goingMappings[perf.going];
              if(typeof perf.goingLookup=='undefined'){
                logger.error("Going Lookup undefined: |" + perf.going + "|")
              }
              else {
                performanceArray.push(perf);
              }
          //performanceArray[j]=perf;
          }
        }

        //logger.info(JSON.stringify(performanceArray));


        performanceArray.sort(function(a,b){

          if(a.date < b.date)return(-1);
          else if(a.date > b.date)return(1)
          return(0);

        });

          for(x=0;x<(performanceArray.length-1);x++){
         // logger.info("X: " + x);

          var perf1=performanceArray[x];
          var perf1RaceType=1;
          if(perf1.racetype=='HURDLE'){
            perf1RaceType=1
          }
          else if(perf1.racetype=='CHASE'){
             perf1RaceType=2
          }
          if(goingsArray.indexOf(perf1.going)==-1){
            goingsArray.push(perf1.going);
          }

          for(y=x+1;y<performanceArray.length;y++){
           // logger.info("Y: " + y);
              var perf2=performanceArray[y];
              var perf2RaceType=1;
              if(perf2.racetype=='HURDLE'){
                perf2RaceType=1
              }
              else if(perf2.racetype=='CHASE'){
                 perf2RaceType=2
              }

             // logger.info("p1: " +JSON.stringify(perf1));

             // logger.info("p2: " + JSON.stringify(perf2));

              moment1=moment(perf1.date);
              moment2=moment(perf2.date);
              var diffDays = moment2.diff(moment1, 'days');
             // logger.info('diffdays: ' + diffDays);
              var performanceRecord={
                speed1:perf1.speed,
                speed2:perf2.speed,
                datediff:diffDays,
                going1:perf1.goingLookup,
                going2:perf2.goingLookup,
                goingdiff:perf2.goingLookup-perf1.goingLookup,
                distance1:perf1.distance,
                distance2:perf2.distance,
                distancediff:perf2.distance-perf1.distance,
                weight1:perf1.weight,
                weight2:perf2.weight,
                weightdiff:perf2.weight-perf1.weight,
                type1:perf1RaceType,
                type2:perf2RaceType,
                typediff:perf2RaceType-perf1RaceType
              }

              logger.info(count++ + " Performance: " + JSON.stringify(performanceRecord));
              db.trainingset.insert(performanceRecord)



          }
        }
      }

  }
  else{
    process.exit();
  }

})


/*db.horses.find({},function(err,horses){
  var threePlus=0;
  var fivePlus=0;
  var tenPlus=0;
  var eightPlus=0;
  var goingsArray=[];
  var stats={total:0,runners:0,avg:0}

  for(var i=0;i<horses.length;i++){
      var horse=horses[i];
      var performances=horse.performances;
     // logger.info(JSON.stringify(horse));
     // logger.info('nPerformances: ' + Object.keys(performances).length);
      var n= Object.keys(performances).length;

      if(n > 1){
         var keys=Object.keys(performances);
      for(var j=0;j<n;j++){
          var key=keys[j];
          var perf=performances[key];


           if((perf.racetype!="FLAT")&&(perf.going=='Good To Yielding')&&(perf.distance > 1109.24)&&(perf.distance < 1310.92)){
              stats.total=stats.total+perf.speed;
              stats.runners=stats.runners+1;
           }


          
        }
      }


      if(n >=3){
        threePlus++;
      }
      if(n >=5){
        fivePlus++;
      }
      if(n >= 8){
        eightPlus++;
      }

      if(n >= 10){
        tenPlus++;

       //  logger.info(JSON.stringify(horse));
        var keys=Object.keys(performances);
      //  logger.info("Keys: " + JSON.stringify(keys));

        var performanceArray=[];

        for(var j=0;j<n;j++){
          var key=keys[j];
          var perf=performances[key];


           //if((perf.racetype=="FLAT")&&(perf.going=='Fast')){
           ///   stats.total=stats.total+perf.speed;
            //  stats.runners=stats.runners+1;
          // }


          if((perf.racetype!="FLAT")){
              perf.goingLookup=goingMappings[perf.going];
              if(typeof perf.goingLookup=='undefined'){
                logger.error("Going Lookup undefined: |" + perf.going + "|")
              }
              else {
                performanceArray.push(perf);
              }
          //performanceArray[j]=perf;
          }
        }

        //logger.info(JSON.stringify(performanceArray));


        performanceArray.sort(function(a,b){

          if(a.date < b.date)return(-1);
          else if(a.date > b.date)return(1)
          return(0);

        })
       // logger.info(JSON.stringify(performanceArray));

        //build data from races

        for(x=0;x<(performanceArray.length-1);x++){
         // logger.info("X: " + x);

          var perf1=performanceArray[x];
          if(goingsArray.indexOf(perf1.going)==-1){
            goingsArray.push(perf1.going);
          }

          for(y=x+1;y<performanceArray.length;y++){
           // logger.info("Y: " + y);
              var perf2=performanceArray[y];

              logger.info("p1: " +JSON.stringify(perf1));

              logger.info("p2: " + JSON.stringify(perf2));

              moment1=moment(perf1.date);
              moment2=moment(perf2.date);
              var diffDays = moment2.diff(moment1, 'days');
             // logger.info('diffdays: ' + diffDays);
              var performanceRecord={
                speed1:perf1.speed,
                speed2:perf2.speed,
                datediff:diffDays,
                going1:perf1.goingLookup,
                going2:perf2.goingLookup,
                goingdiff:perf2.goingLookup-perf1.goingLookup,
                distance1:perf1.distance,
                distance2:perf2.distance,
                distancediff:perf2.distance-perf1.distance,
                weight1:perf1.weight,
                weight2:perf2.weight,
                weightdiff:perf2.weight-perf1.weight
              }

              logger.info("Peformance: " + JSON.stringify(performanceRecord));
              db.trainingset.insert(performanceRecord)



          }
        }


      }
  }

  logger.info("3+: " + threePlus + " 5+: " + fivePlus + " 8+: " + eightPlus + " 10+: " + tenPlus);
  logger.info("GOINGS: " + JSON.stringify(goingsArray));
  stats.avg=stats.total/stats.runners;
  logger.info("stats: " + JSON.stringify(stats));


})*/



