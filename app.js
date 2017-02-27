var express = require('express');
var PEG = require("pegjs");
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
  
    "databaseurl"     :"52.31.122.201/rpdata",
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

     },
     "scrapedir": "/Users/adriangordon/Development/GP/data/scrape/",
     "datadir":"/Users/adriangordon/Development/GP/data/scrape/",
     "host":'localhost',
     "port":3000,
     "delay":1 //time to wait before downloads
    
  
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


var collections=["races","horses","cards","tomonitor","bets","testbets","spbets"];
var databaseUrl=nconf.get("databaseurl");
var mongojs=require("mongojs");
var db = require("mongojs").connect(databaseUrl, collections);
db.on('error', function (err) {
    logger.error('Connection errored '+ err);
});

var resultUrlParserStr="start='/horses/result_home.sd?race_id=' raceid:integer '&r_date=' date:date '&popup=yes' {return{raceid:raceid,racedate:date}}\ninteger 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\ndate=yyyy:integer '-' mm:integer '-' dd:integer {return{day:dd,month:mm,year:yyyy}}";


/*var priceParseStr="start=(evensExpr /priceExpr)\n"
+"evensExpr=anything 'Evens' anything {return{fractiontop:1, fractionbottom:1}}\n"
+"priceExpr=anything top:integer '/'  bottom:integer anything {return{fractiontop:top,fractionbottom:bottom}}\n"
+"integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n"
+"anything=.* {return null}\n";
*/

/*var priceParseStr="start=( priceExpr /evensExpr)\n"
+"evensExpr= 'Evens'  {return{fractiontop:1, fractionbottom:1}}\n"
+"priceExpr=  top:integer '/'  bottom:integer {return{fractiontop:top,fractionbottom:bottom}}\n"
+"integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n"
+"ws=[ \\n\\t\\r]+ {return null}\n"
+"anything=.* {return null}\n"*/

var cardDateParseStr="start=dateExpr\n"
+"dateExpr=dayTextExpr ', ' day:day month:month year:year {return {year:year,month:month,day:day}}\n"
+"dayTextExpr='MONDAY'\n"
+"/'TUESDAY'\n"
+"/'WEDNESDAY'\n"
+"/'THURSDAY'\n"
+"/'FRIDAY'\n"
+"/'SATURDAY'\n"
+"/'SUNDAY'\n"
+"day=day:[0-9]+ ' ' { return day.join(''); }\n"
+"month='JANUARY ' {return '01'}\n"
+"/'FEBRUARY ' {return '02'}\n"
+"/'MARCH ' {return '03'}\n"
+"/'APRIL ' {return '04'}\n"
+"/'MAY ' {return '05'}\n"
+"/'JUNE ' {return '06'}\n"
+"/'JULY ' {return '07'}\n"
+"/'AUGUST ' {return '08'}\n"
+"/'SEPTEMBER ' {return '09'}\n"
+"/'OCTOBER ' {return '10'}\n"
+"/'NOVEMBER ' {return '11'}\n"
+"/'DECEMBER ' {return '12'}\n"
+"year=year:[0-9]+ { return year.join(''); }\n"




var coursedateParseStr="start=courseExp cdExpr\n"
+"cdExpr= date:date {return{date:date}}\n"
+"anything=text:[a-zA-Z\\n]+ {return text.join('')}\n"
+"date= day:day month:month year:year {return {year:year,month:month,day:day}}\n"
+"day=day:[0-9]+ ' ' { return day.join(''); }\n"
//+"month=month:[a-zA-Z]* ' '{return month.join('')}\n"
+"month='Jan ' {return '01'}\n"
+"/'Feb ' {return '02'}\n"
+"/'Mar ' {return '03'}\n"
+"/'Apr ' {return '04'}\n"
+"/'May ' {return '05'}\n"
+"/'Jun ' {return '06'}\n"
+"/'Jul ' {return '07'}\n"
+"/'Aug ' {return '08'}\n"
+"/'Sep ' {return '09'}\n"
+"/'Oct ' {return '10'}\n"
+"/'Nov ' {return '11'}\n"
+"/'Dec ' {return '12'}\n"
+"year=year:[0-9]+ { return year.join(''); }\n"
+"courseExp=course:[a-zA-Z]* ' Result' {return {course:course.join('').toUpperCase()}}\n"
+"/'Bangor-on-dee Result' {return{course:'BANGOR ON DEE'}}\n"
+"/'Ffos las Result' {return{course:'FFOS LAS'}}\n"
+"/'Market Rasen Result' {return{course:'MARKET RASEN'}}\n"
+"/'Market rasen Result' {return{course:'MARKET RASEN'}}\n"
+"/'Newton abbot Result' {return{course:'NEWTON ABBOT'}}\n"
+"/'Wolverhampton (AW) Result' {return{course:'WOLVERHAMPTON (AW)'}}\n"
+"/'Lingfield (AW) Result' {return{course:'LINGFIELD (AW)'}}\n"
+"/'Southwell (AW) Result' {return{course:'SOUTHWELL (AW)'}}\n"
+"/'Chelmsford (AW) Result' {return{course:'CHELMSFORD (AW)'}}\n"
+"/'Kempton (AW) Result' {return{course:'KEMPTON (AW)'}}\n"
+"/'Newcastle (AW) Result' {return{course:'NEWCASTLE (AW)'}}\n"
+"/course:[a-zA-Z]* ' (IRE) Result' {return {course:course.join('').toUpperCase()}}\n"
+"/'Dundalk (AW) (IRE) Result' {return{course:'DUNDALK (AW)'}}\n"
+"/'Navan (IRE) Result' {return{course:'NAVAN'}}\n"
+"/'Gowran park (IRE) Result' {return{course:'GOWRAN PARK'}}\n"
+"/'Ballinrobe (IRE) Result' {return{course:'BALLINROBE'}}\n"
+"/'Bellewstown (IRE) Result' {return{course:'BELLEWSTOWN'}}\n"
+"/'Clonmel (IRE) Result' {return{course:'CLONMEL'}}\n"
+"/'Cork (IRE) Result' {return{course:'CORK'}}\n"
+"/'Curragh (IRE) Result' {return{course:'CURRAGH'}}\n"
+"/'Down royal (IRE) Result' {return{course:'DOWN ROYAL'}}\n"
+"/'Downpatrick (IRE) Result' {return{course:'DOWNPATRICK'}}\n"
+"/'Fairyhouse (IRE) Result' {return{course:'FAIRYHOUSE'}}\n"
+"/'Galway (IRE) Result' {return{course:'GALWAY'}}\n"
+"/'Kilbeggan (IRE) Result' {return{course:'KILBEGGAN'}}\n"
+"/'Killarney (IRE) Result' {return{course:'KILLARNEY'}}\n"
+"/'Laytown (IRE) Result' {return{course:'LAYTOWN'}}\n"
+"/'Leopardstown (IRE) Result' {return{course:'LEOPARDSTOWN'}}\n"
+"/'Limerick (IRE) Result' {return{course:'LIMERICK'}}\n"
+"/'Listowel (IRE) Result' {return{course:'LISTOWEL'}}\n"
+"/'Naas (IRE) Result' {return{course:'NAAS'}}\n"
+"/'Navan (IRE) Result' {return{course:'NAVAN'}}\n"
+"/'Punchestown (IRE) Result' {return{course:'PUNCHESTOWN'}}\n"
+"/'Roscommon (IRE) Result' {return{course:'ROSCOMMON'}}\n"
+"/'Sligo (IRE) Result' {return{course:'SLIGO'}}\n"
+"/'Thurles (IRE) Result' {return{course:'TURLES'}}\n"
+"/'Tipperary (IRE) Result' {return{course:'TIPPERARY'}}\n"
+"/'Tramore (IRE) Result' {return{course:'TRAMORE'}}\n"
+"/'Wexford (IRE) Result' {return{course:'WEXFORD'}}\n"
+"/'Bennettsbridge (IRE) Result' {return{course:'BENNETTSBRIDGE'}}\n"
+"/'Maralin (IRE) Result' {return{course:'MARALIN'}}\n"
+"/'Rathcannon (IRE) Result' {return{course:'RATHCANNON'}}\n"
+"/'Inch (IRE) Result' {return{course:'INCH'}}\n"
+"/'Taylorstown (IRE) Result' {return{course:'TAYLORSTOWN'}}\n"
+"/'Tinahely (IRE) Result' {return{course:'TINAHELY'}}\n"
+"/'Ballingarry (IRE) Result' {return{course:'BALLINGARRY'}}\n"
+"/'Cregg (IRE) Result' {return{course:'CREGG'}}\n"
+"/'Dromahane (IRE) Result' {return{course:'DROMAHANE'}}\n"
+"/'Fairyhouse p-to-p course (IRE) Result' {return{course:'FAIRYHOUSE P TO P'}}\n"
+"/'Tallanstown (IRE) Result' {return{course:'TALLANSTOWN'}}\n"
+"/'Loughbrickland (IRE) Result' {return{course:'LOUGHBRICKLAND'}}\n"
+"/'Ballyragget (IRE) Result' {return{course:'BALLYRAGGET'}}\n"
+"/'Oldcastle (IRE) Result' {return{course:'OLDCASTLE'}}\n"
+"/'Castletown-geoghegan (IRE) Result' {return{course:'CASTLETOWN-GEOGHAN'}}\n"
+"/'Templenacarriga (IRE) Result' {return{course:'TEMPLENACARRIGA'}}\n"
+"/'Cragmore (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Loughanmore (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Ballynoe (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Laurencetown (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Borris house (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Durrow (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Belharbour (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Tattersalls farm (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Kinsale (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Avaune (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Liscarroll (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Boulta (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Ballyvodock (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Ballyarthur (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Ballydurn (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Curraheen (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Lismore (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Tyrella (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Dawstown (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Necarne (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Farmaclaffley (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Largy (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Askeaton (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Curraghmore (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Lisronagh (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Tallow (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Kildorrery (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Aghabullogue (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'The pigeons (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Horse & jockey (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Dowth hall (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Sligo point-to-point course (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Tralee p-t-p course (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/'Tramore p-t-p course (IRE) Result' {return{course:'IRISH P TO P'}}\n"
+"/course:[a-zA-Z]* ' (FR) Result' {return {course:course.join('').toUpperCase()}}\n"
+"/'Maisons-laffitte (FR) Result' {return{course:'MAISONS-LAFFITTE'}}\n"
+"/'Deauville (FR) Result' {return{course:'DEAUVILLE'}}\n"
+"/'Saint-malo (FR) Result' {return{course:'SAINT-MALO'}}\n"
+"/'Nancy (FR) Result' {return{course:'NANCY'}}\n"
+"/'Clairefontaine (FR) Result' {return{course:'CLAIREFONTAINE'}}\n"
+"/'Bordeaux le bouscat (FR) Result' {return{course:'BORDEAUX LE BOUSCAT'}}\n"
+"/'Chantilly (FR) Result' {return{course:'CHANTILLY'}}\n"
+"/'Strasbourg (FR) Result' {return{course:'STRASBOURG'}}\n"
+"/'Longchamp (FR) Result' {return{course:'LONGCHAMP'}}\n"
+"/'La teste de buch (FR) Result' {return{course:'LA TESTE DE BUCH'}}\n"
+"/'Compiegne (FR) Result' {return{course:'COMPIEGNE'}}\n"
+"/'Mont-de-marsan (FR) Result' {return{course:'MONT DE MARSAN'}}\n"
+"/'Auteuil (FR) Result' {return{course:'AUTEUIL'}}\n"
+"/'Argentan (FR) Result' {return{course:'ARGENTAN'}}\n"
+"/'Saint-cloud (FR) Result' {return{course:'SAINT-CLOUD'}}\n"
+"/'Dax (FR) Result' {return{course:'DAX'}}\n"
+"/'Angouleme (FR) Result' {return{course:'ANGOULEME'}}\n"
+"/'Enghien (FR) Result' {return{course:'ENGHIEN'}}\n"
+"/'Granville-st pair sur mer (FR) Result' {return{course:'GRANVILLE-ST PAIR SUR MER'}}\n"
+"/'Pau (FR) Result' {return{course:'PAU'}}\n"
+"/'Cluny (FR) Result' {return{course:'CLUNY'}}\n"
+"/'Brehal (FR) Result' {return{course:'BREHAL'}}\n"
+"/'Vittel (FR) Result' {return{course:'VITTEL'}}\n"
+"/'Chateaubriant (FR) Result' {return{course:'CHATEAUBRIANT'}}\n"
+"/'Craon (FR) Result' {return{course:'CRAON'}}\n"
+"/'Angers (FR) Result' {return{course:'ANGERS'}}\n"
+"/'Tarbes (FR) Result' {return{course:'TARBES'}}\n"
+"/'Toulouse (FR) Result' {return{course:'TOULOUSE'}}\n"
+"/'Dieppe (FR) Result' {return{course:'DIEPPE'}}\n"
+"/'Pornichet-la baule (FR) Result' {return{course:'PORNICHET-LA BAULE'}}\n"
+"/'Le Mans (FR) Result' {return{course:'LE MANS'}}\n"
+"/'Le lion-dangers (FR) Result' {return{course:'LE LION D ANGERS'}}\n"
+"/'Lyon parilly (FR) Result' {return{course:'LYON PARILLY'}}\n"
+"/'Aix-les-bains (FR) Result' {return{course:'AIX-LES-BAINS'}}\n"
+"/'Cagnes-sur-mer (FR) Result' {return{course:'CAGNES SUR MER'}}\n"
+"/'Le croise-laroche (FR) Result' {return{course:'LE CROISE-LAROCHE'}}\n"
+"/'Divonne-les-bains (FR) Result' {return{course:'DIVONNE-LES-BAINS'}}\n"
+"/'Meslay-du-maine (FR) Result' {return{course:'MESLAY-DU-MAINE'}}\n"
+"/'Saint-brieuc (FR) Result' {return{course:'SAINT-BRIEUC'}}\n"
+"/'Rochefort-sur-loire (FR) Result' {return{course:'ROCHEFORT-SUR-LOIRE'}}\n"
+"/'Royan la palmyre (FR) Result' {return{course:'ROYAN LA PALMYRE'}}\n"
+"/'Montier-en-der (FR) Result' {return{course:'MONTIER EN DER'}}\n"
+"/'Marseille borely (FR) Result' {return{course:'MARSEILLE BORELY'}}\n"
+"/'Lyon-la soie (FR) Result' {return{course:'LYON_LA SOIE'}}\n"
+"/'Castera-verduzan (FR) Result' {return{course:'CASTERA-VERDUZAN'}}\n"
+"/'Les sables-dolonne (FR) Result' {return{course:'LES SABLES D OLONNE'}}\n"
+"/course:[a-zA-Z]* ' (UAE) Result' {return {course:course.join('').toUpperCase()}}\n"
+"/'Meydan (UAE) Result' {return{course:'MEYDAN'}}\n"
+"/'Abu dhabi (UAE) Result' {return{course:'ABU DHABI'}}\n"
+"/'Doha (QA) Result' {return{course:'ABU DHABI'}}\n"
+"/'Al ain (UAE) Result' {return{course:'AL AIN'}}\n"
+"/'Jebel ali (UAE) Result' {return{course:'JEBEL ALI'}}\n"
+"/course:[a-zA-Z]* ' (AUS) Result' {return {course:course.join('').toUpperCase()}}\n"
+"/'Caulfield (AUS) Result' {return{course:'CAULFIELD'}}\n"
+"/'Mornington (AUS) Result' {return{course:'MORNINGTON'}}\n"
+"/'Kembla grange (AUS) Result' {return{course:'KEMPLA GRANGE'}}\n"
+"/'Moonee valley (AUS) Result' {return{course:'MOONEE VALLEY'}}\n"
+"/course:[a-zA-Z]* ' (SAF) Result' {return {course:course.join('').toUpperCase()}}\n"
+"/'Turffontein (SAF) Result' {return{course:'TURFFONTEIN'}}\n"
+"/'Scottsville (SAF) Result' {return{course:'SCOTTSVILLE'}}\n"
+"/'Kenilworth (SAF) Result' {return{course:'KENILWORTH'}}\n"
+"/course:[a-zA-Z]* ' (GER) Result' {return {course:course.join('').toUpperCase()}}\n"
+"/'Cologne (GER) Result' {return{course:'COLOGNE'}}\n"
+"/'Baden-baden (GER) Result' {return{course:'BADEN-BADEN'}}\n"





