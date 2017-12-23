/*This app gets assembles the data for a racecard in a form suitable for prediction - card data and past performance data*/
//nconf is used globally
if(typeof nconf == 'undefined')
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
  
     "databaseurl"     :"mongodb://rpuser:tTY473%25%5E@52.31.122.201/rpdata",
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
     "goingMappings":{"Firm":-3,"Good To Firm":-2,"Standard":-1,"Good":-1,"Good To Soft":0,"Good To Yielding":-1,"Standard To Slow":0,"Yielding":1,"Yielding To Soft":1,"Soft":1,"Soft To Heavy":2,"Heavy":3,"Very Soft":3},
    "gpnodepath":"/Users/adriangordon/Development/GP/Node/GPNode",
     "variables":['speed1','distance1','distance2','distancediff','weight1','weight2','weightdiff','going1','going2','goingdiff'],
     "functionSet":['+','-','*','/','^','if<='],
     "datafileurl":'/Users/adriangordon/Development/GP/GP/flatobservations.json',
     "rule":["+","*","-","*","if<=","speed1","if<=","weight1",6.5858,"^",-6.4670,"/","*",-7.2541,-3.6690,"if<=","weight2",0.2758,"-","-",6.5858,"weight2","/","*","*","-",-4.1061,"weight2","distancediff","+",5.2645,5.8362,"if<=","speed1",0.2758,"weight1","weight1","weight1","+",5.2645,5.8362,"*","*",5.2645,"if<=","*","weight1","*",6.6996,"distancediff","if<=","/","*","*","*","*","-","-",-6.4670,"if<=","*","goingdiff",0.6722,"goingdiff","speed1",6.6996,"weight2","distancediff","+",5.2645,5.8362,"distancediff","+",5.2645,5.8362,"if<=","speed1",0.2758,"weight1","weight1","if<=","weight1",6.5858,"^",5.2645,"+","weight2","distancediff",6.6996,"*","*",5.2645,"if<=","*",0.6722,"goingdiff",0.2758,-3.6690,"weight1",0.6722,"weight1","weight2","weight1",0.6722,"weight1","-",-6.4670,"if<=","*","goingdiff","speed1",0.6722,"speed1","speed1","distance1","goingdiff","/","*","*","-","-",-6.4670,"*",-7.2541,-3.6690,"weight2","distancediff","+",5.2645,5.2645,"if<=","speed1",0.2758,"weight1","if<=","speed1","goingdiff",-3.6690,"weight1"],
     "observationStats": {"maxSpeedDif":{"speed1":17.003836077844312,"speed2":11.993165933212529,"dif":0.2946788078697486},"minSpeedDif":{"speed1":11.579529042386186,"speed2":16.42143350046741,"dif":-0.41814347028775656},"maxGoingIncrease":6,"maxGoingDecrease":-6,"maxDistanceIncrease":2548.4327999999996,"maxDistanceDecrease":-1655.9784,"mindistance":1005.84,"maxdistance":5632.704,"maxWeightIncrease":79,"maxWeightDecrease":-78,"maxweight":188,"minweight":105},
      "minfofx": -123249.31077344337,
      "maxfofx": 85296.35009281096,
      "alpha": 161,
      "beta": 25,
      "loc":-2.5,
      "scale":21.2,//9.869,
      "montecarlotrials": 100000,
      "nwinners":1,
      "markettype":"WIN"
});






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


var dbUrl=nconf.get('databaseurl');
var rpraceid=''+nconf.get('rpraceid');
var marketType=nconf.get('markettype');
var goingMappings=nconf.get("goingMappings");
var gpnode=require(nconf.get("gpnodepath"));

var rule=nconf.get("rule");
var stats=nconf.get("observationStats");
var node=new gpnode().parseNode(rule,nconf.get('variables'),nconf.get('functionSet'));
var moment=require('moment');
var jStat = require('jStat').jStat;


var minfofx=nconf.get('minfofx');
var maxfofx=nconf.get('maxfofx');
var loc=nconf.get("loc");
var scale=nconf.get("scale");
var alpha=nconf.get('alpha');
var beta=nconf.get('beta');
var nwinners=nconf.get('nwinners');

var MongoClient= require('mongodb').MongoClient;

