 var moment=require('moment');
var jStat = require('jStat').jStat;
var httpRequest = require('request');
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
    "test":true, //don't add to database
  
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
      "variables":['speed1','distance1','distance2','distancediff','weight1','weight2','weightdiff','going1','going2','goingdiff'],
       'functionSet':['+','-','*','/','^','if<='],
      //"rule":["-","-","-","^",-2.2635,8.0547,"*",4.9096,"/","+",-8.7345,"*","distance2","goingdiff","-","if<=","weightdiff",-8.7345,"*",4.9096,"if<=",7.3357,"distancediff",-2.2635,"if<=",-1.4868,"weight2",-2.2635,"-","if<=","weightdiff","^","if<=",-1.4868,"weight2",-2.2635,"*","if<=","-","if<=","weightdiff","speed1","weight2","distance1","*",4.9096,"distancediff","weight2","distance1",7.3357,"distancediff",8.0547,"going1",7.3357,"-","+","if<=","*","+","+","if<=","distance1","/","^","if<=",-1.4868,"-","if<=","+",-1.4868,"weight2","weightdiff","speed1","weight1","^","^","distance1",-2.2635,"^","*","-",-2.7546,"distance1","/",2.5947,8.0547,"*","distance1","goingdiff",-2.2635,"/",2.3792,-3.4093,"speed1","+",-3.1683,"+","/",2.8033,"goingdiff","distance2",4.9096,"weight2","-","if<=","distance1","-","distancediff","*",4.9096,"/","-","^","-","if<=","distance1","going1","distance2","weight2","if<=","^","*","+","distance1","distance1","*","if<=",-0.0999,-2.5417,"goingdiff","distancediff","*","going1",-8.7345,"/","if<=",-1.4868,"weight2",-2.2635,"*","if<=","*",4.9096,"distancediff",-0.0999,"distancediff","distance2",-2.4760,"distance2","*","if<=",-2.2635,"goingdiff","going1","distancediff","*",8.0547,-8.7345,"+","^",-2.7546,-0.7124,"*",-2.2635,"goingdiff","weight2","/","going2","goingdiff","-","+","+","if<=","distance1","-","-","^","if<=",-1.4868,8.0547,-2.2635,"^",-2.2635,8.0547,8.0547,"+","if<=",-5.2669,-6.6087,"going1",-2.6198,"going2","distance2",4.9096,"weight2","-","if<=","distance1",-1.9041,-2.5417,"if<=","^","*","+","goingdiff","distance1","*","if<=",-0.0999,-2.5417,"going1","distancediff","*","going1","distance1","/","going2","goingdiff","*","if<=","distance2","weight2","going1","distancediff","distance2","+","^",-7.9920,8.0547,"distance1","-","-","^",-2.2635,8.0547,"if<=","distance1","going1","speed1","/","*","distance2","goingdiff","-","weight2","*",4.9096,-2.4760,"*",4.9096,"distancediff","if<=","^","*","+",-0.7124,"/","*","distance2","goingdiff","-","if<=","weightdiff","speed1","*","distance1","goingdiff",7.3357,"*","distancediff",-2.4760,"*","if<=",-0.0999,-2.5417,"going1","distancediff","*","going1","going1",-7.9920,"weight2","+","distancediff","*","distance2","goingdiff",-1.4868,-9.2846,"if<=","*",4.9096,"distancediff","distance1","distance1",-2.2635,"-","if<=","weightdiff","speed1","weight2",7.3357,"*",4.9096,-2.4760,-2.5417,"weight2","distance1",-9.2846,"distancediff","*",4.9096,"distance1","distancediff","distance2",-0.7124,"distance1","*",4.9096,-2.4760,"*","distancediff",-2.7546,"*",4.9096,"distancediff","*","distance1","goingdiff"],
      "flatrule":["+","*","-","*","if<=","speed1","if<=","weight1",6.5858,"^",-6.4670,"/","*",-7.2541,-3.6690,"if<=","weight2",0.2758,"-","-",6.5858,"weight2","/","*","*","-",-4.1061,"weight2","distancediff","+",5.2645,5.8362,"if<=","speed1",0.2758,"weight1","weight1","weight1","+",5.2645,5.8362,"*","*",5.2645,"if<=","*","weight1","*",6.6996,"distancediff","if<=","/","*","*","*","*","-","-",-6.4670,"if<=","*","goingdiff",0.6722,"goingdiff","speed1",6.6996,"weight2","distancediff","+",5.2645,5.8362,"distancediff","+",5.2645,5.8362,"if<=","speed1",0.2758,"weight1","weight1","if<=","weight1",6.5858,"^",5.2645,"+","weight2","distancediff",6.6996,"*","*",5.2645,"if<=","*",0.6722,"goingdiff",0.2758,-3.6690,"weight1",0.6722,"weight1","weight2","weight1",0.6722,"weight1","-",-6.4670,"if<=","*","goingdiff","speed1",0.6722,"speed1","speed1","distance1","goingdiff","/","*","*","-","-",-6.4670,"*",-7.2541,-3.6690,"weight2","distancediff","+",5.2645,5.2645,"if<=","speed1",0.2758,"weight1","if<=","speed1","goingdiff",-3.6690,"weight1"],
      "jumpsrule":["+","+","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=",4.3861,"speed1","weightdiff",4.3859,"/",4.3861,"type2","*","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/",4.3861,"type2","*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-",6.3901,"/",-9.5462,0.1577,-9.6067,"distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,0.1577,4.3859,"/","distancediff","type2","*","*",-6.8748,"*",-9.6067,"going2",5.0496,"if<=","+",4.7778,-6.6693,"+",-8.6235,-0.6790,"+","weightdiff","going2","^","going2","*","distance1","distancediff","-","^",4.3861,-5.4509,"^",-4.4569,"distancediff","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"*","*",-3.7677,"*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-","/","-","/","-","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,"distancediff","^",-0.9028,-6.8748,-6.5566,"weight1","/",-9.5462,0.1577,-9.6067,"-","-",6.3901,-0.9028,-0.9028,"typediff","/",5.5662,"type2","*","distance1","distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/","^","goingdiff",7.4575,"type2","*","*",-6.8748,"if<=",4.3861,6.4425,"weightdiff",4.3859,"*","distance1","distancediff","if<=","+",4.7778,-6.6693,"+","-",6.3901,-0.9028,-0.6790,"+","weightdiff","going2","^","going2","*","distance1","distancediff","-","^",4.3861,-5.4509,"^",-4.4569,"distancediff","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"+","+","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=","-",6.3901,"distancediff","/","/",-3.7677,"/","weight2",-0.9028,"^","+",5.3409,"type1","if<=",-6.3143,5.8571,"speed1","if<=","if<=","+","goingdiff","weight1","if<=",4.3861,"speed1","weightdiff",4.3859,"/",4.3861,"type2","*","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/",4.3861,"type2","*",-8.6235,"*","if<=","goingdiff","going2","goingdiff",-8.6235,-9.6067,"distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/","distancediff","type2","*","*",-6.8748,"*",-9.6067,"going2","*","distance1","distancediff","if<=","+",4.7778,-6.6693,"+",-8.6235,"distancediff","+","weightdiff","going2","^","distancediff","*","distance1","distancediff","-","^",4.3861,-5.4509,"^",-4.4569,"distancediff","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"*","*",-3.7677,"*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-","/","-","/","-","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,"distancediff","^",-0.9028,-6.8748,-6.5566,"weight1","/",-9.5462,0.1577,-9.6067,"-","-",6.3901,-0.9028,-0.9028,"typediff","/",4.3861,"type2","*","distance1","distancediff",0.1577,"if<=","if<=","+","goingdiff","weight1","if<=",4.3861,6.4425,"weightdiff",4.3859,"/","^","goingdiff",7.4575,"type2","*","*",-6.8748,"if<=",4.3861,6.4425,"weightdiff",4.3859,"*","distance1","distancediff","if<=",4.3861,"speed1","weightdiff",4.3859,"-","^",4.3861,-5.4509,"^",-4.4569,"going2","*","if<=",7.3979,"speed1",-2.9964,5.0496,-8.6235,5.8571,"*","*",-3.7677,"*",-8.6235,"*","if<=","goingdiff","going2","goingdiff","-","/","-","/","-",5.5662,"distancediff","^",-0.9028,-6.8748,-6.5566,"^",4.3861,-5.4509,"/",-9.5462,0.1577,-9.5462,"-","-",6.3901,-0.9028,-0.9028,"typediff","-",5.5662,"distancediff",-9.6067,"typediff","-",5.5662,"distancediff",-9.6067],
      "distancepm": 10, //+- 10m
      "weightpm":0,    //+= 0lbs
       "minfofx": -123249.31077344337,
      "maxfofx": 85296.35009281096,
      "alpha": 161,
      "beta": 25,
      "loc":-2.5,
      "scale":21.2,//9.869,
       "montecarlotrials":100000,
      "apikey":"goes here",
      "testProbs":{
          "Tangramm":{"win":0.1},
          "Trending":{"win":0.1},
          "Obboorr":{"win":0.05},
          "Midtech Star":{"win":0.1},
          "Tatawu":{"win":0.1},
          "Classic Mission":{"win":0.05},
          "Lean On Pete":{"win":0.1},
          "Surround Sound":{"win":0.1},
          "Ninepointsixthree":{"win":0.1},
          "Ring Eye":{"win":0.1}
          
      },
      "betconditions":{
        "FLAT":{
          "WIN":{
            "LAY":{
              "bet":true,
              "targetreturn":1.00,
              "minreturn":0.0,
              "minprobability":0.18

            },
            "BACK":{
              "bet":false
            }

          },
          "PLACE":{
            "LAY":{
              "bet":false

            },
            "BACK":{
              "bet":false

            }

          }

        },
        "HURDLE":{
          "WIN":{
            "LAY":{
              "bet":true,
              "targetreturn":1.05,
              "minreturn":0.05,
              "minprobability":0.24

            },
            "BACK":{
              "bet":false
            }

          },
          "PLACE":{
            "LAY":{
              "bet":false
            },
            "BACK":{
              "bet":false
            }

          }

        },
         "CHASE":{
          "WIN":{
            "LAY":{
              "bet":true,
              "targetreturn":1.05,
              "minreturn":0.05,
              "minprobability":0.24

            },
            "BACK":{
              "bet":false
            }

          },
          "PLACE":{
            "LAY":{
              "bet":false
            },
            "BACK":{
              "bet":false
            }

          }

        }

      },
       "montecarlotrials":100000
});

