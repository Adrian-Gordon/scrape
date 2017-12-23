var httpRequest = require('request');
var moment=require('moment');
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
   "apikey":"goes here",
   "logging":{
          "fileandline":true,
          "logger":{
             "console":{
              "level":"error",
              "colorize":true,
              "label":"scrape",
              "timestamp":true
              }
            }

       }
    
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


//returns a sessiontoken
function bfLogin(){
 var side=nconf.get('side');//'BACK' or 'LAY'
 var startDate;
 if(typeof nconf.get('from')!=='undefined'){
  startDate=new Date(nconf.get('from'));
 }
 else{
  var dateS=new Date().toISOString().slice(0,10);
  //console.log("dateS: " + dateS);
  startDate=new Date(dateS);
 }



 logger.info("startDate: " + startDate);

  httpRequest({
            url: "https://identitysso.betfair.com/api/login?",
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

            getOpenPosition(body.token,startDate,side);
           


    });

}

function getOpenPosition(token,startDate,side){
  logger.info("startDate: " + startDate);
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
        "method":"SportsAPING/v1.0/listCurrentOrders",
         "params": {
            "dateRange":{
              "from":startDate.toJSON()
            }
         }, 
       
         "id": 1}, 
       json:true


        }, function (error, response, body){
          if(error){
            logger.error(JSON.stringify(error))
            //res.json({'status':'fail', 'message': 'Internal Server Error: ' + JSON.stringify(err)});
            return;
          }

          //var resultObject=JSON.parse(body);
         logger.info(JSON.stringify(body));
         console.log("\nOPEN");
          var totalLiability= 0.0
          for(var i=0;i<body.result.currentOrders.length;i++){
            var co =body.result.currentOrders[i];
            //console.log(JSON.stringify(co));
            var liability=0;
            if(co.side == "BACK"){
              liability=co.sizeMatched;
            }
            else{
              liability=co.sizeMatched *(co.averagePriceMatched -1);
            }
            totalLiability+=liability;
            var placedDate=new Date(co.placedDate)
            console.log(placedDate.getHours() + ":" + placedDate.getMinutes() + " " + co.betId + " " + co.side + " " + co.sizeMatched + " at "+ co.averagePriceMatched.toFixed(2) + " (" +liability.toFixed(2) + ")");
            //totalProfit+=co.profit;
          }
          console.log("Liablity:" + totalLiability.toFixed(2));
          getSettledPosition(token,startDate,side);
        });


}

function getSettledPosition(token,startDate,side){
  logger.info("startDate: " + startDate);
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
        "method":"SportsAPING/v1.0/listClearedOrders",
         "params": {
            "betStatus":"SETTLED",
            "settledDateRange":{
              "from":startDate.toJSON()
            }
         }, 
       
         "id": 1}, 
       json:true


        }, function (error, response, body){
          if(error){
            logger.error(JSON.stringify(error))
            //res.json({'status':'fail', 'message': 'Internal Server Error: ' + JSON.stringify(err)});
            return;
          }

          //var resultObject=JSON.parse(body);
         // console.log(JSON.stringify(body));
         console.log("\nSETTLED");
          var totalProfit= 0.0;
          var totalLSProfit=0;
          var totalRisked=0.0;
          var expected=0.0;
          var wins=0;
          var nbets=0;
          for(var i=0;i<body.result.clearedOrders.length;i++){


            var co =body.result.clearedOrders[i];
             if((typeof side =='undefined')||(side == co.side)){
                 // console.log(co);
                 nbets++;
                var placedDate=new Date(co.placedDate)
                var offtime=placedDate.getHours() + ":" + placedDate.getMinutes();

                var coProfit;
                if(co.betOutcome=="WON"){
                  wins++;
                  coProfit=(co.profit * 0.95).toFixed(2);
                }
                else coProfit=co.profit;
                var oddsProb=1/co.priceMatched;
                if(co.side=="LAY"){
                  expected += (1-oddsProb);
                }
                else expected += oddsProb;
                console.log(offtime + " " + co.side + " " + co.sizeSettled + " at "+ co.priceMatched + " " +co.betOutcome + " " + coProfit);
                if(co.betOutcome=="WON"){
                  totalProfit+=co.profit*0.95;
                  if(co.side=="LAY"){
                    totalLSProfit+=(1/(co.priceMatched -1)) *0.95;
                  }
                  else{
                    totalLSProfit+=(co.priceMatched -1);
                  }
                  
                }
                else {
                  totalProfit+=co.profit;
                  totalLSProfit-=1;
                }
                var risked;
                if(co.side=="LAY"){
                  risked=co.sizeSettled *(co.priceMatched -1);
                }
                else{
                  risked=co.sizeSettled;
                 //risked=1.0;
                }
                 
                totalRisked+=risked;

            }
          

          }
          var poi=totalProfit/totalRisked;
          var winPC=wins/nbets;
          var n=nbets
          var archie=(n * ((wins - expected)*(wins - expected))) / (expected *(n - expected));
          console.log("\nRisked: " + totalRisked.toFixed(2) + " Profit:" + totalProfit.toFixed(2) + " (LS:" +totalLSProfit.toFixed(2) + ")" + " ROI: " + poi.toFixed(2)+ " (LS:" + (totalLSProfit /+nbets).toFixed(2) + ") \nBets: " +nbets + " Wins: " + wins +  " Win%: " + winPC.toFixed(2) + " Archie: " + archie.toFixed(2)+ "\n");
        });


}


bfLogin();