var priceParseStr="start= priceExpr\n"
+"evensExpr= ignore* 'Evens' ignore* {return{fractiontop:1, fractionbottom:1}}\n"
+"priceExpr= ignore* top:integer '/'  bottom:integer ignore* {return{fractiontop:top,fractionbottom:bottom}}\n"
+"integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n"
+"ignore=ws\n"
+"/anything\n"
+"ws=[ \\n\\t\\r]+ {return null}\n"
+"anything=[a-zA-Z()\'] {return null}\n";

var cardConditionsParserStr="start= (ws /expr)+\n"
+"ws=[ \\n]+ {return null}\n"
+"expr=classExpr\n"
+"/condExpr\n"
+"/ageParCondExpr\n"
+"/ageORCondExpr\n"
+"classExpr='(' 'CLASS' ws int:integer ')'   {return{conditiontype:'class', value:int}}\n"
+"/'(' 'Grade' ws int:integer ')'   {return{conditiontype:'grade', value:int}}\n"
+"/'(' 'Class' ws int:integer ')'   {return{conditiontype:'class', value:int}}\n"
+"ageORCondExpr='(' agecond:agecond ' ' ORCond:ORCond ')' {return[agecond,ORCond]}\n"
+"condExpr='(' lower:integer '-' upper:integer ')'  {return{conditiontype:'conditions',upper:upper,lower:lower}}\n"
+"/'(' lower:integer '-' upper:integer ',' ws age:agecond ')'  {return{conditiontype:'conditions',upper:upper,lower:lower,ageconditions:age}}\n"
+"ageParCondExpr= '(' lower:integer '-' upper:integer 'yo' ')' {return{conditiontype:'conditions',ageconditions:{upper:upper,lower:lower}}}\n"
+"/ '(' lower:integer 'yo+' ')' {return{conditiontype:'conditions',ageconditions:{lower:lower}}}\n"
+"/ '(' lower:integer 'yo' ')' {return{conditiontype:'conditions',ageconditions:{lower:lower,upper:lower}}}\n"
+"agecond= int:integer 'yo+' {return {conditiontype:'conditions', ageconditions:{lower: int}}}\n"
+"/int:integer 'yo' {return {conditiontype:'conditions',ageconditions:{lower:int,upper:int}}}\n"
+"/lower:integer '-' upper:integer {return{condtitiontype:'conditions',ageconditions:{upper:upper,lower:lower}}}\n"
+"ORCond= lower:integer '-' upper:integer  {return{conditiontype:'conditions',upper:upper,lower:lower}}\n"
+"integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n"
+"anything=.* {return null}";


var cardDistParserStr="start=de:distExpr ' Inner' {return de}\n"
+"/de:distExpr ' Old' {return de}\n"
+"/de:distExpr ' New' {return de}\n"
+"/de:distExpr ' Grand National' {return de}\n"
+"/de:distExpr ' Row' {return de}\n"
+"/distExpr\n"
+"distExpr=miles:integer 'm' yards:integer 'y'  {return{miles:miles,yards:yards}}\n"
+"/furlongs:integer 'f' yards:integer 'y'  {return{furlongs:furlongs,yards:yards}}\n"
+"/miles:integer 'm' furlongs:integer 'f' yards:integer 'y'  {return{miles:miles,furlongs:furlongs,yards:yards}}\n"
+"/miles:integer 'm' furlongs:integer 'f'  {return{miles:miles,furlongs:furlongs}}\n"
+"/furlongs:integer 'f'  {return{furlongs:furlongs}}\n"
+"/miles:integer 'm'  {return{miles:miles}}\n"
+"integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n"

var cardGoingParserStr="start=goingExpr\n"
+"goingExpr= going:'Standard To Slow' anything {return{going:going}}\n"
+"/going:'Standard' anything {return{going:going}}\n"
+"/going:'Slow' anything {return{going:going}}\n"
+"/going:'Fast' anything {return{going:going}}\n"
+"/going:'Heavy' anything {return{going:going}}\n"
+"/going:'Very Soft' anything {return{going:'HEAVY'}}\n"
+"/going:'Soft' anything {return{going:going}}\n"
+"/going:'Good To Soft' anything {return{going:going}}\n"
+"/going:'Good To Firm' anything {return{going:going}}\n"
+"/going:'Good To Yielding' anything {return{going:going}}\n"
+"/going:'Good' anything {return{going:going}}\n"
+"/going:'Firm' anything {return{going:going}}\n"
+"/going:'Yielding' anything {return{going:going}}\n"
+"integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n"
+"anything=.* {return null}\n";


var conditionsParserStr="start=(ws /expr)+\n"
+"ws=[ \\n]+ {return null}\n"
+"expr=classExpr\n"
+"/condExpr\n"
+"/ageParCondExpr\n"
+"/distParExpr\n"
+"/distExpr\n"
+"/distCourseExpr\n"
+"/goingExpr\n"
+"classExpr='(' 'Class' ws int:integer ')'   {return{conditiontype:'class', value:int}}\n"
+"condExpr='(' lower:integer '-' upper:integer ')'  {return{conditiontype:'conditions',upper:upper,lower:lower}}\n"
+"/'(' lower:integer '-' upper:integer ',' ws age:agecond ')'  {return{conditiontype:'conditions',upper:upper,lower:lower,ageconditions:age}}\n"
+"ageParCondExpr= '(' lower:integer '-' upper:integer 'yo' ')' {return{conditiontype:'conditions',ageconditions:{upper:upper,lower:lower}}}\n"

+"/ '(' integer '-' integer ', ' lower:integer '-' upper:integer 'yo' ')' {return{conditiontype:'conditions',ageconditions:{upper:upper,lower:lower}}}\n"

+"/ '(' integer '-' integer ', ' lower:integer 'yo+' ')' {return{conditiontype:'conditions',ageconditions:{lower:lower}}}\n"
+"/ '(--, ' lower:integer 'yo+' ')' {return{conditiontype:'conditions',ageconditions:{lower:lower}}}\n"
+"/ '(--, ' lower:integer 'yo' ')' {return{conditiontype:'conditions',ageconditions:{lower:lower}}}\n"
+"/ '(--, ' lower:integer '-' upper:integer 'yo' ')' {return{conditiontype:'conditions',ageconditions:{lower:lower,upper:upper}}}\n"
+"/ '(' lower:integer 'yo+' ')' {return{conditiontype:'conditions',ageconditions:{lower:lower}}}\n"
+"/ '(' lower:integer 'yo' ')' {return{conditiontype:'conditions',ageconditions:{lower:lower,upper:lower}}}\n"
+"agecond= int:integer 'yo+' {return {lower: int}}\n"
+"/int:integer 'yo' {return {lower:int,upper:int}}\n"
+"/lower:integer '-' upper:integer {return{ageconditions:{upper:upper,lower:lower}}}"
+"distParExpr='(' miles:integer 'm' yards:integer 'y' ')' {return{conditiontype:'distancep',miles:miles,yards:yards}}\n"
+"/'(' miles:integer 'm' yards:integer 'yds' ')' {return{conditiontype:'distancep',miles:miles,yards:yards}}\n"
+"/'(' furlongs:integer 'f' yards:integer 'y' ')' {return{conditiontype:'distancep',furlongs:furlongs,yards:yards}}\n"
+"/'(' furlongs:integer 'f' yards:integer 'yds' ')' {return{conditiontype:'distancep',furlongs:furlongs,yards:yards}}\n"
+"/'(' miles:integer 'm' furlongs:integer 'f' yards:integer 'y' ')' {return{conditiontype:'distancep',miles:miles,furlongs:furlongs,yards:yards}}\n"
+"/'(' miles:integer 'm' furlongs:integer 'f' yards:integer 'yds' ')' {return{conditiontype:'distancep',miles:miles,furlongs:furlongs,yards:yards}}\n"
+"distExpr=miles:integer 'm' furlongs:'\xBD' 'f' {return{conditiontype:'distance',miles:miles,furlongs:furlongs}}\n"
+"/miles:integer 'm' furlongs:integer '\xBD' 'f' {return{conditiontype:'distance',miles:miles,furlongs:furlongs + '\xBD'}}\n"
+"/miles:integer 'm' furlongs:integer 'f' {return{conditiontype:'distance',miles:miles,furlongs:furlongs}}\n"
+"/miles:integer 'm' {return{conditiontype:'distance',miles:miles}}\n"
+"/furlongs:integer 'f' {return{conditiontype:'distance',furlongs:furlongs}}\n"
+"/furlongs:integer '\xBD' 'f' {return{conditiontype:'distance',furlongs:furlongs}}\n"
+"distCourseExpr='Str'\n"
+"/'Rnd' {return null}\n"
+"/'OMS' {return null}\n"
+"/'Inner' {return null}\n"
+"/'July' {return null}\n"
+"/'Row' {return null}\n"
+"/'omsNew' {return null}\n"
+"/'New' {return null}\n"
+"/'Poly' {return null}\n"
+"/'Old' {return null}\n"
+"/'Grand National' {return null}\n"
+"/'Row' {return null}\n"
+"/'Mildmay' {return null}\n"
+"/'Brush' {return null}\n"
+"/'Winter' {return null}\n"
+"/'Summer' {return null}\n"
+"/'X-Country' {return null}\n"
+"/'Tap' {return null}\n"
+"/'Bank' {return null}\n"
+"goingExpr= going:'Standard To Slow' anything {return{conditiontype:'going',going:going}}\n"
+"/going:'Standard' anything {return{conditiontype:'going',going:going}}\n"
+"/going:'Slow' anything {return{conditiontype:'going',going:going}}\n"
+"/going:'Fast' anything {return{conditiontype:'going',going:going}}\n"
+"/going:'Heavy' anything {return{conditiontype:'going',going:going}}\n"
+"/going:'Very Soft' anything {return{conditiontype:'going',going:'Heavy'}}\n"
+"/going:'Hard' anything {return{conditiontype:'going',going:'Firm'}}\n"
+"/going:'Holding' anything {return{conditiontype:'going',going:'Soft'}}\n"
+"/going:'Soft' anything {return{conditiontype:'going',going:going}}\n"
+"/going:'Good To Soft' anything {return{conditiontype:'going',going:going}}\n"
+"/going:'Good To Firm' anything {return{conditiontype:'going',going:going}}\n"
+"/going:'Good To Yielding' anything {return{conditiontype:'going',going:going}}\n"
+"/going:'Good' anything {return{conditiontype:'going',going:going}}\n"
+"/going:'Firm' anything {return{conditiontype:'going',going:going}}\n"
+"/going:'Yielding' anything {return{conditiontype:'going',going:going}}\n"
+"integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n"
+"anything=.* {return null}\n";