MongoClient.connect("mongodb://" + dbUrl,function(err,db){
    if(err) throw(err);
    getBetaPredictionData(db,nconf.get("raceid").toString(),predict);
    
});

//logger.info("raceid: " + nconf.get("raceid").toString() + (typeof nconf.get("raceid")));



function getBetaPredictionData(db,raceid,callback){
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
        var runnerObj={id:runnerid,perfs:[],predictions:[],targetweight:cardRunner.weight};
        //logger.info(runnerid);
        var f=function(ro,rid,cr){
          //logger.info("cr: " + JSON.stringify(cr));
            db.collection("horses").findOne({_id:rid},function(err,horse){
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

                      if(perfCode==cardCode && perf.date < raceDate && perf.speed < 20.0 && !isNaN(parseInt(perf.position))){
                        var moment1=moment(perf.date);
                        var moment2=moment(card.date);
                        var diffDays = moment2.diff(moment1, 'days');
                        var perfObject={
                          horseid:horse._id,
                          name:cr.name,
                          raceid:raceid,
                          speed1:perf.speed,
                          datediff:diffDays,
                          going1:goingMappings[perf.going],
                          going2:goingMappings[card.going],
                          goingdiff:goingMappings[card.going]-goingMappings[perf.going],
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
                        //Now do the prediction
                        var predictedVal=node.eval(perfObject);
                        var predictedProportion=(predictedVal - minfofx)/(maxfofx - minfofx);
                        var predictedChange=nconf.get('observationStats').minSpeedDif.dif +(predictedProportion *(nconf.get('observationStats').maxSpeedDif.dif - nconf.get('observationStats').minSpeedDif.dif));
                        //var observation=nconf.get("observation");

                        var predictedSpeed=perfObject.speed1 + (predictedChange *  perfObject.speed1); 
                        ro.predictions.push(predictedSpeed);

                      }
                      //break;
                    }

                     ro.distribution= getModelParameters(ro.predictions);








                    cardPredictObject.horses[rid]=ro;
                    //logger.info("COUNT: " + count);
                    if(count==0)callback(db,cardPredictObject);


              }
              else{
                logger.error("Horse: " + rid + " not found in the horses collection");
                process.exit();
              }
            }

            });
          }(runnerObj,runnerid,cardRunner);

      }
    }

  })
}


function predict(db,cardPredictionObject){

  //doMonteCarlo(cardPredictionObject.horses,nconf.get("nwinners"));
  outputToMonitorObject(db,cardPredictionObject);
}


