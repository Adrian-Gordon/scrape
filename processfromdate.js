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
     "startdate":"2015-06-13",
     "host":"localhost",
     "port":"3000",
     "ndates":3
    
  
});

var collections=["races","horses"];
var databaseUrl=nconf.get("databaseurl");
var db = require("mongojs").connect(databaseUrl, collections);

var testrace={"meeting":"DONCASTER ","date":"2015-09-11T00:00:00.000Z","conditions":[{"conditiontype":"class","value":1},{"conditiontype":"conditions","ageconditions":{"lower":2,"upper":2}},{"conditiontype":"distance","furlongs":7,"miles":0,"yards":0},{"conditiontype":"going","going":"Good"}],"_id":633398,"distance":1408.176,"going":"Good","surface":"TURF","racetype":"FLAT","winningtime":85.04}




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




var startDate=nconf.get("startdate");
var host=nconf.get("host");
var port=nconf.get("port");
var ndates=nconf.get('ndates');




var request = require('request');
//var srequest=require('sync-request');


//var dateResp=srequest('GET',dateUrl);


var datestoProcess=[startDate];
var datesProcessed=[startDate];

processDate(startDate);

/*logger.info("go do find")
db.races.find({},function(err,races){
  if(err){
    logger.error("err: " + JSON.stringify(err));
  }
  logger.info("races: " + JSON.stringify(races))
});*/

//logger.info("done find");

//while(false){
//while((datestoProcess.length > 0)&&(datesProcessed.length < ndates )){

function processDate(nextDate){

  //var nextDate=datestoProcess.shift();
 // datesProcessed.push(nextDate);

  //logger.info("nextDate: " + nextDate);
  //logger.info("datestoProcess: " + JSON.stringify(datestoProcess));
  //logger.info("datesProcessed: " + JSON.stringify(datesProcessed));
        var dateUrl="http://" + host + ":" + port + "/getdateresults?date="+nextDate;
        logger.info("Getting: " + dateUrl);
        request({url:dateUrl},function(error,response,body){
        logger.info("Got: " + dateUrl);
        //var dateResp=srequest('GET',dateUrl);
        //var results=JSON.parse(dateResp.getBody());
        try{
        var results=JSON.parse(body);
        for(var i=0;i< results.length;i++){
          var meeting=results[i];
          //logger.info(meeting.meeting);

          var races=meeting.races;
          for(var j=0;j<races.length;j++){

            var raceDocument={
              meeting:meeting.meeting,
              date:new Date(meeting.date),
              conditions:[]
            }

            var race=races[j];
            //logger.info("Race: " + race.raceid);
           raceDocument._id=race.raceid;
           raceDocument.runners=race.horseids;
           raceDocument.distance=race.racedata.distanceinmetres;
           raceDocument.going=race.racedata.going;
           raceDocument.surface=race.racedata.surface;
           raceDocument.racetype=race.racedata.raceType;
           raceDocument.winningtime=race.racedata.racetime.timeinseconds;

           var conditions=race.racedata.conditions;
           for(var x=0;x<conditions.length;x++){
            if(conditions[x]!==null){
              raceDocument.conditions.push(conditions[x]);
            }
           }
           //logger.info(JSON.stringify(raceDocument));

           insertRaceDocument(raceDocument);
           

           //process data for each horse


           for(var horseid in race.racedata.horses ){
           // logger.info("horseid: " + horseid);
             var horseData=race.racedata.horses[horseid];
            //does the horse exist?
            //logger.info("horseData: " + JSON.stringify(horseData));
            var fn=function(race,horseData,horseid){

              //if(horseid =='859709'){
              //  logger.info("859709 race: " + JSON.stringify(race))
             // }
                db.horses.findOne({_id:horseid},function(err,horse){
                  if(err){
                    logger.error(JSON.stringify(err));
                  }
                  else{

                    if(horse==null){ //horse doesn't exist yet

                      var horseDoc={
                        _id:horseid,
                        performances:{

                        }
                      }

                      horseDoc.performances[race.raceid]={
                        date:new Date(meeting.date),
                        distance:race.racedata.distanceinmetres,
                        going:race.racedata.going,
                        surface:race.racedata.surface,
                        racetype:race.racedata.raceType,
                        weight:horseData.weight,
                        speed:horseData.speed,
                        position:horseData.pos,
                        price: horseData.price
                      }
                      //logger.info("horsedoc: " + JSON.stringify(horseDoc));

                      db.horses.insert(horseDoc,function(err,horse){
                        if(err){
                         // logger.error(JSON.stringify(err));
                        }
                        else{
                          //logger.info("Inserted horse: " + horse._id);
                        }
                      })

                    }
                    else{//horse exists

                      var performances=horse.performances;
                      performances[race.raceid]={
                        date:new Date(meeting.date),
                        distance:race.racedata.distanceinmetres,
                        going:race.racedata.going,
                        surface:race.racedata.surface,
                        racetype:race.racedata.raceType,
                        weight:horseData.weight,
                        speed:horseData.speed,
                        position:horseData.pos,
                        price: horseData.price

                      }

                      db.horses.update({"_id": horse._id},{$set:{performances:performances}},function(err,count){
                        if(err){
                          logger.error(JSON.stringify(err));
                        }
                        else{
                          //logger.info("Updated record for horse: " + horse._id);
                        }
                      });





                    }

                  }

                  });


                  var horseDatesUrl="http://" + host + ":" + port + "/gethorsedates?horseid=" + horseid;
                 // logger.info("horseDatesUrl: " + horseDatesUrl);

                  //var resp=srequest('GET',horseDatesUrl);
                  request({url:horseDatesUrl},function(err,response,body){
                    
                    try{
                      if(typeof body !== 'undefined'){
                     
                      //logger.info("body: " + body);
                      var respJson=JSON.parse(body);
                      for(var l=0;l<respJson.length;l++){
                        var resultsDate=respJson[l];
                        //logger.info("date to get: " + horseid + " " + resultsDate );

                       // if((datestoProcess.indexOf(resultsDate)==-1)&&(datesProcessed.indexOf(resultsDate)==-1))
                       //   datestoProcess.push(resultsDate);
                        if((datesProcessed.indexOf(resultsDate)==-1)&&(datesProcessed.length < ndates )){
                            //logger.info("added resultsDate " + resultsDate + " for horseid: " + horseid);
                            datesProcessed.push(resultsDate);
                            processDate(resultsDate);
                        }
                      }
                    }
                    }catch(error){
                      logger.error("error: " + error.message);
                      logger.error("url: " + horseDatesUrl + " body: " + body);
                    }
                  });






                }(race,horseData,horseid);
              }

           /*   horseData=race.racedata.horses[horse];
               var horsePerfDoc={
                  raceid:race.raceid,
                  date:new Date(meeting.date),
                  distance:race.racedata.distanceinmetres,
                  going:race.racedata.going,
                  surface:race.racedata.surface,
                  racetype:race.racedata.raceType,
                  weight:horseData.weight,
                  speed:horseData.speed,
                  position:horseData.pos,
                  price: horseData.price


               }*/
              // logger.info("horse: " + horse + " " + JSON.stringify(horsePerfDoc));

          // }



           /* var horseids=race.racedata.horseids;
            for(var k=0;k<horseids.length;k++){
            //for(var k=0;k<1;k++){
              var horseid=horseids[k];
             // logger.info("horseid: " + horseid);


            


              //now get the horse dates
              var horseDatesUrl="http://" + host + ":" + port + "/gethorsedates?horseid=" + horseid;
              logger.info("horseDatesUrl: " + horseDatesUrl);

              //var resp=srequest('GET',horseDatesUrl);
              request({url:horseDatesUrl},function(err,response,body){
                
                try{
                  if(typeof body !== 'undefined'){
                 
                  //logger.info("body: " + body);
                  var respJson=JSON.parse(body);
                  for(var l=0;l<respJson.length;l++){
                    var resultsDate=respJson[l];
                   // logger.info("date to get: " + resultsDate );

                   // if((datestoProcess.indexOf(resultsDate)==-1)&&(datesProcessed.indexOf(resultsDate)==-1))
                   //   datestoProcess.push(resultsDate);
                    if((datesProcessed.indexOf(resultsDate)==-1)&&(datesProcessed.length < ndates )){
                        datesProcessed.push(resultsDate);
                        processDate(resultsDate);
                    }
                  }
                }
                }catch(error){
                  logger.error("error: " + error.message);
                  logger.error("url: " + horseDatesUrl + " body: " + body);
                }
              })
              



            }*/
          
          }
        }
      }catch(error){
        logger.error("error: " + error.message);
        logger.error("url:" + dateUrl );//+ " body: " + JSON.stringify(body));
      }
      });
    
  }



