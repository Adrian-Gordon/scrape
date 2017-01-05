var wbData;
var wlData;
var pbData;

function renderNthBet(data,x){
  var count=0;
  for(var i=0;i<data.length;i++){
    var bet=data[i];
    if(bet.include){
      count++;
      if(count==x){
           return $.format.date(new Date(bet.offtime), 'yyyy-MM-dd HH:mm') + " " + bet.price + " " + parseFloat(bet.probability).toFixed(2) + " " + parseFloat(bet.expectedReturn).toFixed(2);

      }
    }
  }

}

$(function(){

	//console.log('initial setup');

	//Get BACK/WIN data
	$.get( "/betsreport?market=WIN&bettype=BACK&excludeshorter=2.0", function(data) {

		//var dataObj=JSON.parse(data);
  		//console.log(data);
  		wbData=data;
  		
  		var runningTotal=0;
  		 var seriesData=[]
  		for(var i=0;i<data.length;i++){
  			var bet=data[i];
  			bet.include=true;
  			var ret=bet.actualReturn;
  			runningTotal+=ret;
  			seriesData.push(runningTotal);
  		}

  		$('#graphcontainer1').highcharts({
  			title:{
  				text:"BACK WIN"
  			},
        tooltip: {
            formatter: function () {
                //return data[this.x].price + " " + parseFloat(data[this.x].probability).toFixed(2) + " " + parseFloat(data[this.x].expectedReturn).toFixed(2)
                return renderNthBet(data,this.x);
            }
        },
	        series: [{
	        	name: 'back win',
	            data: seriesData
	        }]
    	});
    	renderBets(wbData,'#bets1');
    	//set ROI
	   // var roi=runningTotal/data.length;
	  //  $('#roi1').text(parseFloat(roi).toFixed(3));
	 // setStats(wbData,'#roi1','#sharpe1','#archie1',true);
    setStats(wbData,'#nbets1','#nwins1','#winpc1','#roi1','#sharpe1','#archie1','#exp1','#oexp1',true)
  
	});

	//Get LAY/WIN data
	$.get( "/betsreport?market=WIN&bettype=LAY", function(data) {

		//var dataObj=JSON.parse(data);
  		//console.log(data);
  		wlData=data;
  		var runningTotal=0;
  		 var seriesData=[]
  		for(var i=0;i<data.length;i++){
  			var bet=data[i];
  			bet.include=true;
  			var ret=bet.actualReturn;
  			runningTotal+=ret;
  			seriesData.push(runningTotal);
  		}

  		$('#graphcontainer2').highcharts({
  			title:{
  				text:"LAY WIN"
  			},
        tooltip: {
            formatter: function () {
                //return data[this.x].price + " " + parseFloat(data[this.x].probability).toFixed(2) + " " + parseFloat(data[this.x].expectedReturn).toFixed(2)
                return renderNthBet(data,this.x);
            }
        },
	        series: [{
	        	name: 'lay win',
	            data: seriesData
	        }]
    	});
    	renderBets(wlData,'#bets2');
    	// setStats(wlData,'#roi2','#sharpe2','#archie2',false);
       setStats(wlData,'#nbets2','#nwins2','#winpc2','#roi2','#sharpe2','#archie2','#exp2','#oexp2',false)
  
	});
});



$("#sortselect1").change(function() {
  var sortBy=$('#sortselect1 option:selected').text();
  sortAndRedraw(wbData,sortBy,'#graphcontainer1',redrawChart1);
  renderBets(wbData,'#bets1');
  //setStats(wbData,'#roi1','#sharpe1','#archie1',true)
  setStats(wbData,'#nbets1','#nwins1','#winpc1','#roi1','#sharpe1','#archie1','#exp1','#oexp1',true)
});

$("#sortselect2").change(function() {
  var sortBy=$('#sortselect2 option:selected').text();
  sortAndRedraw(wlData,sortBy,'#graphcontainer2',redrawChart2);
  renderBets(wlData,'#bets2');
   //setStats(wlData,'#roi2','#sharpe2','#archie2',false);
    setStats(wlData,'#nbets2','#nwins2','#winpc2','#roi2','#sharpe2','#archie2','#exp2','#oexp2',false)

});