function getModelParameters(predictions){
  var scale= nconf.get("scale");//9.8;//(max-min) * scaleMultiplier;
  var predictedMode=loc +  (scale *jStat.beta.mode(alpha,beta));
  //logger.info("predictions: " + JSON.stringify(predictions));
  var observations=predictions;
    var nObs=observations.length;
    var rval;
    if(nObs == 1){
    rval={
        "min": observations[0],
        "max": observations[0],
        "mode": observations[0],
        "predictedMode": predictedMode,
        "scale":scale,
        "modeTranslate":observations[0]-predictedMode,
        "modeIncrement":0,
        "binWidth":0,
        "histBinWidth":0,
        "hist": new Array(),
        "bins": new Array()
      }
      return(rval);

    }
    var min=0;
    var max=0;
    var nbins=20;
    var bins;
    var modeIndex;
    var maxCount=0;

    do{
      //console.log("nbins: " + nbins);
       bins=new Array(nbins);

      for(var i=0;i<nbins;i++){
        bins[i]=0;
      }

      for(var i=0;i<observations.length;i++){
        var obs=observations[i];
        if((obs > 19)||(obs < 10)){
          logger.info(i + " Out of range: " + obs);
        }
        else{
          if(i==0){
          min=obs;
          max=obs;
          }
          if(obs < min){
            min=obs;
          }
          if(obs > max)max=obs;
        }
        


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

       maxCount=0;
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
    //}while((bins[modeIndex]< 6)&&(nbins > 0));//&&(modeCount(bins,maxCount)>1)); //we must have a mode
      if((bins[modeIndex]>=10)&&(modeCount(bins,maxCount)==1))break;
      if(nbins==1)break;
    }while(true);

  //  console.log("min: " + min + "max: " + max + " scale: " + (max - min));
  //console.log("#MODE INDEX: " + modeIndex + " " + JSON.stringify(bins));

//console.log("minO: " + min + " maxO: " + max + " predictedMode: " + predictedMode);
  var observedMode=min + (modeIndex * binWidth) + (binWidth/2);
  //console.log("#observedModeValue: " +observedMode );
  


  //See if the distribuion fits better by shifting the mode
//logger.info("scale: " + scale + " binWidth: " + binWidth);
  var nbetaBins=Math.floor(scale/binWidth);
  var hist=new Array(nbetaBins);
  var histBinWidth=scale / nbetaBins;
  for(var i=0;i<nbetaBins;i++){
    hist[i]=0;
  }

  //console.log("#nbetabins: " + nbetaBins);


  for(var i=0;i< 1000000;i++){
    
    var sample=(scale * jStat.beta.sample(alpha,beta)); 
    var sampleI=Math.floor( sample /histBinWidth);
    //console.log("sample: " + sample + " sampleI: " + sampleI);
    hist[sampleI]=hist[sampleI] + 1;

  }

  var betaModeMax=0;
  var betaModeIndex=0;
  for(var i=0;i<nbetaBins;i++){
    var x=hist[i];
    if(x > betaModeMax){
      betaModeMax=x;
      betaModeIndex=i;
    }
  }

  var modeShift=betaModeIndex - modeIndex;

  var minError=Number.MAX_SAFE_INTEGER;
  var modeIncrement=0;

  var errors=new Array();
  
    for(var i=-5;i<6;i++){
      var error=calculateError(bins,predictions.length,hist,1000000,modeShift,i);
      errors.push(error);
      if(error < minError){
        minError=error;
        modeIncrement=i;
      }

    }
    if(nObs < 10){
      if(modeIncrement > 2)modeIncrement=2;
      if(modeIncrement < -2)modeIncrement=-2;

    }
  if(nObs < 20)modeIncrement=0; //ignore if we have fewer than 10 observations

//console.log("#betaModeMax: " + betaModeMax + " betaModeIndex: " + betaModeIndex + " modeShift: " + modeShift);
  //ignore if it doesn't improve error by > 0.15
  var errorCorrection=(errors[5]-minError )/ errors[5];

  if(errorCorrection < 0.15)modeIncrement=0;
  
 rval={
    "min": min,
    "max": max,
    "mode": observedMode,
    "predictedMode": predictedMode,
    "scale":scale,
    "modeTranslate":observedMode-predictedMode,
    "modeIncrement":modeIncrement,
    "binWidth":binWidth,
    "bins": bins,
    "hist":hist,
    "histBinWidth":histBinWidth,
    "errors": errors,
    "errorCorrection": errorCorrection
  }

  return(rval);
}

function modeCount(bins,maxCount){
  var count=0;
  for(var i=0;i< bins.length;i++){
    if(bins[i]==maxCount)count++;
  }
 // console.log(maxCount + JSON.stringify(bins) + count);
  return(count);


}


function doMonteCarlo(horses,nwinners){
 for(horsename in horses){
        var horse=horses[horsename];
          horse.trialsResults={
            first:0,
            second:0,
            third:0,
            fourth:0,
            fifth:0,
            sixth:0,
          }
    }

  for(var trial=0;trial<nconf.get('montecarlotrials');trial++){
    var samples=[];
    for(horsename in horses){

      var horse=horses[horsename];
      //console.log(horsename + " status: " + horse.status);
      if(horse.status!=='REMOVED'){
        var sample=jStat.beta.sample(alpha,beta);
        var distribution=horse.distribution;
        var predictedSpeed= loc + distribution.modeTranslate + (sample * distribution.scale) - (distribution.modeIncrement * distribution.binWidth);
        var predictionObject={
          horse:horse,
          speed:predictedSpeed
        }
        samples.push(predictionObject);

      }
    }
    samples.sort(function(a,b){
        if(a.speed < b.speed)return(1);
        if(a.speed > b.speed)return(-1);
        return(0);
      });
   // console.log(JSON.stringify(samples));
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
        if(i==4){
          sample.horse.trialsResults.fifth =sample.horse.trialsResults.fifth + 1;
        }
        if(i==5){
          sample.horse.trialsResults.sixth =sample.horse.trialsResults.sixth + 1;
        }
      }

  }
  //calculate probabilities
   for(horsename in horses){
        var horse=horses[horsename];
        if(horse.status != "REMOVED"){
          if(nwinners==1){        //it's a win market
             horse.winProbability= horse.trialsResults.first /nconf.get('montecarlotrials');
             horse.winLayReturn=((1-horse.winProbability)/(1-(1/horse.bestLayWinPrice))) -1;
             horse.winBackReturn=(horse.winProbability/(1/horse.bestBackWinPrice)-1)
          }
          else if(nwinners==2){
             horse.placeProbability= (horse.trialsResults.first+ horse.trialsResults.second) /nconf.get('montecarlotrials');
              horse.placeLayReturn=((1-horse.placeProbability)/(1-(1/horse.bestLayPlacePrice))) -1;
             horse.placeBackReturn=(horse.placeProbability/(1/horse.bestBackPlacePrice)-1)
          }
          else if(nwinners==3){
             horse.placeProbability= (horse.trialsResults.first+ horse.trialsResults.second + horse.trialsResults.third) /nconf.get('montecarlotrials');
             horse.placeLayReturn=((1-horse.placeProbability)/(1-(1/horse.bestLayPlacePrice))) -1;
             horse.placeBackReturn=(horse.placeProbability/(1/horse.bestBackPlacePrice)-1)
          }
          else if(nwinners==4){
             horse.placeProbability= (horse.trialsResults.first+ horse.trialsResults.second + horse.trialsResults.third + horse.trialsResults.fourth) /nconf.get('montecarlotrials');
             horse.placeLayReturn=((1-horse.placeProbability)/(1-(1/horse.bestLayPlacePrice))) -1;
             horse.placeBackReturn=(horse.placeProbability/(1/horse.bestBackPlacePrice)-1)
          }
          else if(nwinners==5){
             horse.placeProbability= (horse.trialsResults.first+ horse.trialsResults.second + horse.trialsResults.third + horse.trialsResults.fourth + horse.trialsResults.fifth) /nconf.get('montecarlotrials');
              horse.placeLayReturn=((1-horse.placeProbability)/(1-(1/horse.bestLayPlacePrice))) -1;
             horse.placeBackReturn=(horse.placeProbability/(1/horse.bestBackPlacePrice)-1)
          }

          else if(nwinners==6){
             horse.placeProbability= (horse.trialsResults.first+ horse.trialsResults.second + horse.trialsResults.third + horse.trialsResults.fourth + horse.trialsResults.fifth + horse.trialsResults.sixth) /nconf.get('montecarlotrials');
             horse.placeLayReturn=((1-horse.placeProbability)/(1-(1/horse.bestLayPlacePrice))) -1;
             horse.placeBackReturn=(horse.placeProbability/(1/horse.bestBackPlacePrice)-1)
          }
          
          // logger.info(horse.name + " " + horse.trialsResults.winProbablity + " " + horse.trialsResults.placeProbablity);
        }

    
       
    }
}

function calculateError(bins,nobs,hist,nsamples,shift,increment){
  var errorSum=0.0;
  for(var i=0;i<bins.length;i++){
    var correspondingIndex= i + shift + increment;
    //console.log(i + "(" + bins[i] +  ") corresponds to " + correspondingIndex + " (" + hist[correspondingIndex] + ")");
    var nExpected=(hist[correspondingIndex] / nsamples) * nobs;
    var err= Math.abs(bins[i]-nExpected);
    //console.log("expected: " + nExpected + " observed: " + bins[i] + " err: " + err);
    errorSum+=err;
  }
  //console.log("increment: " + increment + " error: " + errorSum);
  return(errorSum);
}

function outputToMonitorObject(db,cdObject){
  //logger.info(JSON.stringify(cdObject));
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
        distribution:horse.distribution,
        predictions:horse.predictions,
        rphorseid:horseid
      }
      obj.horses[horse.name]=horseObj;

  }
  //logger.info(JSON.stringify(obj));
  db.collection("tomonitor").insert(obj,function(err,res){
    process.exit();
  });

}




