//Generate some test bets
//all horse with form before a given time period
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
     "code":'FLAT',
     "dateOffset":36000, //form in last 90 days,
     "standardDeviation": 0.1,
     "gpnodepath":"../../Node/node.js",
      "montecarlotrials":100000,
      "goingmappings":{"Firm":-3,"Good To Firm":-2,"Standard":-1,"Good":-1,"Good To Soft":0,"Good To Yielding":-1,"Standard To Slow":0,"Yielding":1,"Yielding To Soft":1,"Soft":1,"Soft To Heavy":2,"Heavy":3},
       "variables":['speed1','distance1','distance2','distancediff','weight1','weight2','weightdiff','going1','going2','goingdiff','type1','type2','typediff'],
       'functionSet':['+','-','*','/','^','if<='],
      "flatrule":["-","-","-","^",-2.2635,8.0547,"*",4.9096,"/","+",-8.7345,"*","distance2","goingdiff","-","if<=","weightdiff",-8.7345,"*",4.9096,"if<=",7.3357,"distancediff",-2.2635,"if<=",-1.4868,"weight2",-2.2635,"-","if<=","weightdiff","^","if<=",-1.4868,"weight2",-2.2635,"*","if<=","-","if<=","weightdiff","speed1","weight2","distance1","*",4.9096,"distancediff","weight2","distance1",7.3357,"distancediff",8.0547,"going1",7.3357,"-","+","if<=","*","+","+","if<=","distance1","/","^","if<=",-1.4868,"-","if<=","+",-1.4868,"weight2","weightdiff","speed1","weight1","^","^","distance1",-2.2635,"^","*","-",-2.7546,"distance1","/",2.5947,8.0547,"*","distance1","goingdiff",-2.2635,"/",2.3792,-3.4093,"speed1","+",-3.1683,"+","/",2.8033,"goingdiff","distance2",4.9096,"weight2","-","if<=","distance1","-","distancediff","*",4.9096,"/","-","^","-","if<=","distance1","going1","distance2","weight2","if<=","^","*","+","distance1","distance1","*","if<=",-0.0999,-2.5417,"goingdiff","distancediff","*","going1",-8.7345,"/","if<=",-1.4868,"weight2",-2.2635,"*","if<=","*",4.9096,"distancediff",-0.0999,"distancediff","distance2",-2.4760,"distance2","*","if<=",-2.2635,"goingdiff","going1","distancediff","*",8.0547,-8.7345,"+","^",-2.7546,-0.7124,"*",-2.2635,"goingdiff","weight2","/","going2","goingdiff","-","+","+","if<=","distance1","-","-","^","if<=",-1.4868,8.0547,-2.2635,"^",-2.2635,8.0547,8.0547,"+","if<=",-5.2669,-6.6087,"going1",-2.6198,"going2","distance2",4.9096,"weight2","-","if<=","distance1",-1.9041,-2.5417,"if<=","^","*","+","goingdiff","distance1","*","if<=",-0.0999,-2.5417,"going1","distancediff","*","going1","distance1","/","going2","goingdiff","*","if<=","distance2","weight2","going1","distancediff","distance2","+","^",-7.9920,8.0547,"distance1","-","-","^",-2.2635,8.0547,"if<=","distance1","going1","speed1","/","*","distance2","goingdiff","-","weight2","*",4.9096,-2.4760,"*",4.9096,"distancediff","if<=","^","*","+",-0.7124,"/","*","distance2","goingdiff","-","if<=","weightdiff","speed1","*","distance1","goingdiff",7.3357,"*","distancediff",-2.4760,"*","if<=",-0.0999,-2.5417,"going1","distancediff","*","going1","going1",-7.9920,"weight2","+","distancediff","*","distance2","goingdiff",-1.4868,-9.2846,"if<=","*",4.9096,"distancediff","distance1","distance1",-2.2635,"-","if<=","weightdiff","speed1","weight2",7.3357,"*",4.9096,-2.4760,-2.5417,"weight2","distance1",-9.2846,"distancediff","*",4.9096,"distance1","distancediff","distance2",-0.7124,"distance1","*",4.9096,-2.4760,"*","distancediff",-2.7546,"*",4.9096,"distancediff","*","distance1","goingdiff"],
      "jumpsrule":["+","+","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=",4.3861,"speed1","weightdiff",4.3859,"/",4.3861,"type2","*","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/",4.3861,"type2","*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-",6.3901,"/",-9.5462,0.1577,-9.6067,"distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,0.1577,4.3859,"/","distancediff","type2","*","*",-6.8748,"*",-9.6067,"going2",5.0496,"if<=","+",4.7778,-6.6693,"+",-8.6235,-0.6790,"+","weightdiff","going2","^","going2","*","distance1","distancediff","-","^",4.3861,-5.4509,"^",-4.4569,"distancediff","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"*","*",-3.7677,"*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-","/","-","/","-","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,"distancediff","^",-0.9028,-6.8748,-6.5566,"weight1","/",-9.5462,0.1577,-9.6067,"-","-",6.3901,-0.9028,-0.9028,"typediff","/",5.5662,"type2","*","distance1","distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/","^","goingdiff",7.4575,"type2","*","*",-6.8748,"if<=",4.3861,6.4425,"weightdiff",4.3859,"*","distance1","distancediff","if<=","+",4.7778,-6.6693,"+","-",6.3901,-0.9028,-0.6790,"+","weightdiff","going2","^","going2","*","distance1","distancediff","-","^",4.3861,-5.4509,"^",-4.4569,"distancediff","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"+","+","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=",4.3861,"speed1","weightdiff",4.3859,"/",4.3861,"type2","*","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/",4.3861,"type2","*",-8.6235,"*","if<=","goingdiff","going2","goingdiff",-8.6235,-9.6067,"distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/","distancediff","type2","*","*",-6.8748,"*",-9.6067,"going2","*","distance1","distancediff","if<=","+",4.7778,-6.6693,"+",-8.6235,"distancediff","+","weightdiff","going2","^","distancediff","*","distance1","distancediff","-","^",4.3861,-5.4509,"^",-4.4569,"distancediff","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"*","*",-3.7677,"*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-","/","-","/","-","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,"distancediff","^",-0.9028,-6.8748,-6.5566,"weight1","/",-9.5462,0.1577,-9.6067,"-","-",6.3901,-0.9028,-0.9028,"typediff","/",4.3861,"type2","*","distance1","distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/","^","goingdiff",7.4575,"type2","*","*",-6.8748,"if<=",4.3861,6.4425,"weightdiff",4.3859,"*","distance1","distancediff","if<=",4.3861,"speed1","weightdiff",4.3859,"-","^",4.3861,-5.4509,"^",-4.4569,"going2","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"*","*",-3.7677,"*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-","/","-","/","-",5.5662,"distancediff","^",-0.9028,-6.8748,-6.5566,"^",4.3861,-5.4509,"/",-9.5462,0.1577,-9.5462,"-","-",6.3901,-0.9028,-0.9028,"typediff","-",5.5662,"distancediff",-9.6067,"typediff","-",5.5662,"distancediff",-9.6067]

        });