$("#sortselect3").change(function() {
  var sortBy=$('#sortselect3 option:selected').text();
  sortAndRedraw(pbData,sortBy,'#graphcontainer3',redrawChart3);
  renderBets(pbData,'#bets3');
  //setStats(pbData,'#roi3','#sharpe3','#archie3',true)
    setStats(pbData,'#nbets3','#nwins3','#winpc3','#roi3','#sharpe3','#archie3','#exp3','#exp3',true)
});

$("#sortselect4").change(function() {
  var sortBy=$('#sortselect4 option:selected').text();
  sortAndRedraw(plData,sortBy,'#graphcontainer4',redrawChart4);
  renderBets(plData,'#bets4');
   //setStats(plData,'#roi4','#sharpe4','#archie4',false);
   setStats(plData,'#nbets4','#nwins4','#winpc4','#roi4','#sharpe4','#archie4','#exp4','#exp4',false)
});

$("#codeselect1").change(function(){

  redrawChart1();
})
$("#codeselect2").change(function(){

  redrawChart2();
})
$("#codeselect3").change(function(){

  redrawChart3();
})
$("#codeselect4").change(function(){

  redrawChart4();
})




function sortAndRedraw(arr,sb,chart,callback){
	//console.log('sortAndRedraw: ' + sb + " " + chart);
	if(sb=='expected return'){
		arr.sort(expectedReturnSortFunction);
		//console.log(JSON.stringify(arr));
	
	}
	else if(sb=='probability'){
		arr.sort(probabilitySortFunction);
		//console.log(JSON.stringify(arr));
	}
	else if(sb=='price'){
		arr.sort(priceSortFunction);
	}
	else if(sb=='date'){
		arr.sort(dateSortFunction);
		//console.log(JSON.stringify(arr));
	}
  //console.log(JSON.stringify(arr[0]));
	//re-do the data
	var newData=[];
	var runningTotal=0;
  		 
  		for(var i=0;i<arr.length;i++){
  			var bet=arr[i];
  			var ret=bet.actualReturn;
  			runningTotal+=ret;
  			newData.push(runningTotal);
  		}
	//redraw the chart
	var chart = $(chart).highcharts();
   // chart.series[0].setData(newData);
   callback();

}

function expectedReturnSortFunction(a,b){
	if(a.expectedReturn > b.expectedReturn)return(1);
	else if(a.expectedReturn < b.expectedReturn)return(-1);
	else return(0);

}

function probabilitySortFunction(a,b){
	if(a.probability > b.probability)return(1);
	else if(a.probability < b.probability)return(-1);
	else return(0);

}

function priceSortFunction(a,b){
	if(a.price > b.price)return(1);
	else if(a.price < b.price)return(-1);
	else return(0);

}

function dateSortFunction(a,b){
	if(a.offtime > b.offtime)return(1);
	else if(a.offtime < b.offtime)return(-1);
	else return(0);

}

$('#redraw1').click(redrawChart1);
$('#redraw2').click(redrawChart2);
$('#redraw3').click(redrawChart3);
$('#redraw4').click(redrawChart4);