var collections=["races","horses","cards","tomonitor","bets"];
var databaseUrl=nconf.get("databaseurl");
//var db = require("mongojs").connect(databaseUrl, collections);
var MongoClient= require('mongodb').MongoClient;




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

var minfofx=nconf.get('minfofx');
var maxfofx=nconf.get('maxfofx');
var loc=nconf.get("loc");
var scale=nconf.get("scale");
var alpha=nconf.get('alpha');
var beta=nconf.get('beta');

//returns a sessiontoken
function bfLogin(raceid,marketid){

  logger.info("bfLogin: " + raceid + " marketid: " + marketid);

	httpRequest({
            url: "https://identitysso.betfair.com/api/login?username=" + nconf.get('bfusername') +"&password=" + nconf.get('bfpw'),
            method: "POST",  
            headers: {
			    'X-Application': nconf.get('apikey'),
			    'Accept': 'application/json'
			  },
			 json:true


        }, function (error, response, body){
          if(error){
            logger.error(JSON.stringify(error))
            //res.json({'status':'fail', 'message': 'Internal Server Error: ' + JSON.stringify(err)});
            return;
          }
            logger.info('response: '+response);
            logger.info("body: " + JSON.stringify(body));
            //logger.info("Token is: " + body.token);
            if(typeof raceid !== 'undefined'){
              getTomonitor(body.token,raceid.toString());
            }
            else if(marketid !== 'undefined'){
              getMarketResult(body.token,marketid.toFixed(9));
            }
           // getMarketIds(body.token,venue,offtime);


    });

}

