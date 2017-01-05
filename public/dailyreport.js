function getCardReport(raceid){
	//console.log("getCardReport " + raceid);

	$.get('/cardreport?raceid=' + raceid,function(data){
		//console.log(data);
		for(var i=0;i<data.length;i++){

			var horse=data[i];
			var horseid=horse._id;
			var status=horse.status;
			//console.log(horseid + " " + status);
			var divid="horse" + raceid +"-" +horseid;
			//http://www.racingpost.com/horses/horse_home.sd?race_id=645225&r_date=2016-03-01&horse_id=903150#topHorseTabs=horse_race_record&bottomHorseTabs=horse_form
			var divTxt="<div id='" + divid +"' class='runner " + status + "'>Horse: <a href='http://www.racingpost.com/horses/horse_home.sd?horse_id=" + horseid + "'>" + horseid + "</a> " + status + "<img class='loadgif' src='/ajax-loader.gif'/></div>";
			//console.log("divTxt: " + divTxt);
			var newDiv=$(divTxt)
			$('#card' + raceid).append(newDiv);
			//console.log("raceid: " + raceid + " horseid: " + horseid);
			var fn=function(r,h,hs){
				setTimeout(function() {
					getHorsePerformances(r,h,hs);
				}, 1000);
			}(raceid,horseid,horse);

			//getHorsePerformances(raceid,horseid,horse);
		}

	});
}




function getHorsePerformances(raceid,horseid,horse){
	//get all of the horse's races
	console.log("getHorsePerformances race:" + raceid + " horse:" + horseid);
	$.get('/gethorseraces?horseid=' + horseid,function(races){
		console.log(horseid + " races: " + JSON.stringify(races));
		var count=races.length;
		for(var i=0;i< races.length;i++){

			var hraceid=races[i];
			//does the race exist?
			var fn=function(hrid){
				$.get('/getracereport?raceid=' + hraceid,function(hrace){
					count--;
					//console.log("getracereport: " + hraceid + " returns: " + JSON.stringify(hrace));
					if(hrace){
						//var divTxt="<div class='race OK'>" + hrid + " OK</div>";
						//$('#horse'+ raceid + '-' + horseid).append(divTxt);
						//see if the performance is there for the horse
						//console.log("Horse: " + JSON.stringify(horse) + " raceid: " + raceid);
						if(typeof horse.performances[hrid]=='undefined'){
							var divTxt="<div class='race PERFORMANCE-MISSING'>" + hrid + " PERF. MISSING</div>";
							divTxt+="<div class='seerace'><a href='/getraceresult?raceid="+hrid+"&adddata=true'>Get It</a></div>"
							divTxt+="<div class='seerace'><a href='http://www.racingpost.com/horses/result_home.sd?race_id="+hrid+"'>RP</a></div>"
							$('#horse'+ raceid + '-' + horseid).append(divTxt);
						}

					}
					else{
						var divTxt="<div class='race RACE-MISSING'>" + hrid + " RACE MISSING</div>";
						divTxt+="<div class='seerace'><a href='/getraceresult?raceid="+hrid+"&adddata=true'>Get It</a></div>"
						divTxt+="<div class='seerace'><a href='http://www.racingpost.com/horses/result_home.sd?race_id="+hrid+"'>RP</a></div>"
						$('#horse'+ raceid + '-' + horseid).append(divTxt);

					}
					if(count==0){
						$('#horse'+ raceid + '-' + horseid +" img").toggle();
					}
				})
			}(hraceid)


		}


	})


}