/*
request(
    {
        url : url,
      //  headers : {
      //      "User-Agent" : ua
      //  }
    },function(error,response,body){
      if (error || response.statusCode != 200) {
        logger.error(error);
      }
      else {

       // logger.info(body);
        var results=JSON.parse(body);

        //get next dates

        for(var i=0;i< results.length;i++){
          var meeting=results[i];
          logger.info(meeting.meeting);

          var races=meeting.races;
          for(var j=0;j<races.length;j++){
            var race=races[j];
            logger.info(race.raceid);
            var horseids=race.racedata.horseids;
            for(var k=0;k<horseids.length;k++){
              var horseid=horseids[k];
              logger.info("horseid: " + horseid);

              //now get the horse dates
              var horseDatesUrl="http://" + host + ":" + port + "/gethorsedates?horseid=" + horseid;
              //logger.info("url: " + url);

              var resp=srequest('GET',horseDatesUrl);
              var respJson=JSON.parse(resp.getBody());
              for(var l=0;l<respJson.length;l++){
                var resultsDate=respJson[l];
                logger.info("date to get: " + resultsDate );
              }

            }
          }
        }



      }
    });*/


function insertRaceDocument(document){
  //logger.info("insert race: " + JSON.stringify(document));
  var mdb = require("mongojs").connect(databaseUrl, collections);
  mdb.races.insert(document,function(err,race){
              if(err){
               // logger.error(JSON.stringify(err));
              }
             else{ 
                //logger.info(JSON.stringify(race));
             }
           });

}