function getTomonitor(token,raceid){
  var MongoClient= require('mongodb').MongoClient;
  MongoClient.connect("mongodb://" + databaseUrl,function(err,db){
    if(err) throw(err);
    if(typeof raceid !== 'undefined'){
    db.collection("tomonitor").findOne({'raceid':raceid},function(err,tomonitor){
          if(err){
        logger.error(JSON.stringify(err));
        return
      }
      if(tomonitor){
          getMarketIds(token,tomonitor.course.replace(' (IRE)',''),tomonitor.offtime.toISOString(),tomonitor.horses,tomonitor.surface,tomonitor.racetype,raceid);


      }
      else process.exit();
    })
  }
  else{
    process.exit();
  }
    
  });
  
}

var bets;

function getMarketIds(token,rpVenue,rpOfftime,horses,surface,racetype,raceid){
  logger.info("getMarketIds |" + rpVenue + "|");
	httpRequest({
            url: "https://api.betfair.com/exchange/betting/json-rpc/v1",
            method: "POST",  
            headers: {
			    'Accept': 'application/json',
			    'X-Application' : nconf.get('apikey'),
		        'Content-type' : 'application/json',
		        'X-Authentication' : token
			  },
			 body:{
			 	"jsonrpc":"2.0",
			 	"method":"SportsAPING/v1.0/listMarketCatalogue",
			 	 "params": {"filter":{"eventTypeIds": ["7"],
			 	 					"marketCountries":["GB","IE"],
			 	 					"marketTypeCodes":["WIN","PLACE"],
			 	 					"marketStartTime":{"from":new Date().toJSON()}},
			 	 					"sort":"FIRST_TO_START",
			 	 					"maxResults":"100",
			 	 					"marketProjection":["MARKET_START_TIME","EVENT","EVENT_TYPE","RUNNER_DESCRIPTION"]}, 
			 
			 	 "id": 1}, 
			 json:true


        }, function (error, response, body){
          if(error){
            logger.error(JSON.stringify(error))
            //res.json({'status':'fail', 'message': 'Internal Server Error: ' + JSON.stringify(err)});
            return;
          }
            //logger.info('response: '+JSON.stringify(response));
           // logger.info("body: " + JSON.stringify(body));
            var races=body.result;
            var requiredWinMarketid;
            var requiredPlaceMarketid;
            var runnersHash={};
            for(var i=0;i<races.length;i++){
            	var race=races[i];

              //build the hash of runners
              //if either of these has a value, we have the hash
            /*  if(typeof requiredPlaceMarketid !== 'undefined' || typeof requiredWinMarketid !== 'undefined'){

              }
              else{

                for(var j=0;j<race.runners.length;j++){
                  var runnerId=race.runners[j].selectionId;
                  var runnerName=race.runners[j].runnerName.toUpperCase();
                  runnersHash[runnerName]=runnerId;
                }
              }*/

             // logger.info(JSON.stringify(race));
            	var marketid=race.marketId;
            	var marketName=race.marketName;
            	var venue=race.event.venue.toUpperCase();
            	var offTime=race.marketStartTime;
              //var offTimeLocale=new Date(offTime).toLocaleString();
            	//logger.info("BF Offtime: " + offTime + " rpOfftime: " + rpOfftime);
              //logger.info("BF VEnue: " + venue);
              if(venue.indexOf("CHELMSFORD") !== -1){
                venue="CHELMSFORD";
              }
            	if(rpVenue.indexOf(venue)!==-1){
            		//logger.info("VENUES EQUAL ");
                 //logger.info(offTime);
                // logger.info("RP OFFTIME: " +rpOfftime);
                 var rpOfftimeMoment=moment(rpOfftime.replace('Z','')).toDate();
                 var bfOfftimeMoment=moment.utc(offTime).toDate();//.format('YYYY-MM-DD HH:mm:ss');
                // logger.info(typeof rpOfftime + " |" + rpOfftime + "|");
                // logger.info(typeof offTime + " |" + offTime + "|" +bfOfftimeMoment +"|" );
              //  logger.info("RP: " + rpOfftimeMoment);
               // logger.info("BF: " + bfOfftimeMoment);
                 if(rpOfftimeMoment.toString() == bfOfftimeMoment.toString()){
               //   logger.info("THE SAME OFFTIME")
                // }

            	//	if(rpOfftime===offTime){
            			//logger.info("TIMES EQUAL");
            			if(marketName=='To Be Placed')
            				requiredPlaceMarketid=marketid;
            			else requiredWinMarketid=marketid;
                  for(var j=0;j<race.runners.length;j++){
                    var runnerId=race.runners[j].selectionId;
                    var runnerName=race.runners[j].runnerName.toUpperCase();
                    runnersHash[runnerName]=runnerId;
                  }
            			//break;
            			//if(typeof requiredPlaceMarketid !== 'undefined' && typeof requiredWinMarketid !== 'undefined')
            			//	break;
            		}
            	}
            }

            logger.info("Required Win Marketid: " + requiredWinMarketid);
            logger.info("Required Place Marketid: " + requiredPlaceMarketid);


            bets=0;
            if(typeof requiredWinMarketid !== 'undefined'){
              bets++;
               getOdds(token,requiredWinMarketid,runnersHash,horses,rpVenue,rpOfftime,surface,racetype,raceid); 
            }
            if(typeof requiredPlaceMarketid !== 'undefined'){
              bets++;
              getOdds(token,requiredPlaceMarketid,runnersHash,horses,rpVenue,rpOfftime,surface,racetype,raceid);
            }
           

            
            


    });

}