var collections=["races","horses","trainingset","bets","testbets"];
var databaseUrl=nconf.get("databaseurl");
var db = require("mongojs").connect(databaseUrl, collections);
var goingMappings={"Firm":-3,"Good To Firm":-2,"Standard":-1,"Good":-1,"Good To Soft":0,"Good To Yielding":-1,"Standard To Slow":0,"Yielding":1,"Yielding To Soft":1,"Soft":1,"Soft To Heavy":2,"Heavy":3,"Very Soft":3}
var gpnode=require(nconf.get("gpnodepath"));
gaussian=require('gaussian');



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

//var betCursor=db.bets.find({rpraceid:{$exists:true},horseids:{$exists:true},marketType:'WIN',racetype:'FLAT',testgenerated:{$exists:false}}).limit(400);
var betCursor=db.bets.find({rpraceid:{$exists:true},marketType:'WIN',racetype:'FLAT',testgenerated:{$exists:false}}).limit(400);

var betsCount=0;
var betsOutCount=0;

doProcessOneBet();

function doProcessOneBet(){
  betCursor.next(function(err, bet) {
     if(bet){
      logger.info("doProcessOneBet " + betsCount++);
      //logger.info(JSON.stringify(bet));

      db.bets.update({_id:db.ObjectId(bet._id)},{$set:{testgenerated:true}},function(err){

        db.races.findOne({_id:bet.rpraceid},function(err, race){

        if(race==null){
          doProcessOneBet();
        }
        else{
        bet.going=race.going;
        bet.distance=race.distance;

           var offtimeDateTo=new Date(bet.offtime);
           var offtimeDateFrom=new Date(moment(offtimeDateTo).subtract(nconf.get('dateOffset'),'d'));
          // logger.info(bet.rpraceid + " offtimeDateTo: " + offtimeDateTo + " offtimeDateFrom: " + offtimeDateFrom);
           var horses=bet.horses;
           var horsesArray=new Array();
           for(var horsename in horses){
              var horse=horses[horsename];
              horse.name=horsename;
              horsesArray.push(horse);
              
           }
           var theHorses=getHorseForm(horsesArray,offtimeDateFrom,offtimeDateTo,nconf.get("code"),bet,new Array());
         }
          // logger.info(JSON.stringify(theHorses));
    });



      });
    }
    else{
         logger.info('done all bets');
    }
  });

}


