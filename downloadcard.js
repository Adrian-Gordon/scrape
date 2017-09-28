/*This app downloads all of the racecards for today's racing, creating entries in the 'cards' collection of the database,
and, ultimately, generating scheduled tasks for each race*/


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
     "processtimeout":1800000 //half an hour
});


var moment=require('moment');

var collections=["races","horses","cards","perfstocheck"];
var databaseUrl="mongodb://" + nconf.get("databaseurl");
//console.log("databseurl: " + databaseUrl);
//var db = require("mongojs").connect(databaseUrl, collections);

var MongoClient=require('mongodb').MongoClient;




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


//var asyncCalls=0;

setTimeout(function(){
  console.log("processRaceData exit: " + nconf.get('raceid'));
  process.exit();
},nconf.get('processtimeout'));
//},3000);

/*

var cardsDate=nconf.get('date');

if(typeof cardsDate=='undefined'){
  cardsDate=moment().format('YYYY-MM-DD')
}


logger.info(cardsDate);

var cardsUrl="http://" + host + ":" + port + "/getdatecards?date="+cardsDate;


//get the race ids for this date
request({url:cardsUrl},function(error,response,body){
  if(error){
    logger.error(JSON.stringify(error));
    process.exit();
  }
  var raceids=JSON.parse(body);
  //logger.info("racecards: " + raceids);
  for(var i=0;i<raceids.length;i++){
    var raceid=raceids[i];
    //logger.info("processRaceData: " + raceid);
    //processRaceData(raceid);
  }


});
*/

//logger.error("databaseUrl: " + databaseUrl);
processRaceData(nconf.get('raceurl'));

/*Download and process the data for a particular raceid*/

function processRaceData(raceurl){

  MongoClient.connect(databaseUrl,function(err,db){
    if(err) throw(err);





  
  var index=raceurl.lastIndexOf('/');
  var raceid=raceurl.substring(index+1,raceurl.length);
  console.log("processRaceData: " + raceurl + " raceid: " + raceid);

   db.collection("cards").findOne({rpraceid:raceid},function(err,card){

      if(err){
         logger.error(JSON.stringify(err));
         process.exit();
      }
      else if(card){
        logger.info("DONE, already there");
        process.exit();
        
      }
  
      var raceUrl="http://" + host + ":" + port + "/getcarddata?raceurl="+raceurl;
     // asyncCalls++;
      request({url:raceUrl},function(error,response,body){
       // asyncCalls--;
        try{


          var race=JSON.parse(body);
          logger.info("Race: " + JSON.stringify(race));
          if(race.status=="ERROR"){
            logger.error(JSON.stringify(race));
            process.exit();
          }
          var date=race.date.year + "-" + race.date.month + "-" + race.date.day;

          var hrs;
          var mins;

          if(race.offtime.hours < 12){
            hrs="" + (race.offtime.hours + 12);
          }
          else{
            hrs="" + race.offtime.hours;
          }

          if(race.offtime.minutes < 10){
            mins="0" + race.offtime.minutes;
          }
          else{
            mins="" + race.offtime.minutes
          }

          var offDateTime=date+"T" + hrs + ":" + mins + ":00"
         
         
      
          var raceDocument={
              meeting:race.meeting,
              rpraceid:race._id,
              date:new Date(date),
              offtime:race.offtime,
              offtimeS:race.offtimeS,
              offdatetime:new Date(offDateTime),
              conditions:[]
            }

           // var runners=[];
          //  for(var horseid in race.horses){
           //   runners.push(horseid);
          //  }

            var miles=race.distance.miles,furlongs=race.distance.furlongs,yards=race.distance.yards;

            var distanceInMetres=0.0;
            if(typeof race.distance.miles == 'undefined')
                miles=0.0;
            if(typeof race.distance.furlongs=='undefined')
                furlongs=0.0;
            if(typeof race.distance.yards == 'undefined')
                yards=0;
              
              var distanceinyards=(miles * 1760) + (furlongs * 220) + yards;
             distanceInMetres=distanceinyards * 0.9144;
              

           
            //logger.info("Race: " + race.raceid);
           //raceDocument._id=db.ObjectId();
           raceDocument._id = require('mongodb').ObjectID;
           raceDocument.runners=race.horses;
           raceDocument.distance=distanceInMetres;
           raceDocument.going=race.going.going;
           raceDocument.surface=race.surface;
           raceDocument.racetype=race.raceType;
          

           var conditions=race.conditions;
           for(var x=0;x<conditions.length;x++){
            if(conditions[x]!==null){
              raceDocument.conditions.push(conditions[x]);
            }
           }
           logger.info(JSON.stringify(raceDocument));

        
            db.collection("cards").insert(raceDocument,function(err,result){
             
                logger.info("Inserted Card");
                //process.exit();

                processRunners(db,raceDocument.runners);
           
            });
           

          

           //iterate over the horses in the document,making sure we have all of the data for each of
           //the races the horse has run in
          /* for(runnerid in raceDocument.runners){
           //for(var i=0;i<raceDocument.runners.length;i++){
            //  var runner=raceDocument.runners[i];
              runner=raceDocument.runners[runnerid];
              logger.info("Check horse: " + runner);

              for(var j=0;j<runner.races.length;j++){
                var raceid=runner.races[j];
                  logger.info(" check race: " + raceid);
                  var f=function(rid,run){
                    asyncCalls++;
                    db.races.findOne({_id:rid},function(err,race){
                        asyncCalls--;
                        if(err){
                          logger.error(JSON.stringify(err));
                        }
                        else if(race==null){ //it's not already there
                           logger.info("race: " + rid + " is not there"); 
                           //so add the race and all the horses  
                           processRaceResultData(rid,0);

                        }
                        else{
                            logger.info("race: " + rid + " is there"); 
                            //so check that this horse has data for this race
                            var g=function(r){
                                asyncCalls++;
                                db.horses.findOne({_id:run},function(err,horse){
                                    asyncCalls--;
                                   // logger.info("horse: " + run + " " + JSON.stringify(horse));
                                    if(err){
                                      logger.error(JSON.stringify(err));
                                    }
                                    else if(horse==null){ //it's not already there
                                       logger.info("horse: " + r + " is not there"); 
                                        processRaceResultData(rid,0);
                                       //so add the race and all the horses  
                                    }
                                    else{
                                      logger.info("horse: " + r + " is there");
                                      if(typeof horse.performances[rid]=='undefined'){
                                        logger.info("but performance for " + r + " in race: " + rid +" is missing");
                                         processRaceResultData(rid,0);
                                      }
                                      else{
                                        logger.info("and performance for "+  r + " in race: " + rid +" is there");
                                      }
                                    }

                                    if(asyncCalls==0){
                                      logger.info("DONE");
                                      process.exit();
                                    }
                                })
                              }(run)
                        }
                      if(asyncCalls==0){
                        logger.info("DONE");
                        process.exit();
                      }
                    });
                  }(raceid,runner);
              }
           }*/


        }catch(err){
          //if(asyncCalls==0){
          //  logger.info("DONE");
           // process.exit();
          //}
          logger.error(raceid);
          logger.error(err);
          logger.error("parsing: " + body);
          process.exit();
        }
        //if(asyncCalls==0){
        //    logger.info("DONE");
       //     process.exit();
       //   }

      });
  });
});


}