function getMarketResult(token,marketid){
  logger.info("getMarketResult marketid: " + marketid);

  httpRequest({
            url: "https://api.betfair.com/exchange/betting/json-rpc/v1",
            method: "POST",  
            headers: {
          'Accept': 'application/json',
          'X-Application' : nconf.get('apikey'),
            'Content-type' : 'application/json',
            'X-Authentication' : token
        },
       body:{
        "jsonrpc":"2.0",
        "method":"SportsAPING/v1.0/listMarketBook",
         "params": {
            "marketIds":[marketid],
            "priceProjection":{"priceData":["EX_BEST_OFFERS"]}
         }, 
       
         "id": 1}, 
       json:true


        }, function (error, response, body){
          if(error){
            logger.error(JSON.stringify(error))
            //res.json({'status':'fail', 'message': 'Internal Server Error: ' + JSON.stringify(err)});
            return;
          }
          logger.info(JSON.stringify(response));
          logger.info(JSON.stringify(body));

          ///find the bet
          var MongoClient= require('mongodb').MongoClient;

          MongoClient.connect("mongodb://" + databaseUrl,function(err,db){
              if(err) throw(err);
              
              
         

              db.collection("betabets").findOne({marketid:marketid},function(err,bet){
                if(err){
                  logger.error(JSON.stringify(err));
                  process.exit();
                  return;
                }
                if(bet){
                  logger.info("bet found");
                  var isResult=false;
                  var horses=bet.horses;
                  var resultRunners=body.result[0].runners
                  for(var i=0;i<resultRunners.length;i++){
                    var resultRunner=resultRunners[i];
                    var bfid=resultRunner.selectionId;
                    var resultStatus=resultRunner.status;
                    if(resultStatus =="WINNER" || resultStatus=="LOSER"){
                      isResult=true;
                    }
                    logger.info(bfid + " " + resultStatus);
                    //iterate through my horses
                    for(horse in horses){
                      var horseObj=horses[horse];
                      logger.info("horseObj: " + JSON.stringify(horseObj));
                      if(horseObj.bfid){
                        if(horseObj.bfid.toString()==bfid){
                          horseObj.status=resultStatus
                        }
                      }
                    }
                  }
                 // logger.info("horses now: " + JSON.stringify(horses));

                 if(isResult){
                  db.collection("betabets").update({marketid:marketid},{$set:{horses:horses,result:true}},function(err){
                    process.exit();
                  });
                 }
                 else{
                  logger.error("couldn't process result for: " + marketid);
                  process.exit();//couldn't process this result

                 }
                  


                }
                else{
                  process.exit();
                }


              });
           });
          

        })
      
}


