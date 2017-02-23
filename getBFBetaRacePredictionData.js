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
      "alpha":53.997,
      "beta":12.754,
      "loc":6.936,
      "scale":11.678
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

var jStat = require('jStat').jStat;

var alphaF=nconf.get('alpha');
var betaF=nconf.get('beta');
var predictedMode=nconf.get("loc") + (nconf.get("scale") * jStat.beta.mode(nconf.get('alpha'),nconf.get('beta')));
//logger.info("predictedMode: " + predictedMode);

//logger.info("raceid: " + nconf.get("raceid").toString() + (typeof nconf.get("raceid")));
getRacePredictionData(nconf.get("raceid").toString(),predict);


function getRacePredictionData(theraceid,callback){
db.spbets.findOne({"rpraceid":theraceid},function(err,spbet){
  if(spbet){
    logger.error("spbet for " + theraceid + " already exists");
    process.exit();

  }else{

 

      var racePredictObject={

        horses:{

        }
      }

      db.races.findOne({_id:theraceid},function(err,race){
        if(err){
          logger.error(JSON.stringify(err));
          process.exit();
        }
        else{
          //build the off date time
          //logger.info(JSON.stringify(race));
          var offdate=new Date(race.date);
          //logger.info("offdate: " + offdate);
          var offYear=offdate.getFullYear();
          var offMonth=offdate.getMonth()+1;
          if(offMonth < 10){
            offMonth='0' + offMonth;
          }
          var offDay=offdate.getDate();
          if(offDay < 10){
            offDay='0' + offDay;
          }

          //logger.info(offYear +" " + offMonth + " " + offDay);

          var timeS=race.offtime;
          var index=timeS.indexOf(':');

          var hrs=parseInt(timeS.substring(index-2,index));
          var mins=parseInt(timeS.substring(index+1,index + 3));

         // logger.info(hrs + " " + mins);

          var offDateTimeS=offYear + "-" + offMonth + "-" + offDay;
          var hrsS;
          var minsS;
             

          if(hrs < 12){
            hrsS="" + (hrs + 12);
          }
          else{
            hrsS="" + hrs;
          }

          if(mins< 10){
            minsS="0" + mins;
          }
          else{
            minsS="" + mins;
          }

          offDateTimeS+="T" + hrsS + ":" + minsS + ":00"

          //logger.info(offDateTimeS);

          //logger.info("Card: " + JSON.stringify(card));
          racePredictObject.raceid=theraceid;
          racePredictObject.offtime=new Date(offDateTimeS);
          racePredictObject.course=race.meeting;
          racePredictObject.surface=race.surface;
          racePredictObject.racetype=race.racetype;

          //logger.info(JSON.stringify(racePredictObject));

          var going2=race.going;
          var distance2=race.distance;
          var raceDate=race.date;

          racePredictObject.going2=going2;
          racePredictObject.distance2=distance2;
          racePredictObject.date2=raceDate;
          var count=0;
         // for(runnerid in race.runners){
         //   var raceRunner=race.runners[runnerid];
         for(var i=0;i<race.runners.length;i++){
            var runnerid=race.runners[i];
            count++;
            //var runnerObj={id:runnerid,perfs:[],targetweight:raceRunner.weight};
            //logger.info(runnerid);
            var runnerObj={id:runnerid,perfs:[]};
            var f=function(ro,rid){
              //logger.info("cr: " + JSON.stringify(cr));
                db.horses.findOne({_id:runnerid},function(err,horse){
                  if(err){
                    logger.error(JSON.stringify(err));
                    count--;
                  }
                  else{
                    //logger.info("HORSE: " + JSON.stringify(horse._id));
                    count--;

                    if(horse !== null){
                        var perfs=horse.performances;

                        //get target weight in this race

                        var thisPerf=perfs[theraceid];
                        if(typeof thisPerf=='undefined'){
                          logger.error("horse: " + runnerid + " no performance for: " + theraceid);
                        }
                      
                          ro.targetWeight=thisPerf.weight;
                          if(thisPerf.position==1){
                            ro.status="WINNER";
                          }
                          else{
                            ro.status="LOSER";
                          }
                          ro.sprice=thisPerf.price;
                          ro.bestLayWinPrice=1.0/(thisPerf.price.fractionbottom/(thisPerf.price.fractionbottom + thisPerf.price.fractiontop));
                          ro.bestBackWinPrice=ro.bestLayWinPrice;

                        for(raceid in perfs){
                          var perf=perfs[raceid];
                          //logger.info(cr.name + "   perf: " + JSON.stringify(perf));

                          var raceRaceType=1;
                          if(race.racetype=='HURDLE'){
                            raceRaceType=1
                          }
                          else if(race.racetype=='CHASE'){
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
                          if(race.racetype=='CHASE'){

                            raceCode="JUMPS";
                          }
                          else if(race.racetype=="HURDLE"){
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

                          if(perfCode==raceCode && perf.date < raceDate && perf.speed < 30.0 && !isNaN(parseInt(perf.position))){
                            var moment1=moment(perf.date);
                            var moment2=moment(race.date);
                            var diffDays = moment2.diff(moment1, 'days');
                            var perfObject={
                              horseid:horse._id,
                              raceid:raceid,
                              speed1:perf.speed,
                              datediff:diffDays,
                              going1:nconf.get('goingmappings')[perf.going],
                              going2:nconf.get('goingmappings')[race.going],
                              goingdiff:nconf.get('goingmappings')[race.going]-nconf.get('goingmappings')[perf.going],
                              distance1:perf.distance,
                              distance2:race.distance,
                              distancediff:race.distance-perf.distance,
                              weight1:perf.weight,
                              weight2:ro.targetWeight,
                              weightdiff:ro.targetWeight-perf.weight,
                              type1:perfRaceType,
                              type2:raceRaceType,
                              typediff:raceRaceType-perfRaceType,
                              racetype:perf.racetype,
                              surface:perf.surface

                            }
                            ro.perfs.push(perfObject);
                            //ro.name=cr.name;
                           // logger.info("   perfObject: " + JSON.stringify(perfObject));
                          }
                          //break;
                        }
                        racePredictObject.horses[rid]=ro;
                        //logger.info("COUNT: " + count);
                        if(count==0)callback(racePredictObject);


                  }
                  else{
                    logger.error("Horse: " + runnerid + " not found in the horses collection");
                    process.exit();
                  }
                }

                });
              } (runnerObj,runnerid);

          }
        }

      });
    }

  })
}

function predict(cdObject){
 // logger.info("predict");
  var racetype=cdObject.racetype;
  //logger.info("cdObject: "  + JSON.stringify(cdObject));
  //logger.info('call predict');
  var predictNode;
  if(racetype=='FLAT'){
    predictNode=new gpnode.parseNode(nconf.get('flatrule'));
  }
  else if(racetype=='CHASE'){
    predictNode=new gpnode.parseNode(nconf.get('jumpsrule'));
  }
  else if(racetype=='HURDLE'){
    predictNode=new gpnode.parseNode(nconf.get('jumpsrule'));
  }

 
        for(horseid in cdObject.horses){
          //logger.info("predict for horse: " + horseid);
          var horse=cdObject.horses[horseid];
          //logger.info(JSON.stringify(horse));
          horse.predicted=[];
          horse.cumulativePredictions=0;
          //logger.info(JSON.stringify(horse));
          var distPredictions=new Array();

           //Now generate predictions for each performance;
          //var predictNode=new gpnode.parseNode(nconf.get('rule'));
          var predictNode;
          if(racetype=='FLAT'){
            predictNode=new gpnode.parseNode(nconf.get('flatrule'));
          }
          else if(racetype=='CHASE'){
            predictNode=new gpnode.parseNode(nconf.get('jumpsrule'));
          }
          else if(racetype=='HURDLE'){
            predictNode=new gpnode.parseNode(nconf.get('jumpsrule'));
          }
          
          for(var i=0;i<horse.perfs.length;i++){
                var perf=horse.perfs[i];
               // logger.info(JSON.stringify(perf));

                var val=predictNode.eval(perf);
                var s1=perf.speed1;
                var predicted= s1 + ((s1*val)/100000);
                //logger.info('predicted: ' +predicted);
                distPredictions.push(predicted);
               

          }

          horse.distPredictions=distPredictions;
          //logger.info(JSON.stringify(horse));


        }
        //logger.info(JSON.stringify(cdObject));
        buildBetaDistributionParameters(cdObject.horses);
        doMonteCarlo(cdObject.horses);
        //outputToSPbetObject(cdObject);
        gatherHorseNames(cdObject);
    
}

//get the horse names, in order to pull in the BF past data
function gatherHorseNames(cdObject){
  //logger.info("gatherHorseNames")
    var horsenameLookup={};
    var count=Object.keys(cdObject.horses).length;//length
   for(horseid in cdObject.horses){
      var url="http://" + nconf.get("host")+ ":" + nconf.get("port") + "/gethorsename?horseid=" + horseid;
      //logger.info(url);
      request(url, function(err,resp,body){
        //logger.info(body);
        if(err){
          logger.error(err);
        }
        var horsedetails=JSON.parse(resp.body);
        var horseName=horsedetails.name;
        horsenameLookup[horsedetails.id]=horseName.replace(/'/g,'');
        count--;
       // logger.info("count: " + count);
        if(count==0){
          //we've finished
         // logger.info(JSON.stringify(horsenameLookup));
          gatherBFPrices(horsenameLookup,cdObject);
        }
      })

   }

}

function gatherBFPrices(horsenameLookup,cdObject){
  //logger.info("gatherBFPrices");
  var rpraceid=cdObject.raceid;
  //find the race in the BF past data;
  db2.bfraces.findOne({rpraceid:rpraceid,winners:1},function(err,bfrace){
    if(bfrace){

      var bfhorses={};
      for(horsename in bfrace.runners){
        var horseNameS=horsename.replace(/´/g,'').toUpperCase();
        bfhorses[horseNameS]=getLatestOdds(bfrace.runners[horsename].odds);


      }
      //logger.info(JSON.stringify(bfhorses));
      outputToSPbetObject(horsenameLookup,bfhorses,cdObject);
    }
      
  });

}

function getLatestOdds(oddsArray){
  oddsArray.sort(function(a, b) {
    return a.latest>b.latest ? -1 : a.latest<b.latest ? 1 : 0;
  });

  //logger.info("sorted array:");
  //logger.info(JSON.stringify(oddsArray));
  //process.exit();
  return(oddsArray[0].odds);

}


function outputToSPbetObject(horsenameLookup,bfodds,cdObject){
  //logger.info("outputToSPbetObject");
  var obj={
    rpraceid:cdObject.raceid,
    course:cdObject.course,
    offtime:cdObject.offtime,
    surface:cdObject.surface,
    racetype:cdObject.racetype,
    marketType:"WIN",
    horses:{

    }
  }
  

  for(horseid in cdObject.horses){
      //logger.info("predict for horse: " + horseid);
      var horse=cdObject.horses[horseid];
    //  logger.info("horse: " + JSON.stringify(horse));
      var horseObj={
        name:horsenameLookup[horseid],
        mean:horse.meanPredicted,
        sigma:horse.gaussianSigma,
        rphorseid:horseid,
        status:horse.status,
        bestLayWinPrice:bfodds[horsenameLookup[horseid]],
        bestBackWinPrice:bfodds[horsenameLookup[horseid]],
        sprice:horse.sprice,
        trialsResults:horse.trialsResults,
        winProbability:horse.trialsResults.winProbability,
        winLayReturn:((1-horse.trialsResults.winProbability)/(1-(1/horse.bestLayWinPrice))) -1,
        winBackReturn:(horse.trialsResults.winProbability/(1/horse.bestBackWinPrice)-1)
      }
      obj.horses[horseid]=horseObj;

  }
  logger.info(JSON.stringify(obj));
  db.spbets.insert(obj);
  process.exit();

}


//calculate the min and max values to be used by the beta distribution for each horse
function buildBetaDistributionParameters(horses){
  //logger.info("buildBetaDistributionParameters");
  var nhorses=Object.keys(horses).length;
  for(horseid in horses){
        var horse=horses[horseid];
        
        horse.trialsResults={
            first:0,
            second:0,
            third:0,
            fourth:0,
            winProbability:0.0,
            placeProbability:0.0
          }

        var observations=horse.distPredictions;

        var min=0;
        var max=0;
        var nbins=20;
        var bins;
        var modeIndex;

        do{
          //console.log("nbins: " + nbins);
           bins=new Array(nbins);

          for(var i=0;i<nbins;i++){
            bins[i]=0;
          }

          for(var i=0;i<observations.length;i++){
            var obs=observations[i];
            if(i==0){
              min=obs;
              max=obs;
            }
            if(obs < min){
              min=obs;
            }
            if(obs > max)max=obs;


          }

          var binWidth=(max-min)/nbins;

          for(var i=0;i<observations.length;i++){
            var obs=observations[i];
            var binno=Math.floor((observations[i]-min)/binWidth);
            if(binno ==nbins){
              binno=nbins-1;
            }
            bins[binno]=bins[binno]+1;
            //console.log(obs + " " + binno);
            
          }

          //find the mode

          var maxCount=0;
           modeIndex=0;
          for(var i=0;i<nbins;i++){
            var count=bins[i];
            if(count> maxCount){
              maxCount=count;
              modeIndex=i;
            }
            
          }
          //console.log("mode count: " + bins[modeIndex]);
          nbins--;
        }while((bins[modeIndex]< 6)&&(nbins > 0)); //we must have a mode


        //console.log("MODE INDEX: " + modeIndex);


        var observedMode=min + (modeIndex * binWidth) + (binWidth/2);
        //console.log("observedModeValue: " +observedModeValue );
        var modeTranslate=observedMode-predictedMode; //sift of mode of the distribution

        horse.modeTranslate=modeTranslate;
        //horse.betaMaxValue=max;
        //horse.betaMinValue=calculatedMinValue;

       // logger.info(horseid + " max: " + max + " min: " +calculatedMinValue + "observations: " + JSON.stringify(observations) );



    }

}


/*do a montecarlo simulation of the race , using a beta distribution*/
function doMonteCarlo(horses){
 //logger.info ("doMonteCarlo");
var nhorses=Object.keys(horses).length;
  for(var trial=0;trial<nconf.get('montecarlotrials');trial++){
  //for(var trial=0;trial<1;trial++){
      var samples=[];
      for(horseid in horses){
        var horse=horses[horseid];
        //var min=horse.betaMinValue;
        //var max=horse.betaMaxValue;
        //generate an observation from the beta distribution
        
        var sample=jStat.beta.sample(alphaF,betaF); 
       var predictedSpeed=nconf.get("loc")+ horse.modeTranslate + (sample * nconf.get("scale"));
       //logger.info(horseid + "sample: " + sample + " translate: " + horse.modeTranslate + " predictedSpeed: " + predictedSpeed);
       // logger.info(horseid + " " + min + " " + max + " " + var predictedSpeed=);
       var predictionObject={
          horse:horse,
          speed:predictedSpeed
        }
        samples.push(predictionObject);

      }
      samples.sort(function(a,b){
        if(a.speed < b.speed)return(1);
        if(a.speed > b.speed)return(-1);
        return(0);
      });
      //logger.info("samples: " + JSON.stringify(samples));

      for(var i=0;i<samples.length;i++){
        var sample=samples[i];
        if(i==0){
          sample.horse.trialsResults.first =sample.horse.trialsResults.first + 1;
        }
        if(i==1){
          sample.horse.trialsResults.second =sample.horse.trialsResults.second + 1;
        }
        if(i==2){
          sample.horse.trialsResults.third =sample.horse.trialsResults.third + 1;
        }
        if(i==3){
          sample.horse.trialsResults.fourth =sample.horse.trialsResults.fourth + 1;
        }
      }


    }
    for(horseid in horses){
        var horse=horses[horseid];
        horse.trialsResults.winProbability= horse.trialsResults.first /nconf.get('montecarlotrials');
        //logger.info(horse.name + " " + horse.trialsResults.winProbability);
    }
  

  
 /* var nhorses=Object.keys(horses).length;
  for(var trial=0;trial<nconf.get('montecarlotrials');trial++){
      var samples=[];
      for(horseid in horses){
        var horse=horses[horseid];
        var dist=horse.gaussianDistribution;
        var predictedSpeed=dist.ppf(Math.random());
        var predictionObject={
          horse:horse,
          speed:predictedSpeed
        }
        samples.push(predictionObject);

        
      }


      samples.sort(function(a,b){
        if(a.speed < b.speed)return(1);
        if(a.speed > b.speed)return(-1);
        return(0);
      });
      //logger.info("samples: " + JSON.stringify(samples));

      for(var i=0;i<samples.length;i++){
        var sample=samples[i];
        if(i==0){
          sample.horse.trialsResults.first =sample.horse.trialsResults.first + 1;
        }
        if(i==1){
          sample.horse.trialsResults.second =sample.horse.trialsResults.second + 1;
        }
        if(i==2){
          sample.horse.trialsResults.third =sample.horse.trialsResults.third + 1;
        }
        if(i==3){
          sample.horse.trialsResults.fourth =sample.horse.trialsResults.fourth + 1;
        }
      }



  }
  //calculate probabilities
   for(horseid in horses){
        var horse=horses[horseid];
        horse.trialsResults.winProbability= horse.trialsResults.first /nconf.get('montecarlotrials');
        logger.info(horse.name + " " + horse.trialsResults.winProbability);
    }
    */

}



