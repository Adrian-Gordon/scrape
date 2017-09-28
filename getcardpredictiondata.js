/*This app gets assembles the data for a racecard in a form suitable for prediction - card data and past performance data*/
 gaussian=require('gaussian');
//nconf is used globally
if(typeof nconf == 'undefined')
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
var databaseUrl="mongodb://" + nconf.get("databaseurl");
var MongoClient=require('mongodb').MongoClient;



var request = require('request');
var srequest=require('sync-request');

MongoClient.connect(databaseUrl,function(err,db){
    if(err) throw(err);
    getCardPredictionData(db,nconf.get("raceid").toString(),predict);
    
});

//logger.info("raceid: " + nconf.get("raceid").toString() + (typeof nconf.get("raceid")));



function getCardPredictionData(db,raceid,callback){
  var cardPredictObject={

    horses:{

    }
  }

  db.collection("cards").findOne({rpraceid:raceid},function(err,card){
    if(err){
      logger.error(JSON.stringify(err));
    }
    else{
      //logger.info("Card: " + JSON.stringify(card));
      cardPredictObject.raceid=raceid;
      cardPredictObject.offtime=card.offdatetime;
      cardPredictObject.course=card.meeting;
      cardPredictObject.surface=card.surface;
      cardPredictObject.racetype=card.racetype;

      var going2=card.going;
      var distance2=card.distance;
      var raceDate=card.date;

      cardPredictObject.going2=going2;
      cardPredictObject.distance2=distance2;
      cardPredictObject.date2=raceDate;
      var count=0;
      for(runnerid in card.runners){
        var cardRunner=card.runners[runnerid];

        count++;
        var runnerObj={id:runnerid,perfs:[],targetweight:cardRunner.weight};
        //logger.info(runnerid);
        var f=function(ro,rid,cr){
          //logger.info("cr: " + JSON.stringify(cr));
            db.collection("horses").findOne({_id:runnerid},function(err,horse){
              if(err){
                logger.info(JSON.stringify(err));
                count--;
              }
              else{
                //logger.info("HORSE: " + JSON.stringify(horse._id));
                count--;

                if(horse !== null){
                    var perfs=horse.performances;
                    for(raceid in perfs){
                      var perf=perfs[raceid];
                      //logger.info(cr.name + "   perf: " + JSON.stringify(perf));

                      var cardRaceType=1;
                      if(card.racetype=='HURDLE'){
                        cardRaceType=1
                      }
                      else if(card.racetype=='CHASE'){
                         cardRaceType=2
                      }

                      var perfRaceType=1;
                      if(perf.racetype=='HURDLE'){
                        perfRaceType=1
                      }
                      else if(perf.racetype=='CHASE'){
                         perfRaceType=2
                      }

                      var cardCode="FLAT";
                      if(card.racetype=='CHASE'){

                        cardCode="JUMPS";
                      }
                      else if(card.racetype=="HURDLE"){
                        cardCode="JUMPS";
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

                      if(perfCode==cardCode && perf.date < raceDate && perf.speed < 30.0 && !isNaN(parseInt(perf.position))){
                        var moment1=moment(perf.date);
                        var moment2=moment(card.date);
                        var diffDays = moment2.diff(moment1, 'days');
                        var perfObject={
                          horseid:horse._id,
                          name:cr.name,
                          raceid:raceid,
                          speed1:perf.speed,
                          datediff:diffDays,
                          going1:nconf.get('goingmappings')[perf.going],
                          going2:nconf.get('goingmappings')[card.going],
                          goingdiff:nconf.get('goingmappings')[card.going]-nconf.get('goingmappings')[perf.going],
                          distance1:perf.distance,
                          distance2:card.distance,
                          distancediff:card.distance-perf.distance,
                          weight1:perf.weight,
                          weight2:cr.weight,
                          weightdiff:cr.weight-perf.weight,
                          type1:perfRaceType,
                          type2:cardRaceType,
                          typediff:cardRaceType-perfRaceType,
                          racetype:perf.racetype,
                          surface:perf.surface

                        }
                        ro.perfs.push(perfObject);
                        ro.name=cr.name;
                        logger.info("   perfObject: " + JSON.stringify(perfObject));
                      }
                      //break;
                    }
                    cardPredictObject.horses[rid]=ro;
                    //logger.info("COUNT: " + count);
                    if(count==0)callback(db,cardPredictObject);


              }
              else{
                logger.error("Horse: " + runnerid + " not found in the horses collection");
                process.exit();
              }
            }

            });
          }(runnerObj,runnerid,cardRunner);

      }
    }

  })
}

function predict(db,cdObject){
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

  //get reference horses

  var referenceHorses=[];

  db.collection("horses").find({reference:true},function(err,referenceHorses){
     /* for(horse in horses){
        var count=Object.keys(horses[horse].performances).length;
       // logger.info("COUNT: " + count);
        if(count > nconf.get('referencecount')){
         // logger.info("ref horse: " + JSON.stringify(horses[horse]))
          referenceHorses.push(horses[horse]);
        }

      }*/
     // logger.info("nrefhorses: " + referenceHorses.length);



        for(horseid in cdObject.horses){
          //logger.info("predict for horse: " + horseid);
          var horse=cdObject.horses[horseid];
          //logger.info(JSON.stringify(horse));
          horse.predicted=[];
          horse.cumulativePredictions=0;
          var nperfs=0;
          for(var i=0;i<horse.perfs.length;i++){
            var perf=horse.perfs[i];
            //logger.info(JSON.stringify(perf));
            //logger.info("racetype: " + racetype)
            //only use performances for this code
            if(racetype=='FLAT'){
              if(perf.racetype=='FLAT'){
                var val=predictNode.eval(perf);
                var s1=perf.speed1;
                var predicted= s1 + ((s1*val)/100000);
                //logger.info('predicted: ' +predicted);
                horse.predicted.push(predicted);
                nperfs++;
                horse.cumulativePredictions+=predicted;
              }

            }
            else if(racetype=='HURDLE' || racetype=='CHASE'){
              if(perf.racetype=='HURDLE' || perf.racetype=='CHASE'){
                var val=predictNode.eval(perf);
                var s1=perf.speed1;
                var predicted= s1 + ((s1*val)/100000);
                //logger.info('predicted: ' +predicted);
                horse.predicted.push(predicted);
                 nperfs++;
                horse.cumulativePredictions+=predicted;
              }
            }

            

          }
          if(nperfs < 1){    //omit races containing horses with no qualifying performances
            logger.info("horse: " + horseid + " has fewer than 4 qualifying performances (" + nperfs + ")");
            process.exit();
          }
          horse.meanPredicted=horse.cumulativePredictions/nperfs;
          //logger.info(JSON.stringify(horse));
          horse.distPredictions=getCluster(horseid,horse,referenceHorses,cdObject.distance2,cdObject.going2,cdObject.date2,horse.targetweight,racetype);
          //break;
          //go get the Gaussian sigma
          var cmd="java -cp " + nconf.get('classpath') + " GaussianFit2 \"{'observations':" + JSON.stringify(horse.distPredictions) + "}\"";
          logger.info("cmd: " + cmd);
          
          var gaussianParams=execSync(cmd);
         // logger.info('gaussian: ' + gaussian);
         //logger.info('GPs: ' + gaussianParams);

         if(gaussianParams.indexOf("Maximum iteration number reached")!==-1){

            logger.error("Non Gausian Data, raceid: " + nconf.get("raceid") + " horseid: " + horseid);
            logger.error("cmd: " + cmd);
            process.exit();
         }
          var gaussianObj=JSON.parse( gaussianParams);
          horse.gaussianSigma=gaussianObj.sigma;
          //logger.info(JSON.stringify(horse));
          logger.info(horse.id + " " + horse.name + " " + horse.meanPredicted + " " + horse.gaussianSigma);

          horse.gaussianDistribution=gaussian(horse.meanPredicted,horse.gaussianSigma * horse.gaussianSigma);
          horse.trialsResults={
            first:0,
            second:0,
            third:0,
            fourth:0,
            winProbablity:0.0,
            placeProbability:0.0
          }

        }
        //logger.info(JSON.stringify(cdObject));
        //doMonteCarlo(cdObject.horses);
        outputToMonitorObject(db,cdObject);
    })
}


function outputToMonitorObject(db,cdObject){
  var obj={
    raceid:cdObject.raceid,
    course:cdObject.course,
    offtime:cdObject.offtime,
    surface:cdObject.surface,
    racetype:cdObject.racetype,
    horses:{

    }
  }
  

  for(horseid in cdObject.horses){
      //logger.info("predict for horse: " + horseid);
      var horse=cdObject.horses[horseid];
      var horseObj={
        mean:horse.meanPredicted,
        sigma:horse.gaussianSigma,
        rphorseid:horseid
      }
      obj.horses[horse.name]=horseObj;

  }
  logger.info(JSON.stringify(obj));
  db.collection("tomonitor").insert(obj);
  process.exit();

}

function doMonteCarlo(horses){
  var nhorses=Object.keys(horses).length;
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
        horse.trialsResults.winProbablity= horse.trialsResults.first /nconf.get('montecarlotrials');
        logger.info(horse.name + " " + horse.trialsResults.winProbablity);
    }

}


