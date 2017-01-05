var PEG = require("pegjs");
//nconf is used globally
nconf=require('nconf');

var express = require('express');
var bodyParser=require("body-parser");

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views',__dirname + '/views');
app.set('view engine','jade');

app.use(bodyParser.json);
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//app.use(app.router);







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
  
    "databaseurl"     : "mongodb://54.154.22.54/dimpledb",
    "logging":{
        "fileandline":true,
        "logger":{
           "console":{
            "level":"info",
            "colorize":true,
            "label":"reframed",
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


var resultUrlParserStr="start='/horses/result_home.sd?race_id=' raceid:integer '&r_date=' date:date '&popup=yes' {return{raceid:raceid,racedate:date}}\ninteger 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\ndate=yyyy:integer '-' mm:integer '-' dd:integer {return{day:dd,month:mm,year:yyyy}}";

var conditionsParserStr="start=(ws /expr)+\n"
+"ws=[ \\n]+ {return null}\n"
+"expr=classExpr\n"
+"/condExpr\n"
+"/ageParCondExpr\n"
+"/distParExpr\n"
+"/distExpr\n"
+"/goingExpr\n"
+"classExpr='(' 'Class' ws int:integer ')'   {return{type:'class', value:int}}\n"
+"condExpr='(' lower:integer '-' upper:integer ')'  {return{type:'conditions',upper:upper,lower:lower}}\n"
+"/'(' lower:integer '-' upper:integer ',' ws age:agecond ')'  {return{type:'conditions',upper:upper,lower:lower,ageconditions:age}}\n"
+"ageParCondExpr= '(' lower:integer '-' upper:integer 'yo' ')' {return{type:'conditions',ageconditions:{upper:upper,lower:lower}}}\n"
+"/ '(' lower:integer 'yo+' ')' {return{type:'conditions',ageconditions:{lower:lower}}}\n"
+"/ '(' lower:integer 'yo' ')' {return{type:'conditions',ageconditions:{lower:lower,upper:lower}}}\n"
+"agecond= int:integer 'yo+' {return {lower: int}}\n"
+"/int:integer 'yo' {return {lower:int,upper:int}}\n"
+"/lower:integer '-' upper:integer {return{ageconditions:{upper:upper,lower:lower}}}"
+"distParExpr='(' miles:integer 'm' yards:integer 'y' ')' {return{type:'distancep',miles:miles,yards:yards}}\n"
+"/'(' furlongs:integer 'f' yards:integer 'y' ')' {return{type:'distancep',furlongs:furlongs,yards:yards}}\n"
+"/'(' miles:integer 'm' furlongs:integer 'f' yards:integer 'y' ')' {return{type:'distancep',miles:miles,furlongs:furlongs,yards:yards}}\n"
+"distExpr=miles:integer 'm' furlongs:'\xBD' 'f' {return{type:'distance',miles:miles,furlongs:furlongs}}\n"
+"/miles:integer 'm' furlongs:integer '\xBD' 'f' {return{type:'distance',miles:miles,furlongs:furlongs + '\xBD'}}\n"
+"/miles:integer 'm' furlongs:integer 'f' {return{type:'distance',miles:miles,furlongs:furlongs}}\n"
+"/miles:integer 'm' {return{type:'distance',miles:miles}}\n"
+"/furlongs:integer 'f' {return{type:'distance',furlongs:furlongs}}\n"
+"goingExpr= going:'Standard' anything {return{type:'going',going:going}}\n"
+"/going:'Heavy' anything {return{type:'going',going:going}}\n"
+"/going:'Soft' anything {return{type:'going',going:going}}\n"
+"integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n"
+"anything=.* {return null}\n";



var resultUrlParser=PEG.buildParser(resultUrlParserStr);

var conditionsParser=PEG.buildParser(conditionsParserStr);


var request = require('request'),
	cheerio = require('cheerio'),
	//url= 'http://www.racingpost.com/horses/horse_home.sd?horse_id=862315',
	//url="http://www.racingpost.com/horses/result_home.sd?race_id=614293",
	url="http://www.racingpost.com/horses2/results/home.sd?r_date=2015-01-13"
	ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2';
 


//ROUTES

app.get('adddata/race',addRaceData);

app.get('/', function (req, res) {
  res.send('Hello World!')
})



function addRaceData(req,res){

	var date=req.param('date');

	logger.info("addRaceData " + date);


}





var parseHorsePage = function(error, response, body) {
	
	if (error || response.statusCode != 200) {
		logger.error(error);
	}
	else {
		//console.log("body: " + body);
		$ = cheerio.load(body);

		$('#horse_form tr').each(function(i,elem){
				//console.log($(elem).html());
				if(i==1){
					var elemType;
					$(elem).find('td').each(function(i,tdel){
						elemType='unk';
						if(i==0) elemType='video';	//don't need
						else if(i==1)elemType='reslink'; //go parse the race to get distance, going, and time of winner
						else if(i==2)elemType='conditions';
						else if(i==3)elemType='weight'; //parse weight carried
						else if(i==4)elemType='outcome'; //get lengths beaten, to calculate speed

						logger.info('type:' + elemType +' td: ' + $(tdel).text());
					});
				}

		});
		
		//$('.title-film').each(function(i, elem) {
		//	var title=$(elem).text();

		//	console.log("title: " + title);
			/*var cinema = $(elem).find('div .col-1');
			var cinemaName = $(cinema).find('h5').text();
			var cinemaAddress = $(cinema).find('.address-cine').text();
			var cinemaCity = $(cinema).find('.city-cine').text(); 
			var cinemaPhone = $(cinema).find('.cine-tel').text(); 
 
			var schedule = $(elem).find('div .col-2');
			$(schedule).find('div .row').each(
				function(key,value){
				var filmName = $(value).find('div .cel-2 a').text();
				var scheduleTime = $(value).find('div .cel-2 .film-orari').text().replace('orari:','');
				console.log("filmName: " + filmName);
				}
				);*/
 
		//})
	}
};


var parseResultPage = function(error, response, body) {
	
	if (error || response.statusCode != 200) {
		logger.error(error);
	}
	else {
		//console.log("body: " + body);
		$ = cheerio.load(body);
		var first=$('.leftColBig ul li').first();
		//console.log("parseResultPage res: " + first.text());

		try{
			var parseConditionsResult=conditionsParser.parse(first.text());
			logger.info(first.text() + "\n" + JSON.stringify(parseConditionsResult) + "\n");

		}catch(err){
			logger.error("parse error: " + err.message + " when parsing " + first.text());

		}
		

		var bs=$('.raceInfo b')

		$(bs).each(function(key,value){
			//console.log("b value: " + $(value).text());
			if($(value).text() =="TIME"){
				//console.log("nodevalue: " + value.nextSibling.nodeValue);
			}
		});



		var texts=$('.raceInfo b').map(function(){
			 return this.nextSibling.nodeValue
		});

		//console.log("l: " + texts.length);
		for(var i=0;i<texts.length;i++){

			//console.log("text: " + texts[i]);
		}
		//console.log(JSON.stringify(texts));



		//raceInfo.each(function(i, elem) {
		//	console.log("elem: " + $(elem).text());
		//	if($(elem).nextSibling)console.log( $(elem).nextSibling.nodeValue);
		//});

		//console.log(raceInfo.html());

	}
}

var parseDatePage=function(error,response,body){
	if (error || response.statusCode != 200) {
		logger.error(error);
	}
	else {
		$ = cheerio.load(body);
		$('.crBlock').each(function(i,mtgElem){

			var mtgText=$(mtgElem).find(".meeting a").not('.bullet').text();

			if((mtgText.indexOf("(")!== -1)&&(mtgText.indexOf(")")!== -1)){
				if((mtgText.indexOf("(AW)")!== -1)||(mtgText.indexOf("(AW)")!== -1)){
					parseDatePageResults(mtgText,mtgElem);
				}

			}
			else{
				parseDatePageResults(mtgText,mtgElem);
			}
			//console.log(mtgText);

		});

	}

}

function parseDatePageResults(mtgText,mtgElem){

	//console.log(mtgText);

	$(mtgElem).find('.resultGrid td a').each(function(i,resultEl){
		//console.log("i: " + i);
		//if(i==1){
			var resultHref=$(resultEl).attr('href');
			var resultText=$(resultEl).text();
			if((resultHref.indexOf('result_home')!== -1)&&(resultText == 'Full result')){
				//console.log("resultHref " + resultHref);
				try{
					var parsedResult=resultUrlParser.parse(resultHref);
					parsedResult.url='http://racingpost.com' + resultHref;
					//console.log(resultHref + "\n"  +JSON.stringify(parsedResult) );
					parseResult(parsedResult);
				}catch(err){
					logger.error("parse error: " + err.message + " when parsing " + resultHref);
				}
			}



		//}
	});
	

}


function parseResult(result){

	var url=result.url;

	request({url:url},parseResultPage);

}





var server = app.listen(app.get('port'), function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
 
 
 /*
request(
    {
        url : url,
      //  headers : {
      //      "User-Agent" : ua
      //  }
    },parseDatePage
);
*/


/* peg grammar pegjs.org/online


//results page header

start=(ws /expr)+

expr=classExpr
/condExpr
/distParExpr
/distExpr
/goingExpr


classExpr="(" "Class" ws int:integer ")"   {return{type:'class', value:int}}

condExpr="(" lower:integer "-" upper:integer ")"  {return{type:'conditions',upper:upper,lower:lower}}
/"(" lower:integer "-" upper:integer "," ws age:agecond ")"  {return{type:'conditions',upper:upper,lower:lower,ageconditions:age}}


agecond= int:integer "yo+" {return int}
/int:integer "yo" {return int}


distParExpr="(" miles:integer "m" yards:integer "y" ")" {return{type:'distancep',miles:miles,yards:yards}}
/"(" furlongs:integer "f" yards:integer "y" ")" {return{type:'distancep',furlongs:furlongs,yards:yards}}

distExpr=miles:integer "m" furlongs:"\xBD" "f" {return{type:'distance',miles:miles,furlongs:furlongs}}

goingExpr= going:"Standard" {return{type:'going',going:going}}

ws=[ \n]+ {return null}

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); } 


  //time from page header

start=expr+
expr=minutes:integer "m" ws seconds:integer "." hundredths:integer "s" ws parexp {return{minutes:minutes,seconds:seconds,hundredths:hundredths}}

parexp="(" anything 

ws=[ \n]+ {return null}

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); } 

anything=.* {return null}


//parse a result url

"start='/horses/result_home.sd?race_id=' raceid:integer '&r_date=' date:date '&popup=yes' {return{raceid:raceid,racedate:date}}\n
integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n 
date=yyyy:integer '-' mm:integer '-' dd:integer {return{day:dd,month:mm,year:yyyy}}"







*/