function getOdds(token,marketid,bfRunnersLookup,horses,venue,offtime,surface,racetype,rpraceid){
//var requestFilters = '{"marketIds":["' + marketId + '"],"priceProjection":{"priceData":["EX_BEST_OFFERS"],"exBestOfferOverRides":{"bestPricesDepth":2,"rollupModel":"STAKE","rollupLimit":20},"virtualise":false,"rolloverStakes":false},"orderProjection":"ALL","matchProjection":"ROLLED_UP_BY_PRICE"}';
//        var jsonRequest = constructJsonRpcRequest('listMarketBook', requestFilters );

  //logger.info("bfRunnersLookup:"+ JSON.stringify(bfRunnersLookup));
 // logger.info("horses:" + JSON.stringify(horses));

  httpRequest({
            url: "https://api.betfair.com/exchange/betting/json-rpc/v1",
            method: "POST",  
            headers: {
          'Accept': 'application/json',
          'X-Application' : nconf.get('apikey'),
            'Content-type' : 'application/json',
            'X-Authentication' : token
        },
       body:{
        "jsonrpc":"2.0",
        "method":"SportsAPING/v1.0/listMarketBook",
         "params": {
            "marketIds":[marketid],
            "priceProjection":{"priceData":["EX_BEST_OFFERS"]}
         }, 
       
         "id": 1}, 
       json:true


        }, function (error, response, body){
          if(error){
            logger.error(JSON.stringify(error))
            //res.json({'status':'fail', 'message': 'Internal Server Error: ' + JSON.stringify(err)});
            return;
          }
        //  logger.info(JSON.stringify(response));
        //  logger.info(JSON.stringify(body));
          var numberOfWinners=body.result[0].numberOfWinners;
         // logger.info("WINNERS: " + numberOfWinners);
        //  logger.info(JSON.stringify(bfRunnersLookup));
         // var testProbs=nconf.get('testProbs')
          for(runner in horses){
            //var runner=testProbs[prop];
            var runnerS=runner.replace(/´/g,'')
           horses[runner].bfid=bfRunnersLookup[runnerS];
            var layPrice=getBestPrice(runner,bfRunnersLookup[runnerS],'Lay',body.result[0].runners);
            var backPrice=getBestPrice(runner,bfRunnersLookup[runnerS],'Back',body.result[0].runners);
          //  var p=testProbs[runner].win;
          //  var layReturn=((1-p)/(1-(1/layPrice))) -1;
          //  var backReturn=(p/(1/backPrice)-1)
            horses[runner].status=layPrice.status;
            if(numberOfWinners > 1){
               horses[runner]["bestLayPlacePrice"]=layPrice.price;
               horses[runner]["layPlacePrices"]=layPrice.prices;
              horses[runner]["bestBackPlacePrice"]=backPrice.price;
              horses[runner]["backPlacePrices"]=backPrice.prices;

            }
            else{
              horses[runner]["bestLayWinPrice"]=layPrice.price;
              horses[runner]["layWinPrices"]=layPrice.prices;
              horses[runner]["bestBackWinPrice"]=backPrice.price;
              horses[runner]["backWinPrices"]=backPrice.prices;
            }
           
           // testProbs[runner]["backReturn"]=backReturn;

          }
          doMonteCarlo(horses,numberOfWinners);
         // logger.info(JSON.stringify(horses));
         var marketType="WIN";
          if(numberOfWinners > 1)
              marketType="PLACE";
         var betConditions=nconf.get('betconditions');

        // console.log("RACETYPE: " + racetype);
         var layBetConditions=betConditions[racetype][marketType]["LAY"];
         var backBetConditions=betConditions[racetype][marketType]["BACK"];

        // logger.info("layBetConditions: " + JSON.stringify(layBetConditions));
        // logger.info("backBetConditions: " + JSON.stringify(backBetConditions));
        if(nconf.get("test")){

        }
        else doBFBets(token,marketid,marketType,layBetConditions,backBetConditions,horses);

          
          var betObject={
            marketid: marketid,
            venue:venue,
            offtime:offtime,
            marketType:marketType,
            horses:horses,
            nwinners:numberOfWinners,
            surface:surface,
            racetype:racetype,
            rpraceid:rpraceid
          }
          logger.info(JSON.stringify(betObject));
          if(nconf.get("test")){
            //logger.info("TEST");
            bets--;
            if(bets==0){
              process.exit();
            }
          }
          else{
            var MongoClient= require('mongodb').MongoClient;

            MongoClient.connect("mongodb://" + databaseUrl,function(err,db){
                if(err) throw(err);
                
               db.collection("betabets").insert(betObject,function(err,bet){
                    bets--;
                    if(bets==0){
                      process.exit();
                    }

                  });
                }); 

            };

           

        })
      
}

