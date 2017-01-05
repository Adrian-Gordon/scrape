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



var collections=["races","horses"];
var databaseUrl=nconf.get("databaseurl");
var db = require("mongojs").connect(databaseUrl, collections);

var testrace={"meeting":"DONCASTER ","date":"2015-09-11T00:00:00.000Z","conditions":[{"conditiontype":"class","value":1},{"conditiontype":"conditions","ageconditions":{"lower":2,"upper":2}},{"conditiontype":"distance","furlongs":7,"miles":0,"yards":0},{"conditiontype":"going","going":"Good"}],"_id":633398,"distance":1408.176,"going":"Good","surface":"TURF","racetype":"FLAT","winningtime":85.04}

var raceids=nconf.get("raceids");



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





var host=nconf.get("host");
var port=nconf.get("port");




var request = require('request');
var srequest=require('sync-request');


for(var i=0;i<raceids.length;i++){
 //for(var i=0;i<1;i++){

    var raceid=raceids[i];
    processRaceData(raceid);

}

var count=0;

function processRaceData(raceid){
  
  var raceUrl="http://" + host + ":" + port + "/getraceresult?raceid="+raceid;
  request({url:raceUrl},function(error,response,body){
    logger.info(count + "/" + raceids.length + " " + raceid);
       count++
    try{
      var result=JSON.parse(body);
      var date=new Date(result.date);
     // logger.info("Date: " + result.date + " " + date);
     
  
      var raceDocument={
          meeting:result.course,
          date:new Date(result.date),
          offtime:result.time,
          conditions:[]
        }

       
        //logger.info("Race: " + race.raceid);
       raceDocument._id=raceid;
       raceDocument.runners=result.horseids;
       raceDocument.distance=result.distanceinmetres;
       raceDocument.going=result.going;
       raceDocument.surface=result.surface;
       raceDocument.racetype=result.raceType;
       raceDocument.winningtime=result.racetime.timeinseconds;

       var conditions=result.conditions;
       for(var x=0;x<conditions.length;x++){
        if(conditions[x]!==null){
          raceDocument.conditions.push(conditions[x]);
        }
       }
       //logger.info(JSON.stringify(raceDocument));

       insertRaceDocument(raceDocument);


         for(var horseid in result.horses ){
               // logger.info("horseid: " + horseid);
                 var horseData=result.horses[horseid];
                //does the horse exist?
                //logger.info("horseData: " + JSON.stringify(horseData));
                var fn=function(race,horseData,horseid){
                 // logger.info("Racedata: " + JSON.stringify(race));

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

                          horseDoc.performances[race._id]={
                            date:race.date,
                            distance:race.distance,
                            going:race.going,
                            surface:race.surface,
                            racetype:race.racetype,
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
                          performances[race._id]={
                            date:race.date,
                            distance:race.distance,
                            going:race.going,
                            surface:race.surface,
                            racetype:race.racetype,
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


                     



                    }(raceDocument,horseData,horseid);
                  }



    }catch(err){
      logger.error(raceid);
      logger.error(err);
      logger.error("parsing: " + body);
    }

  });


}

function processDateData(date){
  logger.info("Getting data for date: " + date);
  var dateUrl="http://" + host + ":" + port + "/getdateresults?date="+date;
  //var dateResp=srequest('GET',dateUrl);
  //var results=JSON.parse(dateResp.getBody());
  logger.info("Getting: " + dateUrl);
  request({url:dateUrl},function(error,response,body){
    logger.info("Got: " + dateUrl);
    try{
    var results=JSON.parse(body);

    logger.info("date results: " + results);
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
               logger.info(JSON.stringify(raceDocument));

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
                              logger.info("Inserted horse: " + horse._id);
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
                              logger.info("Updated record for horse: " + horse._id);
                            }
                          });





                        }

                      }

                      });


                     



                    }(race,horseData,horseid);
                  }

             
              
              }
            }
            }catch(err){
              logger.error(err);
              logger.error("body: "+body)
            }
          });



}


//var dateResp=srequest('GET',dateUrl);


//processDate(startDate);


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
 
  db.races.findOne({_id:document._id},function(err,race){
      if(err){
        logger.error(JSON.stringify(err));
      }
      else if(race==null){ //it's not already there
            db.races.insert(document,function(err,race){
              if(err){
                logger.error(JSON.stringify(err));
              }
             else{ 
                //logger.info(JSON.stringify(race));
                //logger.info("Added race: " + document._id);
             }
           });
      }
  });


  

}