function processRunners(db,runners){
  count=0;
  for(runnerid in runners){
     //for(var i=0;i<raceDocument.runners.length;i++){
      //  var runner=raceDocument.runners[i];
        runner=runners[runnerid];
        

        for(var j=0;j<runner.races.length;j++){
          count++;
          var raceurl=runner.races[j];
          var index=raceurl.lastIndexOf('/');
          var raceid=raceurl.substring(index+1,raceurl.length);
          logger.info("Check horse: " + runnerid + " " + raceid);
          db.collection("perfstocheck").insert({runnerid:runnerid,raceid:raceid,raceurl:raceurl},function(err){
            if(err){
              logger.error("error: " + err);
            }
            count--;
            if(count==0){
              process.exit()
            }
          })

        }
  }

 // process.exit();


}



//Download and process the data from a result

function processRaceResultData(raceid,attempt){
  
  var raceUrl="http://" + host + ":" + port + "/getraceresult?raceid="+raceid;
  asyncCalls++;
  request({url:raceUrl},function(error,response,body){
    asyncCalls--;

    if(error){
      
      if(attempt < 3){
        processRaceResultData(raceid,attempt + 1); //try 3 times
      }
      else{
        logger.error(JSON.stringify(error));
        logger.error("tried 3 times at " + raceUrl);
      }
      return;
    }
    
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
                    asyncCalls++;
                    db.horses.findOne({_id:horseid},function(err,horse){
                      asyncCalls--
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
                          asyncCalls++;
                          db.horses.insert(horseDoc,function(err,horse){
                            asyncCalls--;
                            if(err){
                              logger.error(JSON.stringify(err));
                            }
                            else{
                              logger.info("Inserted horse: " + horse._id);
                            }
                            if(asyncCalls==0){
                              logger.info("DONE");
                              process.exit();
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
                          asyncCalls++;
                          db.horses.update({"_id": horse._id},{$set:{performances:performances}},function(err,count){
                            asyncCalls--;
                            if(err){
                              logger.error(JSON.stringify(err));
                            }
                            else{
                              logger.info("Updated record for horse: " + horse._id);
                            }
                            if(asyncCalls==0){
                              logger.info("DONE");
                              process.exit();
                            }
                          });





                        }

                      }
                      if(asyncCalls==0){
                        logger.info("DONE");
                        process.exit();
                      }

                      });


                     



                    }(raceDocument,horseData,horseid);
                  }



    }catch(err){
      if(asyncCalls==0){
        logger.info("DONE");
        process.exit();
      }
      //logger.error(raceid);
      logger.error(err);
      logger.error("parsing: " + body);
      logger.error("at: " + raceUrl);
    }
  if(asyncCalls==0){
        logger.info("DONE");
        process.exit();
      }

  });


}




//insert a document into the 'races' collection

function insertRaceDocument(document){
  //logger.info("insert race: " + JSON.stringify(document));
 
            asyncCalls++;
            db.races.insert(document,function(err,race){
              asyncCalls--;
              if(err){
                //don't report key errors
                if(err.err.indexOf("duplicate key error")!== -1){

                }
                else logger.error(JSON.stringify(err));

              }
             else{ 
                //logger.info(JSON.stringify(race));
                logger.info("Added race: " + document._id);
             }
             if(asyncCalls==0){
              logger.info("DONE");
              process.exit();
            }
           });
      
  }