function getBestPrice(runner,runnerid,borl,marketData){
  //logger.info(JSON.stringify(marketData));

//logger.info("getBestPrice: " + JSON.stringify(runner) + " " + runnerid + " " + borl + " ");
  

  for(var i=0;i< marketData.length;i++){
    var marketRunner=marketData[i];
   // logger.info("marketRunner: " + JSON.stringify(marketRunner));
    var rid=marketRunner.selectionId;
    var status=marketRunner.status;
    if(status == "ACTIVE"){
      if(rid==runnerid){
        var attr="availableTo" + borl; //'Back' or 'Lay'
      //  logger.info("market runner: " + JSON.stringify(marketRunner));
        var prices=marketRunner.ex[attr];
        if(prices.length > 0){
          var price = marketRunner.ex[attr][0].price;
       //   logger.info(runner + " (" + runnerid + ")" + "best" + borl + "price: " + price);
          return({status: status,price:price,prices:marketRunner.ex[attr]});
        }
        else{
          return({status: status,price:0,prices:[]});
        }
        
      }
    }
    else{
      return({status: status,prices:[]});
    }

  }
  return({status:'NOTFOUND',prices:[]});
}



function doBFBets(token,marketid,markettype,layconditions,backconditions,horses){

  logger.info("doBFBets: " + marketid + " " + markettype + " " + JSON.stringify(layconditions) + " " + JSON.stringify(backconditions));
  for(horsename in horses){
    var horse=horses[horsename];
    var probability=horse.winProbability;
    var layReturn=horse.winLayReturn;
    var backReturn=horse.winBackReturn;
    if(markettype=="PLACE"){
      probability=horse.placeProbability;
      layReturn=horse.placeLayReturn;
      backReturn=horse.placeBackReturn;
    }

    //lay bets
    if(layconditions.bet){
      var oddsOffered=horse.bestLayWinPrice;
      if(markettype=="PLACE"){
        oddsOffered=horse.bestLayPlacePrice;
      }

      var toLose=layconditions.stake;
      var stake=toLose/(oddsOffered -1);
      if(stake < 2.00){
        stake=2.00;
      }
      else{
        stake=Math.ceil(stake);
      }

      if((probability > layconditions.minprobability)&&(probability < layconditions.maxprobability)){
        if((layReturn > layconditions.minreturn)&&(layReturn < layconditions.maxreturn)){
          if((oddsOffered >= layconditions.minprice)&&(oddsOffered <= layconditions.maxprice)){

            logger.info("DO BET LAY " + markettype + " " + horse.bfid + " probability: " + probability + " lay return:" + layReturn + " stake: " + stake);
            var targetOddsProb=(1-probability)/layconditions.targetreturn;
            var targetOdds= 1/(1-targetOddsProb);
            console.log('targetOdds: ' + targetOdds + ' odds offered: ' + oddsOffered);
            var bfTargetOdds=getBFTargetOdds(Math.floor(targetOdds * 100),true)//

              //parseFloat(targetOdds).toFixed(2));
            logger.info("bfTargetOdds: " + bfTargetOdds);

            doBetfairBet(token,marketid,horse.bfid,'LAY',stake,oddsOffered);
          }
        }
      }

    }
    //back bets
    if(backconditions.bet){
       var oddsOffered=horse.bestBackWinPrice;
      if(markettype=="PLACE"){
        oddsOffered=horse.bestBackPlacePrice;
      }

      if((probability > backconditions.minprobability)&&(probability < backconditions.maxprobability)){
        if((backReturn > backconditions.minreturn)&&(backReturn < backconditions.maxreturn)){
          if((oddsOffered >= backconditions.minprice)&&(oddsOffered <= backconditions.maxprice)){

            logger.info("DO BET BACK " + markettype + " " + horse.bfid + " probability: " + probability + " back return:" + backReturn + " stake: " + backconditions.stake);

            doBetfairBet(token,marketid,horse.bfid,'BACK',backconditions.stake,oddsOffered);
          }
        }
      }

    }

  }

}

