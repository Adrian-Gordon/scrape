
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
  
    "databaseurl"     : "localhost/bfdata",
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

var collections=["bfraces"];
var databaseUrl=nconf.get("databaseurl");
var db = require("mongojs").connect(databaseUrl, collections);



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


//RECORD STRUCTURE: "SPORTS_ID","EVENT_ID","SETTLED_DATE","COUNTRY","FULL_DESCRIPTION","COURSE","SCHEDULED_OFF","EVENT","ACTUAL_OFF","SELECTION_ID","SELECTION","ODDS","NUMBER_BETS","VOLUME_MATCHED","LATEST_TAKEN","FIRST_TAKEN","WIN_FLAG","IN_PLAY"
var fileuri=nconf.get("file");

var fs = require('fs');
var parse = require('csv-parse/lib/sync');
var transform = require('stream-transform');

var output = [];


var input = fs.createReadStream(fileuri);

var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader(fileuri);

lr.on('error', function (err) {
  // 'err' contains error object
  logger.error(JSON.stringify(err));
});

lr.on('line', function (line) {
  // pause emitting of lines...
  lr.pause();
  var records=parse(line,{delimiter:',',columns:["SPORTS_ID","EVENT_ID","SETTLED_DATE","COUNTRY","FULL_DESCRIPTION","COURSE","SCHEDULED_OFF","EVENT","ACTUAL_OFF","SELECTION_ID","SELECTION","ODDS","NUMBER_BETS","VOLUME_MATCHED","LATEST_TAKEN","FIRST_TAKEN","WIN_FLAG","IN_PLAY"]});
  
  var record=records[0];
  if(record.COUNTRY !== "GB" && record.COUNTRY != "IRE"){
      //ignore - not GB IRE
      lr.resume();
    }
  else{
      if(record.IN_PLAY !== "PE"){
        //ignore
        lr.resume();
      }
      else {
        if(record.COURSE=='Daily'){
          //ignore
          lr.resume();
        }
        else{
  
        
                 var newRace={
                  _id:parseInt(record.EVENT_ID),
                  scheduled_off:new Date(moment.utc(record.SCHEDULED_OFF,"DD-MM-YYYY HH:mm:ss").toISOString()),
                  course:record.COURSE,
                  winners:0
                }
                var newHorse={
                  bfid:record.SELECTION_ID,
                  name:record.SELECTION,
                  win:parseInt(record.WIN_FLAG),
                  odds:[{
                      odds:parseFloat(record.ODDS),
                      numberTaken:parseInt(record.NUMBER_BETS),
                      volume:parseFloat(record.VOLUME_MATCHED),
                      latest:new Date(moment.utc(record.LATEST_TAKEN,"DD-MM-YYYY HH:mm:ss").toISOString()),
                      first: new Date(moment.utc(record.FIRST_TAKEN,"DD-MM-YYYY HH:mm:ss").toISOString())}]
                  
                }
                //logger.info("Go find " + newRace._id);
                db.bfraces.findOne({_id:newRace._id}, function(err,race){
                 // logger.info("Race: " + JSON.stringify(race));
                  if(race==null){ 
                    //logger.info('insert race: ' + JSON.stringify(newRace));
                    newRace.runners={};
                    newRace.runners[newHorse.name]=newHorse;
                    if(newHorse.win==1){
                      newRace.winners=1;
                    }
                    db.bfraces.insert(newRace,function(err){
                      lr.resume();
                    });
                  }
                  else{
                    //update with the new horse record
                    var runners=race.runners;
                    var winners=race.winners;

                    

                    if(typeof runners[newHorse.name] == 'undefined'){ //first time we've seen this horse
                      runners[newHorse.name]=newHorse;
                      if(newHorse.win==1){
                        //logger.info("newhorse wins: " + JSON.stringify(newHorse));
                        //logger.info("race is: " + JSON.stringify(race));
                        winners++;
                      }
                    }
                    else{
                      runners[newHorse.name].odds.push({odds:parseFloat(record.ODDS),numberTaken:parseInt(record.NUMBER_BETS), volume:parseFloat(record.VOLUME_MATCHED),latest:new Date(moment.utc(record.LATEST_TAKEN,"DD-MM-YYYY HH:mm:ss").toISOString()),first:new Date(moment.utc(record.FIRST_TAKEN,"DD-MM-YYYY HH:mm:ss").toISOString())});
                    }
                     db.bfraces.update({_id:race._id},{$set:{runners:runners,winners:winners}},function(err){
                      lr.resume();
                     });
                    
                  }

                });
        //console.log(JSON.stringify(newRace));
        //console.log(JSON.stringify(newHorse));
        }
      }
  }
  

  /*
  // ...do your asynchronous line processing..
  setTimeout(function () {



    // ...and continue emitting lines.
    lr.resume();
  }, 100);*/
});

lr.on('end', function () {
  // All lines are read, file is closed now.
  process.exit();
});


/*var transformer = transform(function(record,callback){
  sports_id=record[0];
  console.log(JSON.stringify(record));
  if(sports_id=="SPORTS_ID"){//the title
    //so ignore it
  }
  else{
    var event_id=record[1];
    var country=record[3];
    var course=record[5];
    var in_play=record[17];
    var scheduled_off=record[6];

    var horseName=record[10];
    var horseId=record[9];
    var odds=record[11];
    var numberTaken=record[12]
    var latest=record[13];
    var first=record[14];
    var  win=record[15];
    if(country !== "GB" && country != "IRE"){
      //ignore - not GB IRE
    }
    else{
      if(in_play !== "PE"){
        //ignore
      }
      else {
       // console.log(JSON.stringify(record));
        var newRace={
          _id:parseInt(event_id),
          scheduled_off:scheduled_off,
          course:course
        }
        var newHorse={
          bfid:horseId,
          odds:parseFloat(odds),
          numberTaken:parseInt(numberTaken),
          latest:latest,
          first:first,
          win:win
        }
        console.log(JSON.stringify(newRace));

        callback(null,newRace);

        var fn=function(hn,hr){
        db.bfraces.findOne({_id:newRace._id}, function(err,race){
          if(race==null){
            db.bfraces.insert(newRace,function(err){
              callback(null,record);
            });
          }
          else{ //the race is already there
            console.log("RACE ALREADY THERE");
            if(typeof race.runners == 'undefined'){
              runners={

              };
              runners[hn]=hr;
              db.races.update({_id:race._id},{$set:{runners:runners}},function(err){
                callback(null,record);
              });

              
            }

          }
        });
      }(horseName,newHorse);


      }
    }

  }
 
  
}, {parallel: 1});


input.pipe(parser).pipe(transformer);//.pipe(process.stdout);*/