var timeParserStr="start=(ws /timeexpr)+\n"
+"ws=[ \\n]+ {return null}\n"
+"timeexpr=minutes:integer 'm' ' ' seconds:integer '.' milliseconds:integer 's' anything {return{minutes:minutes, seconds:seconds,milliseconds:milliseconds}}\n"
+"/seconds:integer '.' milliseconds:integer 's' anything {return{minutes:0, seconds:seconds,milliseconds:milliseconds}}\n"
+"integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n"
+"anything=.* {return null}\n";

//distance beaten, this is:
var distParserStr="start=(integerspace/integerfraction/integer/fraction/space/desc)\n"
+"integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n"
+"integerspace=int:integer ' '{return int}\n"
+"integerfraction= int:integer frac:fraction {return (int + frac)}\n"
+"fraction='\xBE ' {return 0.75}\n"
+"/'\xBE' {return 0.75}\n"
+"/'\xBD ' {return 0.5}\n"
+"/'\xBD' {return 0.5}\n"
+"/'\xBC ' {return 0.25}\n"
+"/'\xBC' {return 0.25}\n"
+"space= ' ' {return 0}\n"
+"desc='nk ' {return 0.25}\n"
+"/'nk' {return 0.25}\n"
+"/'snk ' {return 0.25}\n"
+"/'snk' {return 0.25}\n"
+"/'hd ' {return 0.1}\n"
+"/'hd' {return 0.1}\n"
+"/'nse' {return 0.02}\n"
+"/'nse ' {return 0.02}\n"
+"/'shd ' {return 0.05}\n"
+"/'shd' {return 0.05}\n"
+"/'dht ' {return 0.0}\n"
+"/'dht' {return 0.0}\n"
+"/'dist ' {return 30.0}\n"
+"/'dist' {return 30.0}\n"

var weightParseStr="start=sts:integer '-' lbs:integer anything {return ((sts * 14) + lbs)}\n"
+"integer 'integer'= digits:[0-9]+ { return parseInt(digits.join(''), 10); }\n"
+"anything=.* {return null}\n";


var horseDateParseStr="start=day:twodigits month:monthExpr year:twodigits {return ('20' +year + '-' +month + '-' + day)}\n"
+"twodigits= digits:[0-9]+ {return digits.join('');}\n" 
+"monthExpr=month:'Jan' {return '01'}\n"
+"/month:'Feb' {return '02'}\n"
+"/month:'Mar' {return '03'}\n"
+"/month:'Apr' {return '04'}\n"
+"/month:'May' {return '05'}\n"
+"/month:'Jun' {return '06'}\n"
+"/month:'Jul' {return '07'}\n"
+"/month:'Aug' {return '08'}\n"
+"/month:'Sep' {return '09'}\n"
+"/month:'Oct' {return '10'}\n"
+"/month:'Nov' {return '11'}\n"
+"/month:'Dec' {return '12'}\n"


var lengthsPerSecond={
	"FLAT":{
		"TURF":{
			"Firm":6,
			"Good To Firm":6,
			"Good":6,
			"Good To Soft":5.5,
			"Good To Yielding":5.5,
			"Soft":5,
			"Yielding":5,
			"Heavy":5

		},
		"AW":{
			 "LINGFIELD (AW)":6,
			 "KEMPTON (AW)":6,
			 "WOLVERHAMPTON (AW)": 6,
			 "SOUTHWELL (AW)" : 5,
			 "CHELMSFORD (AW)":6,
			 "DUNDALK (AW)":6,
       "DUNDALK (AW) (IRE)":6,
       "MEYDAN":6,
       "AL AIN":6

		}

	},
	"HURDLE":{
			"Firm":5,
			"Good To Firm":5,
			"Good":5,
			"Good To Soft":4.5,
			"Good To Yielding":4.5,
			"Soft":4,
			"Yielding":4,
			"Heavy":4

	},
	"CHASE":{
			"Firm":5,
			"Good To Firm":5,
			"Good":5,
			"Good To Soft":4.5,
			"Good To Yielding":4.5,
			"Soft":4,
			"Yielding":4,
			"Heavy":4
	}
}


/* USAGE: getLPS('FLAT','AW','LINGFIELD (AW)', 'Good',)*/
function getLPS(raceType,surface,course,going,url){
	//logger.info("getLPS " + raceType + " " + surface + " " + course + " " + going);
	try{
	var lps;
	var typeObj=lengthsPerSecond[raceType];

	if(raceType=='FLAT'){
		if(surface=='TURF'){
			lps=typeObj['TURF'][going];

		}
		else{
			lps=typeObj["AW"][course];
		}
	}
	else{
		lps=typeObj[going];
	}
	if(typeof lps == 'undefined'){
		logger.error("No LPS: " + raceType + " " + surface + " |" + course + "| " + going + "|" + url);
		if(raceType=='FLAT'){
			return(5.5);
		}
		else{
			return(4.5);
		}
	}
	else{
		//logger.info("LPS returns: " + lps);
	}


	return(lps);
	}catch(err){
		logger.error("error in getLPS: " + err + " " + raceType + " " + surface + " " + course + " " + going + "|" + url);
		
		if(raceType=='FLAT'){
			return(5.5);
		}
		else{
			return(4.5);
		}
	}

}



var resultUrlParser=PEG.buildParser(resultUrlParserStr);

var conditionsParser=PEG.buildParser(conditionsParserStr);

var timeParser=PEG.buildParser(timeParserStr);

var distParser=PEG.buildParser(distParserStr);

var weightParser=PEG.buildParser(weightParseStr);

var horseDateParser=PEG.buildParser(horseDateParseStr);

var priceParser=PEG.buildParser(priceParseStr);

var coursedateParser=PEG.buildParser(coursedateParseStr);

var cardDateParser=PEG.buildParser(cardDateParseStr);

var cardConditionsParser=PEG.buildParser(cardConditionsParserStr);

var cardDistParser=PEG.buildParser(cardDistParserStr);

var cardGoingParser=PEG.buildParser(cardGoingParserStr);




//var price=priceParser.parse( "\n Waady\n(IRE) 11/4F\n ");
//logger.info("price: " + JSON.stringify(price));


var request = require('request'),
	srequest=require('sync-request'),
	cheerio = require('cheerio');


var path = require('path');


var app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine','jade');

var server = app.listen(nconf.get("port"), function () {

  var host = server.address().address
  var port = server.address().port

 logger.info("app listening at http://" + host + ":" + port);

});

//ROUTES

app.get('/', function (req, res) {
  res.send('Hello World!')
})


/* USAGE: /getdateresults?date=2015-06-13&return=html|json - json by default */
app.get('/getdateresults',getDateResults);

/*USAGE /getdatecards?date=2016-02-21*/
app.get('/getdatecards',getDateCards);

/* USAGE: /getraceresult?raceid=627325 */
/* /getraceresult?resulturl=/results/54/sandown/2017-02-04/666912*/
app.get('/getraceresult',getRaceResult);

/*USAGE: /gethorsedates?horseid=859709*/
app.get('/gethorsedates',getHorseDates);

/*USAGE: /gethorseraces?horseid=859709*/
app.get('/gethorseraces',getHorseRaces);

/*USAGE: /gethorsename?horseid=859709*/
app.get('/gethorsename',getHorseName);

/*USAGE: /getcarddata?raceid=642388*/
/*		/getcarddata?raceurl=/racecards/393/lingfield-aw/2017-02-24/668167*/
app.get('/getcarddata',getCardData);

/*USAGE: /deletecard?raceid=642388*/
app.get('/deletecard',deleteCard)

app.get('/betsreport',betsReport);

app.get('/layracesreport',layRacesReport);

app.get('/dailyreport', getDailyReport);

app.get('/cardreport',getCardReport);

app.get('/horseracereport',getHorseRaceReport);

//get race from db
app.get('/getracereport',getRaceReport);



app.get('/getgaussians',getGaussians);

app.get('/betbatch',betBatch);

app.get('/resultsbatch',resultsBatch);