function doProcessOneBetOld(){
	betCursor.next(function(err, bet) {
     if(bet){
      logger.info("doProcessOneBet " + betsCount++);
      //logger.info(JSON.stringify(bet));
     	//go get related race, to pick up distance and going

     	db.races.findOne({_id:bet.rpraceid},function(err, race){

        if(race==null){
          doProcessOneBet();
        }
        else{
     		bet.going=race.going;
     		bet.distance=race.distance;

		       var offtimeDateTo=new Date(bet.offtime);
		       var offtimeDateFrom=new Date(moment(offtimeDateTo).subtract(nconf.get('dateOffset'),'d'));
		      // logger.info(bet.rpraceid + " offtimeDateTo: " + offtimeDateTo + " offtimeDateFrom: " + offtimeDateFrom);
		       var horses=bet.horses;
		       var horsesArray=new Array();
		       for(var horsename in horses){
			       	var horse=horses[horsename];
			       	horse.name=horsename;
			       	horsesArray.push(horse);
			       	
		       }
		       var theHorses=getHorseForm(horsesArray,offtimeDateFrom,offtimeDateTo,nconf.get("code"),bet,new Array());
         }
		      // logger.info(JSON.stringify(theHorses));
		});
    
    }
    else{
      //process.exit();
      doProcessOneBet();
      logger.info('done all bets');
    }

  })

}