function redrawChart1(){

	//reset
	for(var i=0;i<wbData.length;i++){
  			var bet=wbData[i];
  			bet.include=true;
  	}


  	//FILTER BY CODE
  	var codeFilter=$('#codeselect1 option:selected').text();
  	if(codeFilter=='All'){

  	}else if(codeFilter=='Flat'){
  		for(var i=0;i<wbData.length;i++){
  			var bet=wbData[i];
  			//console.log("bet: " + JSON.stringify(bet));
  			if(bet.code!= 'FLAT'){
  				bet.include=false;
  			}
  		}

  	}
  	else if(codeFilter=='Jumps'){
  		for(var i=0;i<wbData.length;i++){
  			var bet=wbData[i];
  			if(bet.code!= 'HURDLE' && bet.code!='CHASE'){
  				bet.include=false;
  			}
  		}

  	}


  	//FILTER BY EXPECTED RETURN
	var expectedReturnFilterGT=$('#f-expected-gt-1').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(expectedReturnFilterGT !== ''){
		for(var i=0;i<wbData.length;i++){
  			var bet=wbData[i];
  			if(bet.expectedReturn < parseFloat(expectedReturnFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var expectedReturnFilterLT=$('#f-expected-lt-1').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(expectedReturnFilterLT !== ''){
		for(var i=0;i<wbData.length;i++){
  			var bet=wbData[i];
  			if(bet.expectedReturn > parseFloat(expectedReturnFilterLT)){
  				bet.include=false;
  			}
  		}


	}
	//FILTER BY PROBABILITY
	var probFilterGT=$('#f-prob-gt-1').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(probFilterGT !== ''){
		for(var i=0;i<wbData.length;i++){
  			var bet=wbData[i];
  			if(bet.probability < parseFloat(probFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var probFilterLT=$('#f-prob-lt-1').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(probFilterLT !== ''){
		for(var i=0;i<wbData.length;i++){
  			var bet=wbData[i];
  			if(bet.probability > parseFloat(probFilterLT)){
  				bet.include=false;
  			}
  		}


	}

	//FILTER BY PRICE

	var priceFilterGT=$('#f-price-gt-1').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(priceFilterGT !== ''){
		for(var i=0;i<wbData.length;i++){
  			var bet=wbData[i];
  			if(bet.price < parseFloat(priceFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var priceFilterLT=$('#f-price-lt-1').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(priceFilterLT !== ''){
		for(var i=0;i<wbData.length;i++){
  			var bet=wbData[i];
  			if(bet.price > parseFloat(priceFilterLT)){
  				bet.include=false;
  			}
  		}


	}

	//now re-draw the chart
	var newData=[];
	var runningTotal=0;
  	var n=0;	 
	for(var i=0;i<wbData.length;i++){
		var bet=wbData[i];
		if(bet.include){
			var ret=bet.actualReturn;
			runningTotal+=ret;
			newData.push(runningTotal);
			n++
		}
	}
	//redraw the chart
	var chart = $('#graphcontainer1').highcharts();
    chart.series[0].setData(newData);
    //and re-render the bets
    renderBets(wbData,'#bets1');
    //and set stats
    setStats(wbData,'#nbets1','#nwins1','#winpc1','#roi1','#sharpe1','#archie1','#exp1','#oexp1',true)

    //set ROI
   // var roi=runningTotal/n;
   // $('#roi1').text(parseFloat(roi).toFixed(3));
}



function redrawChart2(){

	//reset
	for(var i=0;i<wlData.length;i++){
  			var bet=wlData[i];
  			bet.include=true;
  	}

  	//FILTER BY CODE
  	var codeFilter=$('#codeselect2 option:selected').text();
  	if(codeFilter=='All'){

  	}else if(codeFilter=='Flat'){
  		for(var i=0;i<wlData.length;i++){
  			var bet=wlData[i];
  			//console.log("bet: " + JSON.stringify(bet));
  			if(bet.code!= 'FLAT'){
  				bet.include=false;
  			}
  		}

  	}
  	else if(codeFilter=='Jumps'){
  		for(var i=0;i<wlData.length;i++){
  			var bet=wlData[i];
  			if(bet.code!= 'HURDLE' && bet.code!='CHASE'){
  				bet.include=false;
  			}
  		}

  	}
  	//FILTER BY EXPECTED RETURN
	var expectedReturnFilterGT=$('#f-expected-gt-2').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(expectedReturnFilterGT !== ''){
		for(var i=0;i<wlData.length;i++){
  			var bet=wlData[i];
  			if(bet.expectedReturn < parseFloat(expectedReturnFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var expectedReturnFilterLT=$('#f-expected-lt-2').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(expectedReturnFilterLT !== ''){
		for(var i=0;i<wlData.length;i++){
  			var bet=wlData[i];
  			if(bet.expectedReturn > parseFloat(expectedReturnFilterLT)){
  				bet.include=false;
  			}
  		}


	}
	//FILTER BY PROBABILITY
	var probFilterGT=$('#f-prob-gt-2').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(probFilterGT !== ''){
		for(var i=0;i<wlData.length;i++){
  			var bet=wlData[i];
  			if(bet.probability < parseFloat(probFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var probFilterLT=$('#f-prob-lt-2').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(probFilterLT !== ''){
		for(var i=0;i<wlData.length;i++){
  			var bet=wlData[i];
  			if(bet.probability > parseFloat(probFilterLT)){
  				bet.include=false;
  			}
  		}


	}

	//FILTER BY PRICE

	var priceFilterGT=$('#f-price-gt-2').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(priceFilterGT !== ''){
		for(var i=0;i<wlData.length;i++){
  			var bet=wlData[i];
  			if(bet.price < parseFloat(priceFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var priceFilterLT=$('#f-price-lt-2').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(priceFilterLT !== ''){
		for(var i=0;i<wlData.length;i++){
  			var bet=wlData[i];
  			if(bet.price > parseFloat(priceFilterLT)){
  				bet.include=false;
  			}
  		}


	}

	//now re-draw the chart
	var newData=[];
	var runningTotal=0;
  		 
	for(var i=0;i<wlData.length;i++){
		var bet=wlData[i];
		if(bet.include){
			var ret=bet.actualReturn;
			runningTotal+=ret;
			newData.push(runningTotal);
		}
	}
	//redraw the chart
	var chart = $('#graphcontainer2').highcharts();
    chart.series[0].setData(newData);
     //and re-render the bets
    renderBets(wlData,'#bets2');
    // setStats(wlData,'#roi2','#sharpe2','#archie2',false);
     setStats(wlData,'#nbets2','#nwins2','#winpc2','#roi2','#sharpe2','#archie2','#exp2','#oexp2',false)
}



function redrawChart3(){

	//reset
	for(var i=0;i<pbData.length;i++){
  			var bet=pbData[i];
  			bet.include=true;
  	}


  	//FILTER BY CODE
  	var codeFilter=$('#codeselect3 option:selected').text();
  	if(codeFilter=='All'){

  	}else if(codeFilter=='Flat'){
  		for(var i=0;i<pbData.length;i++){
  			var bet=pbData[i];
  			//console.log("bet: " + JSON.stringify(bet));
  			if(bet.code!= 'FLAT'){
  				bet.include=false;
  			}
  		}

  	}
  	else if(codeFilter=='Jumps'){
  		for(var i=0;i<pbData.length;i++){
  			var bet=pbData[i];
  			if(bet.code!= 'HURDLE' && bet.code!='CHASE'){
  				bet.include=false;
  			}
  		}

  	}


  	//FILTER BY EXPECTED RETURN
	var expectedReturnFilterGT=$('#f-expected-gt-3').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(expectedReturnFilterGT !== ''){
		for(var i=0;i<pbData.length;i++){
  			var bet=pbData[i];
  			if(bet.expectedReturn < parseFloat(expectedReturnFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var expectedReturnFilterLT=$('#f-expected-lt-3').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(expectedReturnFilterLT !== ''){
		for(var i=0;i<pbData.length;i++){
  			var bet=pbData[i];
  			if(bet.expectedReturn > parseFloat(expectedReturnFilterLT)){
  				bet.include=false;
  			}
  		}


	}
	//FILTER BY PROBABILITY
	var probFilterGT=$('#f-prob-gt-3').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(probFilterGT !== ''){
		for(var i=0;i<pbData.length;i++){
  			var bet=pbData[i];
  			if(bet.probability < parseFloat(probFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var probFilterLT=$('#f-prob-lt-3').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(probFilterLT !== ''){
		for(var i=0;i<pbData.length;i++){
  			var bet=pbData[i];
  			if(bet.probability > parseFloat(probFilterLT)){
  				bet.include=false;
  			}
  		}


	}

	//FILTER BY PRICE

	var priceFilterGT=$('#f-price-gt-3').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(priceFilterGT !== ''){
		for(var i=0;i<pbData.length;i++){
  			var bet=pbData[i];
  			if(bet.price < parseFloat(priceFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var priceFilterLT=$('#f-price-lt-3').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(priceFilterLT !== ''){
		for(var i=0;i<pbData.length;i++){
  			var bet=pbData[i];
  			if(bet.price > parseFloat(priceFilterLT)){
  				bet.include=false;
  			}
  		}


	}

	//now re-draw the chart
	var newData=[];
	var runningTotal=0;
  	var n=0;	 
	for(var i=0;i<pbData.length;i++){
		var bet=pbData[i];
		if(bet.include){
			var ret=bet.actualReturn;
			runningTotal+=ret;
			newData.push(runningTotal);
			n++
		}
	}
	//redraw the chart
	var chart = $('#graphcontainer3').highcharts();
    chart.series[0].setData(newData);
    //and re-render the bets
    renderBets(pbData,'#bets3');
    //and set stats
    //setStats(pbData,'#roi3','#sharpe3','#archie3',true)
    setStats(pbData,'#nbets3','#nwins3','#winpc3','#roi3','#sharpe3','#archie3','#exp3','#oexp3',true)
//}

    //set ROI
   // var roi=runningTotal/n;
   // $('#roi1').text(parseFloat(roi).toFixed(3));
}


function redrawChart4(){

	//reset
	for(var i=0;i<plData.length;i++){
  			var bet=plData[i];
  			bet.include=true;
  	}


  	//FILTER BY CODE
  	var codeFilter=$('#codeselect4 option:selected').text();
  	if(codeFilter=='All'){

  	}else if(codeFilter=='Flat'){
  		for(var i=0;i<plData.length;i++){
  			var bet=plData[i];
  			//console.log("bet: " + JSON.stringify(bet));
  			if(bet.code!= 'FLAT'){
  				bet.include=false;
  			}
  		}

  	}
  	else if(codeFilter=='Jumps'){
  		for(var i=0;i<plData.length;i++){
  			var bet=plData[i];
  			if(bet.code!= 'HURDLE' && bet.code!='CHASE'){
  				bet.include=false;
  			}
  		}

  	}


  	//FILTER BY EXPECTED RETURN
	var expectedReturnFilterGT=$('#f-expected-gt-4').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(expectedReturnFilterGT !== ''){
		for(var i=0;i<plData.length;i++){
  			var bet=plData[i];
  			if(bet.expectedReturn < parseFloat(expectedReturnFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var expectedReturnFilterLT=$('#f-expected-lt-4').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(expectedReturnFilterLT !== ''){
		for(var i=0;i<plData.length;i++){
  			var bet=plData[i];
  			if(bet.expectedReturn > parseFloat(expectedReturnFilterLT)){
  				bet.include=false;
  			}
  		}


	}
	//FILTER BY PROBABILITY
	var probFilterGT=$('#f-prob-gt-4').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(probFilterGT !== ''){
		for(var i=0;i<plData.length;i++){
  			var bet=plData[i];
  			if(bet.probability < parseFloat(probFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var probFilterLT=$('#f-prob-lt-4').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(probFilterLT !== ''){
		for(var i=0;i<plData.length;i++){
  			var bet=plData[i];
  			if(bet.probability > parseFloat(probFilterLT)){
  				bet.include=false;
  			}
  		}


	}

	//FILTER BY PRICE

	var priceFilterGT=$('#f-price-gt-4').val();
	//console.log("ERF:" + expectedReturnFilterGT);
	if(priceFilterGT !== ''){
		for(var i=0;i<plData.length;i++){
  			var bet=plData[i];
  			if(bet.price < parseFloat(priceFilterGT)){
  				bet.include=false;
  			}
  		}


	}

	var priceFilterLT=$('#f-price-lt-4').val();
	//console.log("ERF:" + expectedReturnFilterLT);
	if(priceFilterLT !== ''){
		for(var i=0;i<plData.length;i++){
  			var bet=plData[i];
  			if(bet.price > parseFloat(priceFilterLT)){
  				bet.include=false;
  			}
  		}


	}

	//now re-draw the chart
	var newData=[];
	var runningTotal=0;
  	var n=0;	 
	for(var i=0;i<plData.length;i++){
		var bet=plData[i];
		if(bet.include){
			var ret=bet.actualReturn;
			runningTotal+=ret;
			newData.push(runningTotal);
			n++
		}
	}
	//redraw the chart
	var chart = $('#graphcontainer4').highcharts();
    chart.series[0].setData(newData);
    //and re-render the bets
    renderBets(plData,'#bets4');
    //and set stats
    //setStats(plData,'#roi4','#sharpe4','#archie4',false)
    setStats(plData,'#nbets4','#nwins4','#winpc4','#roi4','#sharpe4','#archie4','#exp4','#oexp4',false)

    //set ROI
   // var roi=runningTotal/n;
   // $('#roi1').text(parseFloat(roi).toFixed(3));
}


function renderBets(data,ulid){
	//clear the list
	$(ulid).empty();


	var runningTotal=0;
	var n=1;
	for(var i=0;i<data.length;i++){
		var bet=data[i];
		if(bet.include){
			var ret=bet.actualReturn;
			runningTotal+=ret;
			var otS=$.format.date(new Date(bet.offtime), 'yyyy-MM-dd HH:mm');
			$(ulid).append('<li>' +n + ' ' +bet.venue + ' '+ otS + ' '+ bet.code +' ' + bet.markettype +' ' + bet.bettype + ' ' +bet.horse + ' ' +bet.price + ' ' +parseFloat(bet.probability).toFixed(3) + ' ' +parseFloat(bet.expectedReturn).toFixed(3) + ' ' +parseFloat(bet.actualReturn).toFixed(3) + ' ' + parseFloat(runningTotal).toFixed(3) + '</li>')
			n++;
		}
	}

}

function setStats(data,nbetsEl,nwinsEl,nwinpcEL,roiEl,sharpeEl,archieEl,expEl,oexpEl,back){
	var expected=0.0;
  var myExpected=0.0;
	var winners=0
	var runningTotal=0;
	var n=0;
	 var returnsData=[]
	for(var i=0;i<data.length;i++){
		var bet=data[i];
    //console.log("p:" + JSON.stringify(bet));
		if(bet.include==true && bet.price > 0){
      //for my expected
      
    if(back){
      myExpected+=bet.probability;
    }
    else{
      myExpected+=1-bet.probability;
    }
     

			//for roi
			var ret=bet.actualReturn;
			runningTotal+=ret;

			//for sharpe
			returnsData.push(ret);

			//for archie
			var price=bet.price;
			var probability;

			if(back){
				probability=1/bet.price;

			}
			else{
				probability=1 -(1/bet.price);//the chance of losing (i.e. of winning the lay bet)
			}
			//console.log(back + " price: " + price + " probability: " + probability);
			if(bet.actualReturn > 0)winners++;
			expected+=probability;

			n++
		}
		
	}

  //console.log("myexpected: " + myExpected);

  //set nbets, winners, win%

  $(nbetsEl).text(n);
  $(nwinsEl).text(winners);
  $(nwinpcEL).text(parseFloat(winners/n).toFixed(2));
  $(expEl).text(parseFloat(myExpected).toFixed(2) + '(' +parseFloat(winners/myExpected).toFixed(2) +')');
  $(oexpEl).text(parseFloat(expected).toFixed(2) + '(' +parseFloat(winners/expected).toFixed(2) +')');

		
	//set ROI
	//console.log('runningtotal: ' + runningTotal + " n: " + n);
    var roi=runningTotal/n;
    $(roiEl).text(parseFloat(roi).toFixed(3));

    //set Sharpe
    var sd=standardDeviation(returnsData);
    var avg=mean(returnsData);
    var sharpe=avg/sd;
    $(sharpeEl).text(parseFloat(sharpe).toFixed(3));

    //set archie
    //console.log(back + " winners: "+ winners + " expected: " + expected + " n: " + n);
    var archie=(n * ((winners - expected)*(winners - expected))) / (expected *(n - expected));
    $(archieEl).text(parseFloat(archie).toFixed(3));

}


//STATS FNS

//Check whether is a number or not
function isNum(args)
{
args = args.toString();
if (args.length == 0) return false;
for (var i = 0; i<args.length; i++)
{
if ((args.substring(i,i+1) < "0" || args.substring(i, i+1) > "9") && args.substring(i, i+1) != "."&& args.substring(i, i+1) != "-")
{
return false;
}
}
return true;
}

//calculate the mean of a number array
function mean(arr)
{
var len = 0;
var sum = 0;
for(var i=0;i<arr.length;i++)
{
if (arr[i] == ""){}
else if (!isNum(arr[i]))
{
alert(arr[i] + " is not number!");
return;
}
else
{
len = len + 1;
sum = sum + parseFloat(arr[i]);
}
}
return sum / len;
}

function variance(arr)
{
var len = 0;
var sum=0;
for(var i=0;i<arr.length;i++)
{
if (arr[i] == ""){}
else if (!isNum(arr[i]))
{
alert(arr[i] + " is not number, Variance Calculation failed!");
return 0;
}
else
{
len = len + 1;
sum = sum + parseFloat(arr[i]);
}
}
var v = 0;
if (len > 1)
{
var mean = sum / len;
for(var i=0;i<arr.length;i++)
{
if (arr[i] == ""){}
else
{
v = v + (arr[i] - mean) * (arr[i] - mean);
}
}
return v / len;
}
else
{
return 0;
}
}

function standardDeviation(arr){
	return(Math.sqrt(variance(arr)));
}