function betsReport(req,res){
  var collectionS=req.query.collection;
  var marketType=req.query.market;//WIN or PLACE
  var betType=req.query.bettype;//BACK or LAY
  var code=req.query.code; //FLAT or JUMPS, or undefined
  var excludeShorter=req.query.excludeshorter;
  var sortField=req.query.sort; //probability, return, price
  var minPrice=req.query.minprice;
  var maxPrice=req.query.maxprice;
  var minReturn=req.query.minreturn;
  var maxReturn=req.query.maxreturn;
  var minProbability=req.query.minprobability;
  var maxProbability=req.query.maxprobability;
  var outputType=req.query.output;
  var cumulativeReturn=0.0;
  var proportionS=req.query.bankpercent;
  var layProportion=0.05; //default 5%  of bank per lay bet
  var backProportion=0.02;//default 2% of bank per back bet
  //build sort object
  var collection=db.bets; //default collection to run the query against
  if(typeof collectionS != 'undefined'){
    if(collectionS == 'bets')collection=db.bets;
    if(collectionS=='spbets')collection=db.spbets;
  }
  
  if(typeof proportionS != 'undefined'){
    if(betType=="LAY"){
      layProportion=parseFloat(proportionS);
    }
    else{
      backProportion=parseFloat(proportionS);
    }
  }

  var returnArray=[];
  var queryObject={
    marketType:marketType
  }
  if(code=='FLAT'){
    queryObject.racetype='FLAT'
  }
  else if(code=='JUMPS'){
    queryObject.$or=[{racetype:'HURDLE'},{racetype:'CHASE'}]
  }
  //{ $or: [ { <expression1> }, { <expression2> }, ... , { <expressionN> } ] }
  logger.info("QueryObject: " + JSON.stringify(queryObject));
  
  collection.find(queryObject).sort({offtime:1},function(err,bets){
  //db.testbets.find(queryObject,function(err,bets){
    if(err){
      logger.error(err);
    }
    //logger.info("bets: " + JSON.stringify(bets));
    for(var i=0;i<bets.length;i++){
      var bet=bets[i];
      //logger.info("bet: " + JSON.stringify(bet));
      var horses=bet.horses;
      var nHorses=Object.keys(horses).length;
      var excludeRace=false;

      if(typeof excludeShorter != 'undefined'){
          for(horse in horses){
            var horseObj=horses[horse];
            if(horseObj.bestBackWinPrice < excludeShorter){
              excludeRace=true;
              break;
            }
          }

        }

      if(!excludeRace){




          for(horse in horses){


            var horseObj=horses[horse];
           // logger.info(JSON.stringify(horseObj));
            if(horseObj.status=='WINNER' || horseObj.status=='LOSER'){

                var betObject={
                  markettype:marketType,
                  bettype:betType,
                  venue:bet.venue,
                  offtime:bet.offtime,
                  code:bet.racetype
                }

                var price;
                var probability;
                var expectedReturn;
                var actualReturn;


                if(marketType=="WIN"){
                    if(betType=='BACK'){
                      price=horseObj.bestBackWinPrice;
                      probability=horseObj.winProbability;
                      expectedReturn=horseObj.winBackReturn;
                      if(horseObj.status=='WINNER'){
                        actualReturn= (price -1)* 0.95;
                  

                      }
                      else if(horseObj.status=='LOSER'){
                        actualReturn=-1;

                      }



                    }
                    else if(betType=='LAY'){
                        price=horseObj.bestLayWinPrice;
                        probability=horseObj.winProbability;
                        expectedReturn=horseObj.winLayReturn;
                        if(horseObj.status=='WINNER'){
                          actualReturn= -1;
        
                        }
                        else if(horseObj.status=='LOSER'){
                          actualReturn=(1 /(price -1.0))* 0.95;

                        }

                    }

                }
                else if(marketType=="PLACE"){
                  if(betType=='BACK'){
                      price=horseObj.bestBackPlacePrice;
                      probability=horseObj.placeProbability;
                      expectedReturn=horseObj.placeBackReturn;
                      if(horseObj.status=='WINNER'){
                        actualReturn= (price -1)* 0.95

                      }
                      else if(horseObj.status=='LOSER'){
                        actualReturn=-1;

                      }

                    }
                    else if(betType=='LAY'){
                        price=horseObj.bestLayPlacePrice;
                        probability=horseObj.placeProbability;
                        expectedReturn=horseObj.placeLayReturn;
                        if(horseObj.status=='WINNER'){
                          actualReturn= -1

                        }
                        else if(horseObj.status=='LOSER'){
                          actualReturn=(1 /(price -1.0))* 0.95;

                        }
                      
                    }

                }

                //logger.info("actualReturn: " + actualReturn);
                betObject.horse=horse;
                betObject.price=price;
                betObject.probability=probability;
                betObject.expectedReturn=expectedReturn;
                betObject.actualReturn=actualReturn;


                //test whether we include the horse
                var includeHorse=true;

                if(typeof minPrice != 'undefined'){
                  if(betObject.price < minPrice)
                    includeHorse=false;
                }
                if(typeof maxPrice != 'undefined'){
                  if(betObject.price > maxPrice)
                    includeHorse=false;
                }

                if(typeof minReturn != 'undefined'){
                  if(betObject.expectedReturn < minReturn)
                    includeHorse=false;
                }
                if(typeof maxReturn != 'undefined'){
                  if(betObject.expectedReturn > maxReturn)
                    includeHorse=false;
                }

                if(typeof minProbability != 'undefined'){
                  if(betObject.probability < minProbability)
                    includeHorse=false;
                }
                if(typeof maxProbability != 'undefined'){
                  if(betObject.probability > maxProbability)
                    includeHorse=false;
                }


                if(betObject.price && includeHorse){
                 
                  returnArray.push(betObject);
                }
            }
          }
    }

    }

    if(typeof sortField !== 'undefined'){
      if(sortField=='probability'){
        returnArray=returnArray.sort(function(a,b){
          if(a.probability < b.probability)
            return(-1);
          if(a.probability > b.probability)
            return(1);
          return(0);
          
        })
      }
      
      else if(sortField=='return'){
        returnArray=returnArray.sort(function(a,b){
          if(a.expectedReturn < b.expectedReturn)
            return(-1);
          if(a.expectedReturn > b.expectedReturn)
            return(1);
          return(0);
          
        })
      }
      else if(sortField=='price'){
        returnArray=returnArray.sort(function(a,b){
          if(a.price < b.price)
            return(-1);
          if(a.price > b.price)
            return(1);
          return(0);
          
        })
      }

    }

    var runners=returnArray.length;
    var winners=0;
    var expected=0;
    var bank=100.0;
    var stake;
    for(var i=0;i<returnArray.length;i++){
      var theProbability;
      var isWinner=false;
      var pOdds=1/returnArray[i].price;
      if(betType=='LAY'){
        theProbability=1-pOdds;
        stake=bank * layProportion;

      }
      else{
        theProbability=pOdds;
        stake=bank * backProportion;

      }
      if(returnArray[i].actualReturn > 0){
          isWinner=true;
        }
      if(isWinner){
        winners++;
        if(betType=='LAY'){ //winning lay bet
          bank += returnArray[i].actualReturn * stake;
        }
        else{//winning back bet
          bank+= stake * (returnArray[i].price -1);
        }
      }
      else{
        if(betType=='LAY'){ //losing lay bet
          bank -= stake;
        }
        else{ //losing back bet
          bank -= stake;
        }
      }
      expected+=theProbability;
      cumulativeReturn+=returnArray[i].actualReturn;
      returnArray[i].isWinner=isWinner;
      returnArray[i].stake=stake;
      returnArray[i].cumulativeReturn=cumulativeReturn;
      returnArray[i].bank=bank;

    }
    // else{
    //  res.json(returnArray);
    //}
    var archie=(runners * ((winners-expected)*(winners-expected)))/(expected *(runners-expected));
    var roi=cumulativeReturn / runners;
    var winpercent=(winners/runners);

    if(outputType=='gnuplot'){
      var str="#n\tprice\tstake\tprobability\texpectedreturn\tcumulativereturn\tbank\tofftime\thorse\tiswinner\n";
      for(var i=0;i<returnArray.length;i++){
        str+=i + "\t"  +returnArray[i].price + "\t" +returnArray[i].stake + "\t"  + returnArray[i].probability + "\t"+ returnArray[i].expectedReturn + "\t" +returnArray[i].cumulativeReturn + "\t" +returnArray[i].bank + "\t"+ returnArray[i].offtime + "\t" + returnArray[i].horse + "\t" + returnArray[i].isWinner +"\n";
      }

      str+="#runners: " + runners + " winners: " + winners + "(" + winpercent.toFixed(3) + ") ROI: " + roi.toFixed(3) + " Archie: " + archie.toFixed(3) + "layProportion:  " + layProportion + " backProportion: " + backProportion + "\n";  
      res.end(str);

    }
    else{
      res.json(returnArray);
    }


  })

 

}

function layRacesReport(req,res){

  var marketType=req.query.market;//WIN or PLACE
  var code=req.query.code; //FLAT or JUMPS, or undefined
  var maxOdds =req.query.maxodds;
  var maxProbability=req.query.maxprob;
  var betType="LAY";
  
  var returnArray=[];
  var queryObject={
    marketType:marketType
  }
  if(code=='FLAT'){
    queryObject.racetype='FLAT'
  }
  else if(code=='JUMPS'){
    queryObject.$or=[{racetype:'HURDLE'},{racetype:'CHASE'}]
  }
  //{ $or: [ { <expression1> }, { <expression2> }, ... , { <expressionN> } ] }
  logger.info("QueryObject: " + JSON.stringify(queryObject));
  //db.bets.find(queryObject).sort({offtime:1},function(err,bets){
  db.testbets.find(queryObject,function(err,bets){
    if(err){
      logger.error(err);
    }
    //logger.info("bets: " + JSON.stringify(bets));
    for(var i=0;i<bets.length;i++){
      var bet=bets[i];
      //logger.info("bet: " + JSON.stringify(bet));
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
            if(nextHorse.winLayReturn > 0){

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
                    if(betObject.price)returnArray.push(betObject);

                    }



              cumulativeProbability+=nextHorse.winProbability;
              if(cumulativeProbability> maxProbability){
                break; //next race
              }
            }
          }

       }



      /*    for(horse in horses){


            var horseObj=horses[horse];
           // logger.info(JSON.stringify(horseObj));
            if(horseObj.status=='WINNER' || horseObj.status=='LOSER'){

                var betObject={
                  markettype:marketType,
                  bettype:betType,
                  venue:bet.venue,
                  offtime:bet.offtime,
                  code:bet.racetype
                }

                var price;
                var probability;
                var expectedReturn;
                var actualReturn;


                if(marketType=="WIN"){
                    if(betType=='BACK'){
                      price=horseObj.bestBackWinPrice;
                      probability=horseObj.winProbability;
                      expectedReturn=horseObj.winBackReturn;
                      if(horseObj.status=='WINNER'){
                        actualReturn= (price -1)* 0.95

                      }
                      else if(horseObj.status=='LOSER'){
                        actualReturn=-1;

                      }



                    }
                    else if(betType=='LAY'){
                        price=horseObj.bestLayWinPrice;
                        probability=horseObj.winProbability;
                        expectedReturn=horseObj.winLayReturn;
                        if(horseObj.status=='WINNER'){
                          actualReturn= -1

                        }
                        else if(horseObj.status=='LOSER'){
                          actualReturn=(1 /(price -1.0))* 0.95;

                        }

                    }

                }
                else if(marketType=="PLACE"){
                  if(betType=='BACK'){
                      price=horseObj.bestBackPlacePrice;
                      probability=horseObj.placeProbability;
                      expectedReturn=horseObj.placeBackReturn;
                      if(horseObj.status=='WINNER'){
                        actualReturn= (price -1)* 0.95

                      }
                      else if(horseObj.status=='LOSER'){
                        actualReturn=-1;

                      }

                    }
                    else if(betType=='LAY'){
                        price=horseObj.bestLayPlacePrice;
                        probability=horseObj.placeProbability;
                        expectedReturn=horseObj.placeLayReturn;
                        if(horseObj.status=='WINNER'){
                          actualReturn= -1

                        }
                        else if(horseObj.status=='LOSER'){
                          actualReturn=(1 /(price -1.0))* 0.95;

                        }
                      
                    }

                }

                //logger.info("actualReturn: " + actualReturn);
                betObject.horse=horse;
                betObject.price=price;
                betObject.probability=probability;
                betObject.expectedReturn=expectedReturn;
                betObject.actualReturn=actualReturn;
                if(betObject.price)returnArray.push(betObject);
            }
          }*/
      //break;

    }
     res.json(returnArray);


  })

 

}



function getDailyReport(req,res){
  var date=req.query.date;

  var url;
  if(typeof date=='undefined'){
    url="http://" + nconf.get("host") + ":" + nconf.get("port") + "/getdatecards";
  }
  else{
    url="http://" + nconf.get("host") + ":" + nconf.get("port") + "/getdatecards?date=" + date;
  }
   
 

 request(url, function(err,resp,body){
  var cards=JSON.parse(resp.body);


  var returnObject={}
  var count=cards.length;
  for(var i=0;i<cards.length;i++){
    var card=cards[i];
    var cardObject={};
    returnObject[card]=cardObject;
    var fn=function(co){
      db.cards.findOne({rpraceid:card},function(err,mongoCard){
       
        if(mongoCard){
          count--;
          co.status='OK';
          if(count==0){
             //res.json(returnObject);
             res.render('dailyreport',{results:returnObject});
          }
        

        }
        else{
          count--;
          co.status='CARD-MISSING';
           if(count==0){
             res.render('dailyreport',{results:returnObject});
          }
        }
       

      })
    }(cardObject);
    

  }

  

 })


}

function getCardReport(req,res){
  var raceid=req.query.raceid;

  db.cards.findOne({rpraceid:raceid},function(err,card){
    var returnObject=[];
    if(card){

      var runners=card.runners;
      var runnerscount=Object.keys(runners).length;
     
      for(runnerid in runners){
         var fn=function(rid){
            db.horses.findOne({_id:runnerid},function(err,horse){
              runnerscount--;
              if(horse){
                horse.status="OK";
                returnObject.push(horse);
                
              }
              else{
                var horseObject={_id: rid,status:"HORSE-MISSING"}
                returnObject.push(horseObject);
              }
              if(runnerscount==0){
                  res.json(returnObject);
              }

            })
        
        }(runnerid);
      }
    }
    else{
      res.json(returnObject);
    }
  });
       
}




function getHorseRaceReport(req,res){

  var raceid=req.query.raceid;
  var horseid=req.query.horseid;
 // var returnObject={status:'OK'};

 //does the race exist

 db.races.findOne({_id:raceid},function(err,race){
    if(race){

      //does the horse have its performance record for this race
      db.horses.findOne({_id:horseid},function(err,horse){
        if(horse){
          var perfs=horse.performances;
          if(typeof perfs[raceid]=='undefined'){
            res.json({status:'PERFORMANCE-MISSING'});
          }
          else{
            res.json({status:'OK'});
          }
        }
        else{
          res.json({status:'HORSE-MISSING'});
        }

      })
      //res.json({status:'OK'});
    }
    else{
      res.json({status:'RACE-MISSING'})
    }
 })
  
}

function getRaceReport(req,res){

  var raceid=req.query.raceid;
 // logger.info("getRaceReport " + raceid);

  db.races.findOne({_id:raceid},function(err,race){
    res.json(race);
  })
}


function deleteCard(req,res){
  var raceid=req.query.raceid;
  //logger.info("remove: " + raceid);
  db.cards.remove({rpraceid: raceid},function(err,removed){
    if(err){
      res.json({status: 'Err',message:JSON.stringify(err)});
      return;
    }
   // logger.info(JSON.stringify(removed));
    res.json({status: 'OK'});
  })

}