//Get the form for a given horse between two dates 
function getHorseForm(horses,dateFrom,dateTo,code,bet,performancesArray){
			//logger.info(JSON.stringify(performancesArray));
			var horse =horses.pop();
     // logger.info("getHorseForm : " + JSON.stringify(horse));
			if(typeof horse == 'undefined'){
				doPredictions(bet,performancesArray);
				return;
			}
      var horseid=horse.rphorseid;
     // logger.info("Get Horseid: " + horseid);
      if(horse.status=='REMOVED'){
        getHorseForm(horses,dateFrom,dateTo,code,bet,performancesArray);//process the next one
      }
      else if(typeof horseid=='undefined'){ //no rpid for this horse: give up
        logger.error('undefined rphorseid: ' + JSON.stringify(horse));
        logger.error('in bet: ' + JSON.stringify(bet));
        doProcessOneBet();          //and process the next bet
      }
      else{
			
			var horseName=horse.name;
			//logger.info("Get HorseForm: " + horseid);

			var performancesToReturn =new Array();
			db.horses.findOne({_id:horseid},function(err,thishorse){
        //logger.info("horseid" + horseid);
        //logger.info("horse record: " + JSON.stringify(horse));
					var performances=thishorse.performances;
          var weightThisRace;
					for(var performance in performances){

						var performanceData=performances[performance];
            if(performance==bet.rpraceid){ //this is the prrformance we are trying to predict
              weightThisRace=performanceData.weight;//set the weight carried by the horse in the to-be-predicted race
            }
            else{//don't want this performance
						//logger.info("Performance data: " + JSON.stringify(performanceData));
						if(((code == 'FLAT')&&(performanceData.racetype=='FLAT'))||
							(code=='JUMPS'&& (performanceData.racetype=='CHASE' || performanceData.racetype=='HURDLE'))) { //make sure it's the correct code

							if((performanceData.date < dateTo)&&(performanceData.date > dateFrom)){//check dates
								performancesToReturn.push(performanceData);
							}

						}
          }

					}
					//logger.info(JSON.stringify(performancesToReturn));
					var horseObject={
						horsename:horseName,
						rphorseid:horseid,
						performances:performancesToReturn,
            weightCarried:weightThisRace,
            bestBackWinPrice:horse.bestBackWinPrice,
            bestLayWinPrice:horse.bestLayWinPrice,
            status:horse.status
					}
					//logger.info("HORSE OBJECT: " + JSON.stringify(horseObject));
					performancesArray.push(horseObject)
					getHorseForm(horses,dateFrom,dateTo,code,bet,performancesArray);

			});
      }

	


}

function doPredictions(bet,performances){

	//logger.info('doPredictions');
	//logger.info("BET: " + JSON.stringify(bet));
	//logger.info("Performances: " + JSON.stringify(performances));
  for(var i=0;i<performances.length;i++){
    var horse=performances[i];    //details of a particular horse, including it's performances
    horse.predictedPerformances=new Array();
   // logger.info("Horse: " + JSON.stringify(horse))
    var horsePerformancesArray=horse.performances;
    
    for(var j=0;j<horsePerformancesArray.length;j++){
      var performance=horsePerformancesArray[j];
      if(performance.speed < 30.0 && !isNaN(parseInt(performance.position))){
            var moment1=moment(performance.date);
            var moment2=moment(bet.offtime);
            var diffDays = moment2.diff(moment1, 'days');
            var perfObject={
              horseid:horse.rphorseid,
              name:horse.name,
              raceid:bet.rpraceid,
              speed1:performance.speed,
              datediff:diffDays,
              going1:nconf.get('goingmappings')[performance.going],
              going2:nconf.get('goingmappings')[bet.going],
              goingdiff:nconf.get('goingmappings')[bet.going]-nconf.get('goingmappings')[performance.going],
              distance1:performance.distance,
              distance2:bet.distance,
              distancediff:bet.distance-performance.distance,
              weight1:performance.weight,
              weight2:horse.weightCarried,
              weightdiff:horse.weightCarried-performance.weight,
              type1:1,//perfRaceType,
              type2:1,//cardRaceType,
              typediff:0,//cardRaceType-perfRaceType,
              racetype:performance.racetype,
              surface:performance.surface

            }

            //now do the prediction
            var predictNode=new gpnode.parseNode(nconf.get('flatrule'));
            var val=predictNode.eval(perfObject);
            var s1=perfObject.speed1;
            var predictedPerf= s1 + ((s1*val)/100000);
            //logger.info('predicted: ' +predicted);
            horse.predictedPerformances.push(predictedPerf);
            //logger.info("Horse predicted performance: " + predictedPerf);

    }
    //logger.info(JSON.stringify(perfObject));





   
      
      /*NB IT IS FLAT*/
    /*  predictNode=new gpnode.parseNode(nconf.get('flatrule'));
      var performance=horsePerformancesArray[j];
      var val=predictNode.eval(perf);
      var s1=perf.speed1;
      var predictedPerf= s1 + ((s1*val)/100000);
      //logger.info('predicted: ' +predicted);
      horse.predictedPerformances.push(predictedPerf);
      



     logger.info("performance for: " + horse.horsename);
     logger.info(JSON.stringify(performance));*/
     
    }
  }
   for(var i=0;i<performances.length;i++){
    var horse=performances[i];    //details of a particular horse, including it's performances



   // logger.info(horse.horsename);
  //  logger.info(JSON.stringify(horse.predictedPerformances));
    total=0;
    var predictedPerformances=horse.predictedPerformances;
    for(var j=0;j<predictedPerformances.length;j++){
      total+=predictedPerformances[j]
    }
    horse.meanPredicted=total/predictedPerformances.length;
 //   logger.info(horse.meanPredicted);

    var theSd=horse.meanPredicted *nconf.get("standardDeviation");

    horse.gaussianDistribution=gaussian(horse.meanPredicted,theSd * theSd);
          horse.trialsResults={
            first:0,
            second:0,
            third:0,
            fourth:0,
            winProbablity:0.0,
            placeProbability:0.0
          }
  }
  doMonteCarlo(performances,bet);

}

