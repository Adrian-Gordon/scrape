//Generate a beta distribution of speeds, and put them in to a histogram
//if --filename arg is provided, read data from the relevant file instead
var jStat = require('jStat').jStat;
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
    "alpha":26.94,
    "beta":6.86,
    "loc":11.21,
    "scale":6.0,//6.28
    "binwidth":0.14,
    "minspeed": 8.2315558448805,
    "maxspeed": 17.282474226804123,
    "nobservations":27535
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
  var filename=nconf.get('filename');
  var nobservations=nconf.get("nobservations");
  var alpha=nconf.get("alpha");
  var beta=nconf.get("beta");
  var loc=nconf.get("loc");
  var scale=nconf.get("scale");
  var maxspeed=nconf.get("maxspeed");
  var minspeed=nconf.get("minspeed");
  var binwidth=nconf.get("binwidth");
  var nbins=Math.floor((maxspeed - minspeed)/binwidth);
  var linereader;
  var hist =new Array(nbins);
  for(var i=0;i<nbins;i++){
    hist[i]=0;
  }


  if(typeof filename != 'undefined'){
    var count=0;
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream(filename)
    });
    lineReader.on('line',function(line){
      count++;
      var observation=parseFloat(line);
      var index=Math.floor((observation - 11.0) / binwidth);
       ///console.log(observation + " " + index);
        if(index > 99) index=99;
        hist[index]=hist[index]+1;

    });
    lineReader.on('close',function(){
      //console.log("END");
      for(var i=0;i<nbins;i++){
        var binMiddle=11.0 + (binwidth/2)+(i * binwidth)
        console.log( binMiddle.toFixed(2)+ " " +hist[i]);
      }
      console.log("count: " + count);
    })

  }
  else{

    for(var i=0;i<nobservations;i++){

      
       var sample=jStat.beta.sample(alpha,beta);
       var observation= loc + (scale * sample);
       //console.log("sample: " + sample + " observation: " +observation);
       var index=Math.floor((observation - 11.0) / binwidth);
       //console.log(observation + " " + index);
        if(index > 99) index=99;
        hist[index]=hist[index]+1;
    }
  

    for(var i=0;i<nbins;i++){
      var binMiddle=11.0 + (binwidth/2)+(i * binwidth)
      console.log( binMiddle.toFixed(2)+ " " +hist[i]);
    }
  }