function getDateCards(req,res){
	var result=[];
	var date=req.query.date;
  var outbatch=req.query.outputbatch;

  //console.log("QUERY: " + JSON.stringify(req.query));

  if(typeof date=='undefined'){
    date=moment().format('YYYY-MM-DD');
  }

  //console.log("DATE: " + date);

	var url=nconf.get('rprooturl')+ "/racecards/?r_date=" + date;
  logger.info("url: " + url);
	var resp=srequest('GET',url);
  //logger.info(resp.getBody());

	$ = cheerio.load(resp.getBody());

	$('.RC-meetingItem a').each(function(index, value){
		var raceUrl=$(value).attr('href');
    logger.info("raceUrl: " + raceUrl);
		//var index1=raceUrl.indexOf("_id=");
		//var index2=raceUrl.indexOf("r_date");
		//var raceid=raceUrl.substring(index1+4,index2-1);
		result.push(raceUrl);

	});

  if(typeof outbatch !== 'undefined' && outbatch=='true'){
      var sendString="";
      for(var i=0;i<result.length;i++){
        var rurl=result[i];
       // sudo node /Users/adriangordon/Development/GP/data/scrape/downloadcard --raceid 643501 > dbatchout0.txt 2>&1 &
       //sudo chmod +x dbatch0.sh
      //at -f dbatch0.sh now +1 minute
        sendString=sendString+ "echo \"sudo node " + nconf.get('scrapedir') +"downloadcard --conf " + nconf.get('datadir')+"scrapeconfig.json --raceurl  " + rurl + " > " + nconf.get('datadir') + "dbatchout" + i + ".txt 2>&1 &\" > " + nconf.get('datadir')+"dbatch" +i +".sh\n";
        sendString=sendString+"sudo chmod +x " + nconf.get('datadir') + "dbatch" + i + ".sh\n";
        //sendString=sendString+"at -f dbatch" + i + ".sh now +" + ((i + 1) +(i * nconf.get("delay"))) +" minute\n";
        sendString=sendString+"at -f " + nconf.get('datadir') + "dbatch" + i + ".sh now +" + i * nconf.get("delay") +" minute\n";
        
      }
      res.send(sendString);
      //res.end();
  }

	else res.json(result);


}

function resultsBatch(req,res){
  db.bets.find({result:{$exists:false}},function(err,bets){
    var sendString="";
    for(var i=0;i<bets.length;i++){
      var bet=bets[i];
      var marketid=bet.marketid;
      sendString+="sudo node " + nconf.get("scrapedir") + "bfmonitor --conf " + nconf.get('datadir')+ "betconfig.json --marketid=" + marketid + "\n";


    }
    res.send(sendString);

  });

}

function betBatch(req,res){
  var date=req.query.date;
  var dateMoment;
  var sendString=""

  if(typeof date != 'undefined'){
    dateMoment= moment(date);
  }
  else{
    dateMoment= moment();
  }

  var dateStr=dateMoment.toISOString();
 // logger.info(dateStr);

  db.tomonitor.find({offtime:{"$gte":new Date(dateStr)}}).sort({raceid:1},function(err,races){
    if(err){
      res.json({status: 'ERROR', message:JSON.stringify(err)});
      return;
    }
    var i =0;
    var count=races.length;
    for(race in races){
      var raceObj=races[race];
      //logger.info(JSON.stringify(raceObj));
      var raceid=raceObj.raceid;

      var fn=function(ro,index){

        db.cards.findOne({rpraceid:raceid},function(err,card){
          var cardHours=card.offtime.hours;
          var cardMinutes=card.offtime.minutes;

           //var offtime=raceObj.offtime
        //  logger.info("raceid: " + raceid + " offtime: " + typeof offtime + " " + offtime);
          //var offtimeMoment=moment(offtime).subtract(3,'minutes').toDate();
        //  logger.info("offtimeMoment: " + offtimeMoment)

         // var offtimeMomentStr='';//offtimeMoment.format('HHmm');

         if(cardMinutes==0){
          cardHours--;
          cardMinutes=57;
         }
         else{
          cardMinutes=cardMinutes-3;
         }

         if(cardHours < 12){
          cardHours+=12;
         }

         if(cardMinutes < 10){
          cardMinutes = '0' + cardMinutes;
         }


          sendString+= "echo \"sudo node " + nconf.get('scrapedir') +"bfmonitor --conf " +nconf.get('datadir')+ "betconfig.json --raceid  " + ro.raceid + " > " + nconf.get('datadir') + "bfbatchout" + index + ".txt \" > " + nconf.get('datadir') +"bfbatch" +index +".sh\n";
          sendString+="sudo chmod +x " + nconf.get('datadir') +"bfbatch" + index + ".sh\n";
          sendString+="at -f " + nconf.get('datadir') + "bfbatch" + index + ".sh " + cardHours + cardMinutes + "\n";
          count--;
          if(count==0){
            res.send(sendString);
          }


        })
      }(raceObj,i);

     

      //sendString+="sudo node " + nconf.get('scrapedir') +"bfmonitor --conf scrapeconfig.json --raceid " +  raceid + " >> bfout.txt 2>&1\n";
      i++;
    }
    //res.send(sendString);
  })

 // 

}

//sudo node /home/ubuntu/GP/data/scrape-develop/downloadcard --conf scrapeconfig.json --raceid  643844
function getGaussians(req,res){
  var sendString=""

  db.cards.find({},function(err,cards){
    for(var i=0;i<cards.length;i++){
      var card=cards[i];
      var meeting=card.meeting;
      var raceid=card.rpraceid;
      if((meeting.indexOf('(GER')== -1)&&(meeting.indexOf('(FR')== -1)&&(meeting.indexOf('(USA')== -1)&&(meeting.indexOf('(AUS')== -1)&&(meeting.indexOf('(IT')== -1)&&(meeting.indexOf('(ITA')== -1)&&(meeting.indexOf('(SA')== -1)&&(meeting.indexOf('(RSA')== -1))
        sendString+="sudo node " + nconf.get('scrapedir') +"getcardpredictiondata --conf " + nconf.get('datadir') + "scrapeconfig.json --raceid " +  raceid + " >> " + nconf.get('datadir') + "gaussiansout.txt 2>&1\n";
    }
    res.send(sendString);

  })
}

function getDateResults(req,res){
	var returnType='json';
	if(typeof req.query.return !== 'undefined'){
		returnType=req.query.return;
	}
	var date=req.query.date;
	logger.info("Getting Date Results: " + date);
	var results=addRaceData(date);
	logger.info("Returning Date Results: " + date);
	if(returnType=='json')
		res.json(results);
	else res.render('results',{results:results});
}

//FUNCTIONS