//Returns a set of performances gathered from a 'cluster' of similar horses, to be used in generating
//a normal distribution of horse performances
//distance2, going2,date2 and weight2 are the target conditions for the race (and weight for the given horse)
function getCluster(horseid,horse,refs,distance2,going2,date2,weight2,racetype){
  //logger.info("get cluster in " + horseid)
  //logger.info("HORSE: " + JSON.stringify(horse));
  //clear the refs data

  for(var i=0;i<refs.length;i++){
    refs[i].matches=0;
    refs[i].cumulativeerror=0;
  }

  //iterate over the horse's performances
  for(var i=0;i<horse.perfs.length;i++){
  //for(var i=0;i<1;i++){
    var perf = horse.perfs[i];
    //iterate over all reference performances
    for(var j=0;j<refs.length;j++){
    //for(var j=0;j<1;j++){
      var refHorse=refs[j];
        if(refHorse._id != horse.id){
          for(raceid in refHorse.performances){
            var refPerf=refHorse.performances[raceid];
            var matches=matchPerfs(perf,refPerf);
            if(matches.matches){
              refs[j].matches=refs[j].matches+1;
              refs[j].cumulativeerror=refs[j].cumulativeerror+matches.error;
              refs[j].avgerror=refs[j].cumulativeerror/refs[j].matches;
            }
            //break;

          }
        }
    }

  }
  //sort by number of matches
  refs.sort(function(a,b){
    if(a.matches >b.matches)return(-1);
    if(a.matches <b.matches)return(1);
    return(0);

  });

 /* refs.sort(function(a,b){
    var aAvg=a.cumulativeerror/a.matches;
    var bAvg=b.cumulativeerror/b.matches;
    if(aAvg>bAvg)return(1);
    if(aAvg <bAvg)return(-1);
    return(0);
  })*/

  var bestMatches=[];

 // logger.info('Best match: ' + JSON.stringify(refs[0]));
  for(var i=0;i<10;i++){
    //logger.info(refs[i].matches + " " + refs[i].cumulativeerror + " " +  refs[i].avgerror);
   // refs[i].avgerror=refs[i].cumulativeerror/refs[i].matches;
    bestMatches.push(refs[i]);
  }

  bestMatches.sort(function(a,b){
    if(a.avgerror < b.avgerror) return(-1);
    if(a.avgerror > b.avgerror) return(1);
    return(0);
  });

  var distPerfs=horse.perfs;

  var count=distPerfs.length;
  //logger.info("bestMatches: " + JSON.stringify(bestMatches));
  for(var i=0;i<10;i++){
    //logger.info(bestMatches[i].matches + " " + bestMatches[i].cumulativeerror + " " + bestMatches[i].avgerror);
    if((bestMatches.length > 0)&&(bestMatches[i]))
      distPerfs=distPerfs.concat(transformForPrediction(bestMatches[i].performances,distance2,going2,date2,weight2,racetype));
    if(distPerfs.length > nconf.get("nperfsforgaussian"))
      break;
    
  }

  

  //logger.info("distPerfs: " + JSON.stringify(distPerfs));
 // logger.info("length: " + distPerfs.length);

  horse.distPerfs=distPerfs;
  distPredictions=[];

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
  
  for(var i=0;i<horse.distPerfs.length;i++){
        var perf=horse.distPerfs[i];
       // logger.info(JSON.stringify(perf));

        var val=predictNode.eval(perf);
        var s1=perf.speed1;
        var predicted= s1 + ((s1*val)/100000);
        //logger.info('predicted: ' +predicted);
        distPredictions.push(predicted);
       

  }

  //logger.info(horse.id + " name: " + horse.name + " p: " + horse.meanPredicted + " ndperfs: " + horse.distPerfs.length);
  //logger.info(JSON.stringify(distPredictions));
  //logger.info("get cluster returns " + horseid);
  return(distPredictions);
  


}