//var perfs=getHorseForm('850931',new Date("2016-01-01T00:00:00.000Z"),new Date("2016-06-30T00:00:00.000Z"),'FLAT');


function doMonteCarlo(horses,bet){

  //prepare the bet Object

  var betObject={
    marketType:bet.marketType,
    betType:bet.betType,
    racetype:bet.racetype,
    venue:bet.venue,
    rpraceid:bet.rpraceid,
    offtime:bet.offtime,
    horses:{}

  }

  var nhorses=Object.keys(horses).length;
  for(var trial=0;trial<nconf.get('montecarlotrials');trial++){
      var samples=[];
      //for(horseid in horses){
        for(var j=0;j<horses.length;j++){
        var horse=horses[j];
        var dist=horse.gaussianDistribution;
        var predictedSpeed=dist.ppf(Math.random());
        var predictionObject={
          horse:horse,
          mcPredictedSpeed:predictedSpeed
        }
        samples.push(predictionObject);

        
      }


      samples.sort(function(a,b){
        if(a.mcPredictedSpeed < b.mcPredictedSpeed)return(1);
        if(a.mcPredictedSpeed > b.mcPredictedSpeed)return(-1);
        return(0);
      });
   //   logger.info("samples: " + JSON.stringify(samples));

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

  //logger.info(JSON.stringify(horses));
  //calculate probabilities
   //for(horseid in horses){
    for(var j=0;j<horses.length;j++){
        var horse=horses[j];
        horse.trialsResults.winProbablity= horse.trialsResults.first /nconf.get('montecarlotrials');
        //logger.info(horse.horsename + " " + horse.trialsResults.winProbablity);

        var prob=horse.trialsResults.winProbablity;
        var wbr=prob/(1/horse.bestBackWinPrice)-1;
        var wlr=((1-prob)/(1-(1/horse.bestLayWinPrice))) -1
        //logger.info(prob + " " + wbr + " " + wlr);

        //prepare horseObject
        var horseObject={
          status:horse.status,
          bestBackWinPrice:horse.bestBackWinPrice,
          bestLayWinPrice:horse.bestLayWinPrice,
          winProbability:horse.trialsResults.winProbablity,
          winBackReturn:wbr,
          winLayReturn:wlr,
          rphorseid:horse.rphorseid

        }
        betObject.horses[horse.horsename]=horseObject;

    }
    //doProcessOneBet();

    //logger.info(JSON.stringify(betObject));
    db.testbets.insert(betObject,function(err,bet){
        logger.info("OutputOneBet " + betsOutCount++);
          //logger.info("Inserted bet: " + bet._id);
          doProcessOneBet();

    });

    

}