function addRaceData(date){

	var results=new Array();

	//var date=req.query.date;

	//logger.info("addRaceData " + date);
	var url="http://www.racingpost.com/horses2/results/home.sd?r_date=" + date;
	//logger.info("url: " + url);

	var resp=srequest('GET',url);

	$ = cheerio.load(resp.getBody());
	$('.crBlock').each(function(i,mtgElem){
		var result;

		var mtgText=$(mtgElem).find(".meeting a").not('.bullet').text();

		//logger.info("mtgtext:|" + mtgText + "| " + mtgElem);

		if((mtgText.indexOf("(")!== -1)&&(mtgText.indexOf(")")!== -1)){
			if((mtgText.indexOf("(AW)")!== -1)||(mtgText.indexOf("(AW)")!== -1)){
				result={};
				 result.races=parseDatePageResults(mtgText,mtgElem,'AW');
				 result.meeting=mtgText;
				 result.date=date;
				results.push(result);
			}

		}
		else if(mtgText !== ''){
			result={};
			result.races=parseDatePageResults(mtgText,mtgElem,'TURF');
			result.meeting=mtgText;
			result.date=date;
				results.push(result);
		}
		//console.log(mtgText);
		//logger.info("addRaceData result: " + JSON.stringify(result));

		
	});

	//res.json(results);
	//logger.info(JSON.stringify(results));
	//res.render('results',{results:results});
	return(results);

	/*request(
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
				$ = cheerio.load(body);
				$('.crBlock').each(function(i,mtgElem){
					var result;

					var mtgText=$(mtgElem).find(".meeting a").not('.bullet').text();

					if((mtgText.indexOf("(")!== -1)&&(mtgText.indexOf(")")!== -1)){
						if((mtgText.indexOf("(AW)")!== -1)||(mtgText.indexOf("(AW)")!== -1)){
							 result=parseDatePageResults(results,res,mtgText,mtgElem)
							//results.push(result);
						}

					}
					else{
						 result=parseDatePageResults(results,res,mtgText,mtgElem)
							//results.push(result);
					}
					//console.log(mtgText);
					//logger.info("addRaceData result: " + JSON.stringify(result));

				});

				//res.end('addRaceData: ' + JSON.stringify(results));

			}

		}
	);*/

	


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

						logger.info('conditiontype:' + elemType +' td: ' + $(tdel).text());
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


var parseHorseDates = function( body) {
	var datesArray=[];
	
	//if (error || response.statusCode != 200) {
	//	logger.error(error);
	//}
	//else {
		//console.log("body: " + body);
		$ = cheerio.load(body);

		$('#horse_form tr').each(function(i,elem){
			if(!isEven(i)){
				//logger.info("INDEX: " + i + " " + $(elem).find('td').first().find('a').text());
				var raceId=$(elem).attr('id');
				logger.info('raceId: ' + raceId);
				var dateS=$(elem).find('td').first().find('a').text();

				var date=horseDateParser.parse(dateS);

				//logger.info("Date: " + date);
				datesArray.push(date);
			}
				

		});
		return(datesArray);
		
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
	//}
};

var parseHorseRaces = function( body) {
	var racesArray=[];
	//logger.info("Do Parse horse races" )
	//if (error || response.statusCode != 200) {
	//	logger.error(error);
	//}
	//else {
		//console.log("body: " + body);
		$ = cheerio.load(body);

		$('#horse_form tr').each(function(i,elem){
			if(!isEven(i)){
				//logger.info("INDEX: " + i + " " + $(elem).find('td').first().find('a').text());
				var raceId=$(elem).attr('id');
				//logger.info('raceId: ' + raceId);
				var dateS=$(elem).find('td').first().find('a').text();

				var date=horseDateParser.parse(dateS);

				//logger.info("Date: " + date);
				racesArray.push(raceId);
			}
				

		});
		return(racesArray);
		
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
	//}
};

var parseHorseRacesFromUrl = function( body) {
  var racesArray=[];
  //logger.info("Do Parse horse races" )
  //if (error || response.statusCode != 200) {
  //  logger.error(error);
  //}
  //else {
    //console.log("body: " + body);
    $ = cheerio.load(body);

    $(".ui-table__cell a").each(function(i,elem){
        var href=$(elem).attr('href');
        if(href.indexOf('/results/')!=-1){
          if ($(elem).attr("data-test-selector")=="item-table-date"){
            //console.log("href: " + href);
            racesArray.push(href);
          }
          
        }
        
    });

    return(racesArray);
    
    
};

var parseHorseName = function( body) {
  
  //logger.info("Do Parse horse races" )
  //if (error || response.statusCode != 200) {
  //  logger.error(error);
  //}
  //else {
    //console.log("body: " + body);
    $ = cheerio.load(body);

    var text=$("h1")
    .clone()    //clone the element
    .children() //select all the children
    .remove()   //remove all the children
    .end()  //again go back to selected element
    .text().trim();


    var i=text.indexOf('(');
    if(i!==-1){
      text=text.substring(0,i).trim().toUpperCase();
    }
    else{
      text=text.toUpperCase();
    }
    return(text);
    
    
};

var parseCardData=function(raceid,body){

	var object={
		
		status:"OK",
		_id:raceid,
		horses:{}
	}

	$ = cheerio.load(body);
	var offTime=$('.navRace').find('span').text().replace(/(\r\n|\n|\r)/gm,"").trim();
	var i=offTime.indexOf(':');
	//logger.info("offTime: " + offTime + " i: " + i + " hrs: " + offTime.substring(0,i) + " mins: " + offTime.substring(i+1));
	var otHrs=parseInt(offTime.substring(0,i));
	var otMins=parseInt(offTime.substring(i+1));
	//logger.info(offTime);
	object.offtimeS=offTime;
	object.offtime={
		hours:otHrs,
		minutes:otMins
	}

	var fullPlaceText=$('.placeRace').text();
	

	var dateText=$('.placeRace .date').text();
	
	var index = fullPlaceText.indexOf(dateText);

	var courseText=fullPlaceText.substr(0,index);
	try{
		object.meeting=courseText.replace(/(\r\n|\n|\r)/gm,"").trim().toUpperCase();
	}catch(err){
			object.status='ERROR';
			object.meeting="parse error: " + err.message + " when parsing " + courseText + " in race " + raceid;
			logger.error("parse error: " + err.message + " when parsing " + courseText + " in race " + raceid);

	}

	object.surface='TURF';
	if((object.meeting.indexOf("(")!== -1)&&(object.meeting.indexOf(")")!== -1)){
			if((object.meeting.indexOf("(AW)")!== -1)||(object.meeting.indexOf("(AW)")!== -1)){
				object.surface="AW";
			}

		
	}

	


	//logger.info(dateText);
	var date=cardDateParser.parse(dateText);
	object.date=date;

	var conditionsText=$('.raceInfo .info').text();
	//logger.info("conditionsText: |" + conditionsText.toUpperCase() + "|");

	object.raceType='FLAT';
	if(conditionsText.toUpperCase().indexOf(' HURDLE') !== -1){
		object.raceType='HURDLE';
	}
	else if(conditionsText.toUpperCase().indexOf(' CHASE') !== -1){
		object.raceType='CHASE';
	}


	var index1=conditionsText.lastIndexOf('\n');
	var ct1=conditionsText.substring(0,index1);

	index1=ct1.lastIndexOf('\n');

	//logger.info("CT1: |" + ct1 + "|");

	//logger.info("LAST LINE BUT 1: |" + ct1.substring(index1) + "|");

	var index=ct1.substring(index1).indexOf('(');
	var ctSubstring=ct1.substring(index1).substring(index);
	//logger.info("ctSubstring: |" + ctSubstring + "|");

	try{
	 object.conditions=cardConditionsParser.parse(ctSubstring);
	}catch(err){
			object.conditions="parse error: " + err.message + " when parsing " + ctSubstring + " in race " + raceid;
			object.status='ERROR';
			logger.error("parse error: " + err.message + " when parsing " + ctSubstring + " in race " + raceid);

	}

	$('.results li').each(function(index){
		//console.log($(this).text());
		if($(this).text().indexOf('Distance')!==-1){
			var d=$(this).find('strong').text().trim();
			//console.log("distance string: |" + d + "|");
			try{
				var distObj=cardDistParser.parse(d);
				//console.log('distance Obj: ' + JSON.stringify(distObj));
				object.distance=distObj;
			}catch(err){
				object.status='ERROR';
				object.distance="parse error: " + err.message + " when parsing " + d + " in race " + raceid;
				logger.error("parse error: " + err.message + " when parsing " + d + " in race " + raceid);

			}
		}
		else if($(this).text().indexOf('Going')!==-1){
			var g=$(this).find('strong').text().trim();
			//console.log("going string: " + g);
			try{
				var goingObj=cardGoingParser.parse(g);
				object.going=goingObj;

			}catch(err){
				object.status='ERROR';
				object.going="parse error: " + err.message + " when parsing " + g + " in race " + raceid;
				logger.error("parse error: " + err.message + " when parsing " + g + " in race " + raceid);
			}

		}
	})

	$('#sc_horseCard tbody').each(function(){
		if($(this).attr('id').match(/sc_/)){
			//console.log('id: ' + $(this).attr('id'));
			var anchors=$(this).find('a');
			var index=0;
			anchors.each(function(){
				var href=$(this).attr('href');
				if((href.indexOf('horse_id')!==-1)&&(href.indexOf('horse_home')!=-1)){
					index++;
					//console.log("href: " + href)
					var i=href.indexOf('horse_id=');
					var horseid=href.substring(i+9);
					//console.log('horseid=' + horseid)
					logger.info("NAME TEXT: " + $(this).text());
					var weightS=$(this).parent().next().next().find('div').first().text()
					logger.info("WEIGHT: " + weightS);
					var weight=weightParser.parse(weightS);
					logger.info("WEIGHT: " + weightS + " weight: " + weight);
					object.horses[horseid]={
						name:$(this).text(),
						weight:weight
					};



					/*var horseRacesUrl="http://localhost:" + server.address().port + "/gethorseraces?horseid=" + horseid;
					logger.info('horseRacesUrl: ' + horseRacesUrl);

					var r=function(hid){
						request(horseRacesUrl,function(error,response,body){
							index--;
							logger.info('body: ' + body);
							//if index==0;
							object.horses[hid]={
								races:body
							}
							if(index==0){ //we've done all horses
								return(object);

							}
						});
					}(horseid)
					*/
					//var hd=srequest('GET',horseRacesUrl);
					//logger.info("horseid: " + horseid + " dates: " +hd);
				}
			})
		}
	})

	

	return(object);


}

var parseCardDataFromRaceUrl=function(raceurl,body){

	var i=raceurl.lastIndexOf('/');

	var raceid=raceurl.substring(i+1,raceurl.length);
	var raceDateStr=raceurl.substring(i-10,i);
	//console.log('raceDateStr ' + raceDateStr);
	var yearS=raceDateStr.substring(0,4);
	var monthS=raceDateStr.substring(5,7);
	var dayS=raceDateStr.substring(8,11);

	var object={
		
		status:"OK",
		_id:raceid,
		url:raceurl,
		date:{year:yearS,month:monthS,day:dayS},
		horses:{}
	}
	

	$ = cheerio.load(body);

	var offTime=$('.RC-courseHeader__time').text().replace(/(\r\n|\n|\r)/gm,"").trim();
	var i=offTime.indexOf(':');
	//logger.info("offTime: " + offTime + " i: " + i + " hrs: " + offTime.substring(0,i) + " mins: " + offTime.substring(i+1));
	var otHrs=parseInt(offTime.substring(0,i));
	var otMins=parseInt(offTime.substring(i+1));
	//logger.info(offTime);
	object.offtimeS=offTime;
	object.offtime={
		hours:otHrs,
		minutes:otMins
	}
	

	var fullPlaceText=$('.RC-courseHeader__name').text();
	//console.log("fullPlaceText: " + fullPlaceText);

	try{
		object.meeting=fullPlaceText.replace(/(\r\n|\n|\r)/gm,"").trim().toUpperCase();
	}catch(err){
			object.status='ERROR';
			object.meeting="parse error: " + err.message + " when parsing " + fullPlaceText + " in race " + raceurl;
			logger.error("parse error: " + err.message + " when parsing " + fullPlaceText + " in race " + raceurl);

	}
	object.surface='TURF';
	if((object.meeting.indexOf("(")!== -1)&&(object.meeting.indexOf(")")!== -1)){
			if((object.meeting.indexOf("(AW)")!== -1)||(object.meeting.indexOf("(AW)")!== -1)){
				object.surface="AW";
			}

		
	}
	//var dateText=$('.RC-courseHeader__date').text();
	//console.log('dateText: ' + dateText);
	var distanceRound=$('.RC-cardHeader__distance').text().trim();
	//logger.info("distanceRound: " + distanceRound);

	try{
		var distObj=cardDistParser.parse(distanceRound);
		//console.log('distance Obj: ' + JSON.stringify(distObj));
		object.distance=distObj;
	}catch(err){
		object.status='ERROR';
		object.distance="parse error: " + err.message + " when parsing " + distanceRound + " in race " + raceurl;
		logger.error("parse error: " + err.message + " when parsing " + distanceRound + " in race " + raceurl);

	}

	var conditionsText="";
	var courseInformation=$('.RC-cardHeader__courseDetails span[data-test-selector]');
	//console.log('courseInformation :' + courseInformation.html());
	courseInformation.each(function(index){
		//console.log('text: '+ JSON.stringify($(this).get(0).attribs['data-test-selector']) + ' ' +$(this).text());
		var selector=$(this).get(0).attribs['data-test-selector'];
		if(selector=='RC-header__raceDistance'){
			//console.log('there is a full distance');
			try{
			var distObj=cardDistParser.parse($(this).text().trim().replace('(','').replace(')',''));
			//console.log('distance Obj: ' + JSON.stringify(distObj));
			object.distance=distObj;
			}catch(err){
				//object.status='ERROR';
				//object.distance="parse error: " + err.message + " when parsing " + distanceRound + " in race " + raceurl;
				logger.error("parse error: " + err.message + " when parsing " + $(this).text().trim() + " in race " + raceurl);

			}

		}
		else if(selector == 'RC-header__raceInstanceTitle'){
			object.raceType='FLAT';
			if($(this).text().toUpperCase().indexOf(' HURDLE') !== -1){
				object.raceType='HURDLE';
			}
			else if($(this).text().toUpperCase().indexOf(' CHASE') !== -1){
				object.raceType='CHASE';
			}
			else if($(this).text().toUpperCase().indexOf(' NATIONAL HUNT FLAT') !== -1){
				object.raceType='NHFLAT';
			}
			
			 

		}
		else if(selector == 'RC-header__raceClass' || selector == 'RC-header__rpAges'){
			 conditionsText+= $(this).text().trim();
		}
	});
//	console.log("conditionsText: " +conditionsText);
	try{
	 object.conditions=cardConditionsParser.parse(conditionsText);
	}catch(err){
			object.conditions="parse error: " + err.message + " when parsing " + conditionsText + " in race " + raceurl;
			object.status='ERROR';
			logger.error("parse error: " + err.message + " when parsing " + conditionsText + " in race " + raceurl);

	}

	var goingInformation=$('.RC-cardHeader div[data-test-selector]');
	//console.log($(goingInformation).text());
	goingInformation.each(function(index){
		//console.log($this).text();
		var selector=$(this).get(0).attribs['data-test-selector'];
		if(selector=="RC-headerBox__going"){
		//	console.log("selector: " + selector + "text: " +$(this).text());
			var goingEl=$(this).find('.RC-headerBox__infoRow__content');
			var goingText= $(goingEl).text();
			try{
				var goingObj=cardGoingParser.parse(goingText);
				object.going=goingObj;

			}catch(err){
				object.status='ERROR';
				object.going="parse error: " + err.message + " when parsing " + goingText + " in race " + raceurl;
				logger.error("parse error: " + err.message + " when parsing " + goingText + " in race " + raceurl);
			}
		}
	});

	
  $('.RC-runnerCardWrapper').each(function(index){
    var horseLink=$(this).find('.RC-runnerMainWrapper a');
    var hUrl=horseLink.attr('href');
    var index = hUrl.indexOf('#');
    hUrl=hUrl.substring(0,index);
    var index1=hUrl.indexOf('horse/');
    var index2=hUrl.lastIndexOf('/');
    var hid=hUrl.substring(index1+6,index2);
    var horseName=horseLink.text().trim().toUpperCase();
    

    var weight=$(this).find('.RC-runnerWgt__carried').get(0).attribs['data-order-wgt'];;

 // console.log(hid + " horsename: " + horseName + " url: " + hUrl +" " +  weight);
    object.horses[hid]={
      name:horseName,
      url:hUrl,
      weight:weight
    }

  });
	
  return(object);



}



var parseResultPage = function(url,body,lps) {

		var object=new Object();
		object.horseids=[];
		object.horses={};
		logger.info("url: " + url);
		//console.log("body: " + body);
		$ = cheerio.load(body);
		var course=$('h1').text();
		logger.info("Course: " + course);
		var cd;
		try{
			var cd=coursedateParser.parse(course.replace(/(\r\n|\n|\r|\')/gm,"").trim());
			logger.info("cd: " + JSON.stringify(cd));
			if(typeof cd !== 'undefined'){
				object.course=cd[0].course;
				object.date=cd[1].date.year + "-" + cd[1].date.month + "-" + cd[1].date.day;
			}
		}catch(err){
			object.course="parse error: " + err.message + " when parsing " + course + " in " + url;
			logger.error("parse error: " + err.message + " when parsing " + course + " in " + url);
			object.status="ERROR";
			return(object);
		}

		var raceTime=$(".timeNavigation").text();
		var parent=$(".timeNavigation").parent();
		var textDesc=$(parent).text();
		//logger.info("parent text: " + $(parent).text());

		if(textDesc.indexOf(' Chase')!=-1){
			object.raceType='CHASE';
		}
		else if(textDesc.indexOf(' Hurdle') != -1){
				object.raceType='HURDLE';
		}
		else{
			object.raceType="FLAT";
		}


		object.time=raceTime;
		var first=$('.leftColBig ul li').first();
		//console.log("parseResultPage res: " + first.text());

		try{
			object.conditionsText=first.text();
			object.conditions=conditionsParser.parse(first.text());
			//logger.info(first.text() + "\n" + JSON.stringify(object.conditions) + "\n");
			//logger.info("object.conditions: " + JSON.stringify(object.conditions));
			for(index in object.conditions){
				var cond=object.conditions[index];
				if((cond != null) && (cond.conditiontype=='going')){
					object.going=cond.going;
				}
				else if((cond != null) && (cond.conditiontype=='distancep')){

					if(typeof cond.miles == 'undefined')
						cond.miles=0;
					if(typeof cond.furlongs=='undefined')
						cond.furlongs=0;
					if(typeof cond.yards == 'undefined')
						cond.yards=0;
					//logger.info("distancep cond: " + JSON.stringify(cond));
					object.distanceinyards=(cond.miles * 1760) + (cond.furlongs * 220) + cond.yards;
					object.distanceinmetres=object.distanceinyards * 0.9144;
					//logger.info("object.distanceinyards " + object.distanceinyards)
				}
				else if((cond != null) && (cond.conditiontype=='distance')){
					//logger.info("distance cond: " + JSON.stringify(cond));
					if(typeof cond.miles == 'undefined')
						cond.miles=0;
					if(typeof cond.furlongs=='undefined')
						cond.furlongs=0;
					if(typeof cond.yards == 'undefined')
						cond.yards=0;
					if(typeof object.distanceinyards == 'undefined'){
							object.distanceinyards=(cond.miles * 1760) + (cond.furlongs * 220) + cond.yards;
							object.distanceinmetres=object.distanceinyards * 0.9144;
					}
					//logger.info("object.distanceinyards " + object.distanceinyards)
				}
				
			}

		}catch(err){
			object.conditions="parse error: " + err.message + " when parsing " + first.text() + " in " + url;
			logger.error("parse error: " + err.message + " when parsing " + first.text() + " in " + url);
			object.status="ERROR";
			return(object);

		}


		var resultGrid=$('.resultRaceGrid').find('tr');
		var cumulativeDistance=0;
		for(var i=0;i<resultGrid.length;i++){
			
			var theTr=resultGrid[i];

			var horseId=$(theTr).attr('data-hid');
			var horseDistDesc=$(theTr).find('.dstDesc').text();
			var horsePos=$(theTr).find('td h3').text();
			var weightCarriedS=$(theTr).find('td:nth-child(6)').text();

			var nameS=$(theTr).find('td:nth-child(4)').find("a").not(".pencil").text();
			//logger.info("nameS: " + nameS);

			var nameAndSPS=$(theTr).find('td:nth-child(4)').text();
			//logger.info("nameAndSPS: " + nameAndSPS);
			//logger.info("weight carried: " + weightCarriedS);

			var price;

			var dist;

			//console.log("horseId: " + horseId + " horseDistDesc: |" + horseDistDesc + "|");

			if(typeof horseId!='undefined'){
				dist=distParser.parse(horseDistDesc);
				//logger.info("dist: " + dist);
				cumulativeDistance+=dist;
				//logger.info("go parse: |" + nameAndSPS + "|");
				//nameAndSPS="Evens";

				if(nameAndSPS .indexOf('Evens') !== -1){
					price={
						"fractiontop":1,
						"fractionbottom":1
					}
				}
				else{
          try{
					 price=priceParser.parse(nameAndSPS);
          }catch(exception){
            price={fractiontop:0, fractionbottom:0}
          }
				}
				//logger.info("price: " + JSON.stringify(price));

			}

			 //dist=distParser.parse(horseDistDesc);

			//logger.info("horsePos: " + horsePos);
			//logger.info('horseid: ' + horseId);
			if(typeof horseId !== 'undefined'){
				var weight=weightParser.parse(weightCarriedS);
				object.horseids.push(horseId);
				object.horses[horseId]={name:nameS.toUpperCase(),dstDesc:horseDistDesc,pos:horsePos,dist:dist,cumulativedist:cumulativeDistance,weight:weight,price:price};
			}
		}

		

		var bs=$('.raceInfo b')

		$(bs).each(function(key,value){
			//console.log("b value: " + $(value).text());
			if($(value).text() =="TIME"){
				//console.log("TIME String: " + value.nextSibling.nodeValue);
				try{
					object.racetime=timeParser.parse(value.nextSibling.nodeValue)[1];
					object.racetime.timeinseconds=(object.racetime.minutes * 60) + object.racetime.seconds + (object.racetime.milliseconds /100);
					//logger.info("object.racetime: " + JSON.stringify(object.racetime));

				}catch(err){
					object.racetime="parse error: " + err.message + " when parsing " + value.nextSibling.nodeValue;
					logger.error("parse error: " + err.message + " when parsing " + value.nextSibling.nodeValue);
					object.status="ERROR";
					return(object);
				}
			}
		});



		//var texts=$('.raceInfo b').map(function(){
		//	 return this.nextSibling.nodeValue
		//});

		//console.log("l: " + texts.length);
		//for(var i=0;i<texts.length;i++){

			//console.log("text: " + texts[i]);
		//}
		//console.log(JSON.stringify(texts));



		//raceInfo.each(function(i, elem) {
		//	console.log("elem: " + $(elem).text());
		//	if($(elem).nextSibling)console.log( $(elem).nextSibling.nodeValue);
		//});

		//console.log(raceInfo.html());

		//logger.info("lps: " + lps);

		if(typeof lps=='undefined'){
			var surface="TURF";
			if(object.going.indexOf('Standard') !== -1 ||object.going.indexOf('Fast')!== -1 ||object.going.indexOf('Slow')!== -1){
				surface="AW"
			}

			lps = getLPS(object.raceType,surface,cd[0].course,object.going,url);
			object.surface=surface;
		}

		logger.info("lps: " + lps);
		if(typeof lps !== 'undefined'){
			//logger.info("lps: " + lps);
			for(key in object.horses){

						//logger.info("KEY: " + key + " horse: " + JSON.stringify(parsedResult.racedata.horses[key]));
						object.horses[key].cumulativetime=object.horses[key].cumulativedist * ( 1.0 /lps);

						object.horses[key].totaltime=object.horses[key].cumulativetime + object.racetime.timeinseconds;
						object.horses[key].speed=(object.distanceinmetres /object.horses[key].totaltime)
					}


		}

		return(object);

	
}

//parse result page from the beta site
var parseResultPageBeta = function(url,body,lps) {

    var object=new Object();
    object.horseids=[];
    object.horses={};
    object.url=url;
   // logger.info("url: " + url);
    var i1=url.lastIndexOf('/');
    object.date=url.substring(i1-10,i1);

    //console.log("body: " + body);
    $ = cheerio.load(body);

    var raceTime=$('h1 span').first().text();
   // console.log("raceTime: " + raceTime);
    object.time=raceTime;

    var course=$('h1 a').text().trim().toUpperCase();
   // logger.info("Course: " + course);
    object.course=course;
    
    var textDesc=$('h2').text();

    object.raceType='FLAT';
    if(textDesc.toUpperCase().indexOf(' HURDLE') !== -1){
      object.raceType='HURDLE';
    }
    else if(textDesc.toUpperCase().indexOf(' CHASE') !== -1){
      object.raceType='CHASE';
    }
    else if(textDesc.toUpperCase().indexOf(' NATIONAL HUNT FLAT') !== -1){
      object.raceType='NHFLAT';
    }

    var raceClassS=$(".rp-raceTimeCourseName_class").text().trim();
   // console.log("raceClassS: " + raceClassS);

    var raceAgesS=$(".rp-raceTimeCourseName_ratingBandAndAgesAllowed").text().trim();

   // console.log("raceAgesS: " + raceAgesS);

     object.conditions=conditionsParser.parse(raceClassS + raceAgesS);


    var raceDistFullS=$(".rp-raceTimeCourseName_distanceFull").text().trim();

   // console.log("raceDistFullS: " + raceDistFullS);

    if(raceDistFullS !== ""){
      var raceDistObj=conditionsParser.parse(raceDistFullS);
     // console.log("raceDistObj: " + JSON.stringify(raceDistObj));
      if(raceDistObj[0] !== null){

        if(typeof raceDistObj[0].miles == 'undefined')
            raceDistObj[0].miles=0;
          if(typeof raceDistObj[0].furlongs=='undefined')
            raceDistObj[0].furlongs=0;
          if(typeof raceDistObj[0].yards == 'undefined')
            raceDistObj[0].yards=0;
          //logger.info("distancep cond: " + JSON.stringify(cond));
          object.distanceinyards=(raceDistObj[0].miles * 1760) + (raceDistObj[0].furlongs * 220) + raceDistObj[0].yards;
          object.distanceinmetres=object.distanceinyards * 0.9144;

      }
    }
    else{
      var raceDistS=$(".rp-raceTimeCourseName_distance").text().trim();
     // console.log("raceDistS: " + raceDistS);
      var raceDistObj=conditionsParser.parse(raceDistS);
      //console.log('rdo: ' + JSON.stringify(raceDistObj));
      if(raceDistObj[0] !== null){

        if(typeof raceDistObj[0].miles == 'undefined')
            raceDistObj[0].miles=0;
          if(typeof raceDistObj[0].furlongs=='undefined')
            raceDistObj[0].furlongs=0;
          if(typeof raceDistObj[0].yards == 'undefined')
            raceDistObj[0].yards=0;
          //logger.info("distancep cond: " + JSON.stringify(cond));
          object.distanceinyards=(raceDistObj[0].miles * 1760) + (raceDistObj[0].furlongs * 220) + raceDistObj[0].yards;
          object.distanceinmetres=object.distanceinyards * 0.9144;

      }
    }

    

     var goingS=$(".rp-raceTimeCourseName_condition").text().trim();
    // console.log("goingS: " + goingS);
     object.going=goingS;

     var raceTimeS=$(".rp-raceInfo span").eq(1).text().trim();
    // console.log("raceTimeS: " + raceTimeS);
     object.racetime=timeParser.parse(raceTimeS)[0];
     object.racetime.timeinseconds=(object.racetime.minutes * 60) + object.racetime.seconds + (object.racetime.milliseconds /100);
     //console.log("Racetime: " + JSON.stringify(object.racetime));

     if(typeof lps=='undefined'){
      var surface="TURF";
      if(object.going.indexOf('Standard') !== -1 ||object.going.indexOf('Fast')!== -1 ||object.going.indexOf('Slow')!== -1){
        surface="AW"
      }

      lps = getLPS(object.raceType,surface,object.course,object.going,url);
      object.surface=surface;
    }
   // console.log("lps: " + lps);

    
    var resultGrid=$(".rp-horseTable__mainRow");

    for(var i=0;i<resultGrid.length;i++){
      
      var theTr=resultGrid[i];


      var pos=$(theTr).find(".rp-horseTable__pos__number").text();
      var index=pos.indexOf('(');
        if(index != -1){
          pos=pos.substring(0,index-1).trim();
        }
        else pos=pos.trim();
      //console.log("pos: " + pos);

      var horse=$(theTr).find(".rp-horseTable__horse a").first();
      var horseName=$(horse).text().trim().toUpperCase();
      var horseUrl=$(horse).attr('href');
      var i1=horseUrl.indexOf('horse/');
      var i2=nthIndex(horseUrl,'/',4);
      var horseId=horseUrl.substring(i1+6,i2);


      //console.log('horseid:' + horseId +' horseName: ' + horseName + " " + horseUrl);

      var horsePriceS=$(theTr).find(".rp-horseTable__horse__price").text().trim();
     // console.log("horsePriceS: " + horsePriceS);
      var price;
      try{
           price=priceParser.parse(horsePriceS);
          }catch(exception){
            price={fractiontop:0, fractionbottom:0}
      }
     // console.log('price: ' + JSON.stringify(price));

      var weightStonesS=$(theTr).find(".rp-horseTable__wgt span").eq(0).text().trim();
     // console.log("weightStonesS: " + weightStonesS);

      var weightLbS=$(theTr).find(".rp-horseTable__wgt span").eq(1).text().trim();
     // console.log("weightLbS: " + weightLbS);

      var weight=parseInt(weightStonesS) * 14 + parseInt(weightLbS);
      //console.log("weight: " + weight);

      var beatenByS=$(theTr).find(".rp-horseTable__pos__length span").eq(0).text().trim();

      var beatenByCumulativeS=$(theTr).find(".rp-horseTable__pos__length span").eq(1).text().trim().replace('[','').replace(']','');

      var dist=0;
      var cumulativeDist=0;
     //  console.log("beatenByS: " + beatenByS + " beatenByCumulativeS: " + beatenByCumulativeS); 

     // console.log('char: ' + beatenByCumulativeS.charCodeAt(2).toString(16));
      if(parseInt(pos)==1){

      }
      else if(parseInt(pos)==2){
         dist=distParser.parse(beatenByS);
         cumulativeDist=dist;
      }
      else{
        dist=distParser.parse(beatenByS);
       cumulativeDist=distParser.parse(beatenByCumulativeS);
      }
     
      
     // console.log("dist: " + dist + " cumulativeDist: " + cumulativeDist);

      var cumulativetime=cumulativeDist * (1.0 / lps);
      var totaltime=cumulativetime + object.racetime.timeinseconds;
      var speed=object.distanceinmetres/totaltime;

     // console.log("cumulativetime: " + cumulativetime + " totaltime:  " + totaltime + " speed: " + speed);

      if(typeof horseId !== 'undefined'){
        //var weight=weightParser.parse(weightCarriedS);
        object.horseids.push(horseId);
        object.horses[horseId]={name:horseName,horseUrl,dstDesc:beatenByS,pos:parseInt(pos),dist:dist,cumulativedist:cumulativeDist,weight:weight,price:price,cumulativetime:cumulativetime,totaltime:totaltime,speed:speed};
      }

    }

    return(object);


  
}

function nthIndex(str, pat, n){
    var L= str.length, i= -1;
    while(n-- && i++<L){
        i= str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
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

function parseDatePageResults(mtgText,mtgElem,surface){

	//console.log(mtgText);
	var result=new Array();
	var count=0;
	//logger.info("parseDatePageResults " + mtgText + " " + mtgElem + " " + surface);
	//logger.info("length: " +$(mtgElem).find('.resultGrid td a').length);

	$(mtgElem).find('.resultGrid td a').each(function(i,resultEl){
		
		var obj=new Object();
		//console.log("i: " + i);
		//if(i==1){
			var resultHref=$(resultEl).attr('href');
			var resultText=$(resultEl).text();
			if((resultHref.indexOf('result_home')!== -1)&&(resultText == 'Full result')) {
				//console.log("resultHref " + resultHref);
				count++;
				try{
					var parsedResult=resultUrlParser.parse(resultHref);
					parsedResult.url='http://racingpost.com' + resultHref;
					//logger.info(resultHref + "\n"  +JSON.stringify(parsedResult)) ;
					obj.parsedResult=parsedResult;
					//var goParseResult='http://127.0.0.1:3000/getraceresult?url='+encodeURIComponent(parsedResult.url);
					//var goParseResult='http://127.0.0.1:3000/';
					//logger.info("goParseResult: " + goParseResult);
					var resp=srequest("GET",parsedResult.url);
					//logger.info('resp:' + resp.getBody());

					parsedResult.racedata=parseResultPage(parsedResult.url,resp.getBody(),undefined);
					//logger.info("Parsed racedata: " + JSON.stringify(parsedResult.racedata));
					parsedResult.racedata.surface=surface;

					parsedResult.racedata.lps=getLPS(parsedResult.racedata.raceType,parsedResult.racedata.surface,mtgText,parsedResult.racedata.going,parsedResult.url);

					//logger.info("lps: " + parsedResult.racedata.lps);
					//calculate cumulative time

					for(key in parsedResult.racedata.horses){

						//logger.info("KEY: " + key + " horse: " + JSON.stringify(parsedResult.racedata.horses[key]));
						parsedResult.racedata.horses[key].cumulativetime=parsedResult.racedata.horses[key].cumulativedist * ( 1.0 /parsedResult.racedata.lps);

						parsedResult.racedata.horses[key].totaltime=parsedResult.racedata.horses[key].cumulativetime + parsedResult.racedata.racetime.timeinseconds;
						parsedResult.racedata.horses[key].speed=(parsedResult.racedata.distanceinmetres /parsedResult.racedata.horses[key].totaltime)
					}


					//parsedResult.result=resp.getBody();
					result.push(parsedResult);
					

					/*

					var fn=function(o){
					request({url:goParseResult},function(error,response,body){


						count--;
						o.parsedResult.result=body;
						logger.info("obj in parseDatePageResults:" + JSON.stringify(o));
						//getresult.push(o);
						//result[index]=o;
						result.push(o);
						logger.info("result now: " + JSON.stringify(result));
						//index++;

						//if(count==0)res.json(result);

					})
					}(obj);
					*/

					//parseResult(parsedResult);
					

					
				}catch(err){

					logger.error("parse error: " + err.message + " when parsing 'http://racingpost.com" + resultHref);
					console.trace();
					//logger.error(resp.getBody());
					//process.exit(1);
				}
			}



		//}
	});

	//logger.info("result in parseDatePageResults: " + JSON.stringify(result));

	//do{

	//}while(count > 0);
	return(result);
	

}


function parseResult(result){

	var url=result.url;

	request({url:url},parseResultPage);

}


function getRaceResult(req,res){
  if(typeof req.query.raceid !== 'undefined'){
    getRaceResultById(req,res);
  }
  else if(typeof req.query.resulturl !== 'undefined'){
    getRaceResultByUrl(req,res);

  }
}

function getRaceResultById(req,res){
	var raceid=req.query.raceid;
	var lps=req.query.lps;
  var adddata=req.query.adddata;

	var lpsF;

	if(typeof lps !== 'undefined'){
		lpsF=parseFloat(lps);
	}

	var url="http://www.racingpost.com/horses/result_home.sd?race_id=" + raceid;

	var resp=srequest("GET",url);
  //logger.info("getRaceResult response: " + resp.statusCode);
  if(resp.statusCode !== 200){
    resp=srequest("GET",url); //try again
      if(resp.statusCode !== 200){
        resp=srequest("GET",url); //and again
      }
  }

  if(resp.statusCode !== 200){
    logger.error("bad response code: " + resp.statusCode + " from: " + url);
    var obj={
      status:"ERROR",
      message:"bad response code: " + resp.statusCode + " from: " + url
    }
    res.json(obj);
  }
  else{
    var racedata=parseResultPage(url,resp.getBody(),lpsF);
    if(adddata=='true'){
        addRaceResultData(raceid,racedata,res);
    }
    else {
      res.json(racedata);
    }
  }


}

function getRaceResultByUrl(req,res){
  var resulturl=req.query.resulturl;
  var lps=req.query.lps;
  var adddata=req.query.adddata;

  var lpsF;

  if(typeof lps !== 'undefined'){
    lpsF=parseFloat(lps);
  }

  var url=nconf.get('rprooturl') + resulturl;

  var resp=srequest("GET",url);
  //logger.info("getRaceResult response: " + resp.statusCode);
  if(resp.statusCode !== 200){
    resp=srequest("GET",url); //try again
      if(resp.statusCode !== 200){
        resp=srequest("GET",url); //and again
      }
  }

  if(resp.statusCode !== 200){
    logger.error("bad response code: " + resp.statusCode + " from: " + url);
    var obj={
      status:"ERROR",
      message:"bad response code: " + resp.statusCode + " from: " + url
    }
    res.json(obj);
  }
  else{
    var racedata=parseResultPageBeta(url,resp.getBody().toString(),lpsF);
    if(adddata=='true'){
        addRaceResultData(raceid,racedata,res);
    }
    else {
      res.json(racedata);
    }
  }


}

function addRaceResultData(raceid,result,res){
    if(result.status =="ERROR"){
      res.json(result);
      return;
    }

    logger.info("result: " + JSON.stringify(result));
    var asyncCalls=0;
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
                          res.json(result);
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
                          res.json(result)
                        }
                      });

                    }

                  }
                  if(asyncCalls==0){
                    res.json(result);
                  }

                  });
                }(raceDocument,horseData,horseid);
              }



}