function matchPerfs(perf,refperf){
  
  var returnObj={
    matches:false,
    error:0
  }
  // logger.info("match perf: " + JSON.stringify(perf) + " to " + JSON.stringify(refperf));

  var refGoing=nconf.get('goingmappings')[refperf.going];
  var distDiff = Math.abs(refperf.distance - perf.distance1);
  var weightDiff=Math.abs(refperf.weight - perf.weight1);
 // logger.info("weightDiff: " + weightDiff + " distDiff: " + distDiff + " refGoing: " + refGoing + " going: " + perf.going1);

if(refGoing==perf.going1 && (distDiff <= nconf.get('distancepm'))&&(weightDiff <= nconf.get('weightpm'))){
//if(refGoing==perf.going1 && (distDiff <= nconf.get('distancepm'))){
    returnObj.matches=true;
    returnObj.error=Math.abs(perf.speed1-refperf.speed);
   // logger.info("matches perf: " + JSON.stringify(perf) + " to " + JSON.stringify(refperf));

    //logger.info('returns: ' + JSON.stringify(returnObj));
  }



  return(returnObj);



}

//returns an array of performances to be used in a prediction
//each will be transformed into the form: 

function transformForPrediction(perfs,distance2,going2,date2,weight2,racetype){
  var arrayToReturn=[]
  for(raceid in perfs){
        var perf=perfs[raceid];
       // logger.info("   perf: " + JSON.stringify(perf));
        if(perf.date < date2 && perf.speed < 30.0 && !isNaN(parseInt(perf.position))){

          if(racetype=='FLAT'){
            if(perf.racetype=='FLAT'){
               var moment1=moment(perf.date);
                var moment2=moment(date2);
                var diffDays = moment2.diff(moment1, 'days');
                var perfObject={
                  //horseid:horse._id,
                 // name:cr.name,
                 // raceid:raceid,
                  speed1:perf.speed,
                  datediff:diffDays,
                  going1:nconf.get('goingmappings')[perf.going],
                  going2:nconf.get('goingmappings')[going2],
                  goingdiff:nconf.get('goingmappings')[going2]-nconf.get('goingmappings')[perf.going],
                  distance1:perf.distance,
                  distance2:distance2,
                  distancediff:distance2-perf.distance,
                  weight1:perf.weight,
                  weight2:weight2,
                  weightdiff:weight2-perf.weight,

                }
                arrayToReturn.push(perfObject);

            }
          }
          else if(racetype=='HURDLE' || racetype=='CHASE'){
            if(perf.racetype=='HURDLE' || perf.racetype=='CHASE'){
              var moment1=moment(perf.date);
                var moment2=moment(date2);
                var diffDays = moment2.diff(moment1, 'days');
                var perfObject={
                  //horseid:horse._id,
                 // name:cr.name,
                 // raceid:raceid,
                  speed1:perf.speed,
                  datediff:diffDays,
                  going1:nconf.get('goingmappings')[perf.going],
                  going2:nconf.get('goingmappings')[going2],
                  goingdiff:nconf.get('goingmappings')[going2]-nconf.get('goingmappings')[perf.going],
                  distance1:perf.distance,
                  distance2:distance2,
                  distancediff:distance2-perf.distance,
                  weight1:perf.weight,
                  weight2:weight2,
                  weightdiff:weight2-perf.weight,

                }
                arrayToReturn.push(perfObject);
            }
          }
         
          //logger.info("   perfObject: " + JSON.stringify(perfObject));
        }
        //break;
  }
  return(arrayToReturn);


}

