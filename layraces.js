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
var betCursor=db.testbets.find();

var betsCount=0;
var betsOutCount=0;

 var maxOdds =20000;//req.query.maxodds;
  var maxProbability=0.3;//req.query.maxprob;
  var minLayReturn=0.0;
  var maxLayReturn=1.0;
  var returnArray=[];
  var marketType="WIN";//WIN or PLACE
  var code="FLAT"; //FLAT or JUMPS, or undefined
  var betType="LAY";

doProcessOneBet();

function doProcessOneBet(){
   
  betCursor.next(function(err, bet) {
     if(bet){
      //logger.info("doProcessOneBet " + betsCount++);
      var thisRaceBets={
        netReturn:0.0,
        thisBetArray:[]
      };
      //var thisBetArray=[];
        var horses=bet.horses;
      var nHorses=Object.keys(horses).length;
      var excludeRace=false;

      var horsesArray=new Array();

      //build a regularArray
      for(horse in horses){
        var horseObj=horses[horse];
        horseObj.name=horse;
        horsesArray.push(horseObj);
        
      }

       horsesArray.sort(function(a,b){
          if(a.winLayReturn > b.winLayReturn){
            return(-1);
          }
          else if(b.winLayReturn > a.winLayReturn){
            return(1);

          }
          else return(0);

       });

       //logger.info(JSON.stringify(horsesArray));

       var cumulativeProbability=0.0;
       for(var i=0;i<horsesArray.length;i++){
          var nextHorse=horsesArray[i];

          if(nextHorse.bestLayWinPrice <= maxOdds){
            if((nextHorse.winLayReturn > minLayReturn) &&(nextHorse.winLayReturn < maxLayReturn) ){

              var betObject={
                  markettype:marketType,
                  bettype:betType,
                  venue:bet.venue,
                  offtime:bet.offtime,
                  code:bet.racetype
                }
                if(marketType=="WIN"){
                    if(betType=='BACK'){
                      price=nextHorse.bestBackWinPrice;
                      probability=nextHorse.winProbability;
                      expectedReturn=nextHorse.winBackReturn;
                      if(nextHorse.status=='WINNER'){
                        actualReturn= (price -1)* 0.95

                      }
                      else if(nextHorse.status=='LOSER'){
                        actualReturn=-1;

                      }



                    }
                    else if(betType=='LAY'){
                        price=nextHorse.bestLayWinPrice;
                        probability=nextHorse.winProbability;
                        expectedReturn=nextHorse.winLayReturn;
                        if(nextHorse.status=='WINNER'){
                          actualReturn= -1

                        }
                        else if(nextHorse.status=='LOSER'){
                          actualReturn=(1 /(price -1.0))* 0.95;

                        }

                    }
                    betObject.horse=nextHorse.name;
                    betObject.price=price;
                    betObject.probability=probability;
                    betObject.expectedReturn=expectedReturn;
                    betObject.actualReturn=actualReturn;
                    if(betObject.price)thisRaceBets.thisBetArray.push(betObject);

                    }



              cumulativeProbability+=nextHorse.winProbability;
              if(cumulativeProbability> maxProbability){
                break; //next race
              }
            }
          }

       }


       //now calculate the bets for a max loss of 1

       var cumulativeBetProbability=0.0;
       var cumulativePrice=0.0;
       var totalStake=0.0

       for(var i=0;i<thisRaceBets.thisBetArray.length;i++){
          var betObject=thisRaceBets.thisBetArray[i];
          cumulativeBetProbability+=(1/betObject.price);
       }
      cumulativePrice=1/(1-cumulativeBetProbability);
      totalStake= cumulativePrice-1;

      for(var i=0;i<thisRaceBets.thisBetArray.length;i++){
          var betObject=thisRaceBets.thisBetArray[i];
          betObject.stake=totalStake * ((1/betObject.price)/cumulativeBetProbability);
       }

       //console.log("total stake: " + totalStake);
       

      for(var i=0;i<thisRaceBets.thisBetArray.length;i++){
          var betObject=thisRaceBets.thisBetArray[i];
          if(betObject.actualReturn == -1){ //losing bet


            thisRaceBets.netReturn -= betObject.stake * (betObject.price -1);
          }
          else thisRaceBets.netReturn += betObject.stake;
          
       }

       if(thisRaceBets.netReturn > 0){
        thisRaceBets.netReturn = thisRaceBets.netReturn * 0.95;
       }
     //  console.log(JSON.stringify(thisRaceBets));
       returnArray.push(thisRaceBets);



     
      setTimeout(doProcessOneBet,0);

    }
    else{
         logger.info('done all bets');
          //console.log(JSON.stringify(returnArray));
          var cumulative=0;
          for(var i=0;i<returnArray.length;i++){
            var theBet=returnArray[i];
            cumulative += theBet.netReturn;
            console.log(JSON.stringify(theBet));
            console.log(theBet.netReturn + " " + cumulative);
          }
          process.exit();
    }
  });

}