//insert a document into the 'races' collection

function insertRaceDocument(document){
  //logger.info("insert race: " + JSON.stringify(document));
 
      db.races.insert(document,function(err,race){
       // asyncCalls--;
        if(err){
          //don't report key errors
          if(typeof err.err !== 'undefined' && err.err.indexOf("duplicate key error")!== -1){

          }
          else logger.error(JSON.stringify(err));

        }
       else{ 
          //logger.info(JSON.stringify(race));
          logger.info("Added race: " + document._id);
       }
       
     });
      
  }


function getHorseDates(req,res){

	var horseid=req.query.horseid;
	var url="http://www.racingpost.com/horses/horse_home.sd?horse_id=" + horseid;

	var resp=srequest("GET",url);
	var datesData=parseHorseDates(resp.getBody());
	res.json(datesData);

}

function getHorseRaces(req,res){

  var horseid=req.query.horseid;
  var horseurl=req.query.horseurl;

  if(typeof horseid !== 'undefined'){
    getHorseRacesFromId(horseid,req,res);
  }
  else{
    getHorseRacesFromUrl(horseurl,req,res);
  }
}

function getHorseRacesFromId(horseid,req,res){

	//var horseid=req.query.horseid;
	var url="http://www.racingpost.com/horses/horse_home.sd?horse_id=" + horseid;

	var resp=srequest("GET",url);
	var racesData=parseHorseRaces(resp.getBody());
	res.json(racesData);

}