function getBFTargetOdds(target,lay){

//console.log("target: " + target);
//return(target);
  var odds=100;
  var increment=1;

  do{
    if(lay &&((odds + increment)> target))return(odds/100.0);
    odds+=increment;
    //logger.info("odds now: " + odds + " increment now: " + increment);
   // odds=parseFloat('' +odds).toFixed(2);
    //logger.info("odds now: " + odds);
    if(odds >= 200){
      increment=2
    }
   if(odds >=300){
      increment=5
    }
   if(odds >=400){
      increment=10
    }
   if(odds >=600){
      increment=20
    }
   if(odds >=1000){
      increment=50
    }
   if(odds >=2000){
      increment=100
    }
   if(odds >=3000){
      increment=200
    }
   if(odds >=5000){
      increment=500
    }
   if(odds >=10000){
      increment=1000
    }


  }while(odds < target);

  return(odds/100.0);

  //return(parseFloat(odds).toFixed(2));


}

function doBetfairBet(token,marketid,horseid,bettype,stake, odds){
  logger.info("bet into: " + marketid + "horse: "+ horseid + " " + bettype + " stake: " + stake + " at " + odds);
  bets++;
  var customerRef = new Date().getMilliseconds();
  httpRequest({
            url: "https://api.betfair.com/exchange/betting/json-rpc/v1",
            method: "POST",  
            headers: {
          'Accept': 'application/json',
          'X-Application' : nconf.get('apikey'),
            'Content-type' : 'application/json',
            'X-Authentication' : token
        },
       body:{
        "jsonrpc":"2.0",
        "method":"SportsAPING/v1.0/placeOrders",
         "params": {
            "marketId":marketid,
            "instructions":[{"selectionId":'' +horseid,
                            "handicap":0,
                            "side": bettype,
                            "orderType":"LIMIT",
                            "limitOrder":{
                              "size": stake,
                              "price":odds,
                              "persistenceType":"LAPSE"
                            }
                          }],
              "customerRef":customerRef
         }, 
       
         "id": 1}, 
       json:true


        }, function (error, response, body){
          if(error){
            logger.error(JSON.stringify(error))
            //res.json({'status':'fail', 'message': 'Internal Server Error: ' + JSON.stringify(err)});
            bets--;
            if(bets==0){
              process.exit();
            }
            return;
          }
          else{
            bets--;
            if(bets==0){
              process.exit();
            }
          }
          logger.info(JSON.stringify(body));
        });


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


bfLogin(nconf.get("raceid"),nconf.get("marketid"));