function getHorseRacesFromUrl(horseurl,req,res){

  var i1=horseurl.indexOf("/horse");
  var i2=horseurl.lastIndexOf('/');

  var horseid=horseurl.substring(i1+6,i2);
  var horsename=horseurl.substring(i2+1,horseurl.length);
  
  var url=nconf.get('rprooturl')+ "/profile/horse/tabs/" + horseid + "/" + horsename + "/form/horse/0/0/1/desktop";

  //console.log("horse url: " + url);

  var resp=srequest("GET",url);
  //console.log(resp.getBody().toString());
  var racesData=parseHorseRacesFromUrl(resp.getBody().toString());
  res.json(racesData);
  
 
}

function getHorseName(req,res){
  var horseid=req.query.horseid;
  db.horses.findOne({_id:horseid},function(err,horse){
    if((horse != null) && (typeof horse.name != 'undefined')){
      res.json({id:horseid,name:horse.name});
    }
    else{
      var url="http://www.racingpost.com/horses/horse_home.sd?horse_id=" + horseid;

      var resp=srequest("GET",url);
      var nameData=parseHorseName(resp.getBody());
      db.horses.update({_id:horseid},{$set:{name: nameData}});
      res.json({id:horseid,name:nameData});
    }
  });

  
}

function getCardData(req,res){

	var raceid=req.query.raceid;
	var raceurl=req.query.raceurl;
	if(typeof raceid != 'undefined'){
		getCardDataFromRaceid(req,res,raceid);
	}
	else if(typeof raceurl != 'undefined'){
		getCardDataFromRaceUrl(req,res,raceurl);

	}
	else{
		res.end();
	}
}

function getCardDataFromRaceid(req,res,raceid){
	//var raceid=req.query.raceid;
	var url="http://www.racingpost.com/horses2/cards/card.sd?race_id=" + raceid;

	var resp=srequest("GET",url);

	var cardData=parseCardData(raceid,resp.getBody());

	//iterate over each horse, getting it's races
	var index=0;
	for(var horseid in cardData.horses){
		index++
		//logger.info("Get races for " + horseid);
		 horseRacesUrl="http://localhost:" + server.address().port + "/gethorseraces?horseid=" + horseid;
					//logger.info('horseRacesUrl: ' + horseRacesUrl);
					var horseName=cardData.horses[horseid].name;
					var horseWeight=cardData.horses[horseid].weight;
					var r=function(hid,hn,hw){
						request(horseRacesUrl,function(error,response,body){
							index--;
              try{
    							//logger.info('body: ' + body);
    							//if index==0;
    							cardData.horses[hid]={
    								races:JSON.parse(body),
    								status:"OK",
    								name:hn,
    								weight:hw
    							}
              }catch(exception){
                //it didn't work
                logger.error(JSON.stringify("Exception: " + exception + " in: " + horseRacesUrl + " body: " + body));
              }
							if(index==0){ //we've done all horses
								res.json(cardData);

							}
						});
					}(horseid,horseName,horseWeight)
					
	}

	


	
	//res.json(cardData);

}


function getCardDataFromRaceUrl(req,res,raceurl){
	//var raceid=req.query.raceid;
	var url=nconf.get('rprooturl') + raceurl;
	//console.log(url);

	var resp=srequest("GET",url);
	//console.log(resp.getBody().toString());
  var index=0;
	var cardData=parseCardDataFromRaceUrl(raceurl,resp.getBody().toString());
  for(var horseid in cardData.horses){
    var horse=cardData.horses[horseid];
    var hurl=horse.url;
    index++
    //logger.info("Get races for " + horseid + " from " + hurl);
     horseRacesUrl="http://localhost:" + server.address().port + "/gethorseraces?horseurl=" + hurl;

     var r=function(hid){
            request(horseRacesUrl,function(error,response,body){
              index--;
              try{
                  //logger.info('body: ' + body);
                  //if index==0;
                  cardData.horses[hid].races=JSON.parse(body);

                 
              }catch(exception){
                //it didn't work
                logger.error(JSON.stringify("Exception: " + exception + " in: " + horseRacesUrl + " body: " + body));
              }
              if(index==0){ //we've done all horses
                res.json(cardData);

              }
            });
          }(horseid)
   }



}


/*if(typeof nconf.get('date')!== 'undefined'){
	var date= nconf.get('date');
	//console.log("date: " + date);
	var results=addRaceData(date);
	console.log(JSON.stringify(results));

	
}*/

function isEven(n) 
{
   return isNumber(n) && (n % 2 == 0);
}



function isNumber(n)
{
   return n == parseFloat(n);
}





