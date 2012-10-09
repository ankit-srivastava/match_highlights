Date.prototype.setISO8601 = function (string) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    this.setTime(Number(time));
}

var current_event_count = 0;
var innings = 1;
var overs = 0;
var wickets = 0;
var myScroll;
var previous_over_index = 0;

function sendAjaxEvents(contest_id)
{
	$.ajax({
		type: "get",
	    // url: "http://api.playup.com/sportsdata/contests/"+contest_id+"/events",
	    url: "http://match-events.com/test_response.json",
	    dataType: 'json',
	    contentType: 'application/json; charset=utf-8',	
	    headers:{'X-PlayUp-API-Key':'com.playup.web.extensions-rVrrM4ZyIyzx9v'},
	}
	).success(function(data) {
    	// console.log(data);
    	data = processDataFields(data);
		// console.log(parseInt(current_event_count));
    	
    	if(parseInt(current_event_count) == 0)
    	{
    		var isIDevice = (/iphone|ipad/gi).test(navigator.appVersion);
			var extra = 0;
			var padding = 20; //of content div
			if(isIDevice)
				extra = -10;//50;
			else
				extra = -10;
			
			setTimeout($.proxy(function () { 
		        setupScroll();
		    }, this), 1000);	

    		data.current_event_count = 0;
    		current_event_count = data.items.length;
    		document.getElementById("result").innerHTML = tmpl("commentary-template", data);
    	}
    	else
    	{
    		//HANDLE NEW EVENTS
    		if(data.items.length > current_event_count)
    		{
	    		data.current_event_count = current_event_count;
	    		var new_events = tmpl("commentary-template", data);
	    		
	    		$(new_events).hide().prependTo("#result").slideDown("slow");
	    		current_event_count = data.items.length;
	    	}
    	}
    	
			
		
    	
    }
	).error(function() { 
		alert("error"); 
	});
}

function sendAjaxScores(contest_id)
{
	$.ajax({
		type: "get",
	    url: "http://api.playup.com/sportsdata/contest_details/"+contest_id,
	    dataType: 'json',
	    contentType: 'application/json; charset=utf-8',	
	    headers:{'X-PlayUp-API-Key':'com.playup.web.extensions-rVrrM4ZyIyzx9v'},
	}
	).success(function(data) {
    	// console.log(data);
    	var res = isLive(data)[0];
    	data.is_live = res;

    	if(isLive(data)[1] == false)
	    	alert("Upcoming match handling");


    	var names = { "Test Cricket" : "Test Match", "One Day Internationals" : "ODI", "T20 Internationals" : "T20","ICC World T20" : "T20" };
    	var match_type = names[data.competition_name] || "";
    	data.match_type = match_type;

    	data.match_status = isLive(data)[2];

    	data.match_date_place = getDatePlace(data);
    	data = getMatchScores(data);
    	
    	document.getElementById("match_stats").innerHTML = tmpl("scores-template", data);

    	setupScroll();
        

	    // if(isLive(data)[0] == true)
	    // {
	    	setTimeout($.proxy(function () { 
		        sendAjaxScores(contest_id);
		 		sendAjaxEvents(contest_id);  
		    }, this), 10000);
	    // }
	}
	).error(function() { 
		alert("error"); 
	});
}

function processDataFields(data)
{
	

  	console.log(data);
	for(i=current_event_count; i < data.items.length; i++) 
	{
		if(data.items[i].event_type == "cricket_wicket_event")
		{
			wickets++;
			data.items[i].long_message = data.items[i].long_message.slice(8);
			if(res = data.items[i].long_message.match(/out \(\D+/))
    		{
    			data.items[i].long_message = data.items[i].long_message.replace(/out \(\D+/,"");
    			data.items[i].bold_message = 'OUT';	
    			data.items[i].how_out = res[0].slice(5,-1);	
    		}
		}
		if(data.items[i].long_message.match(/FOUR!/))
		{
			data.items[i].long_message = data.items[i].long_message.slice(0,-5);
			data.items[i].bold_message = 'FOUR!';	
    	}
    	if(data.items[i].long_message.match(/SIX!/))
		{
			data.items[i].long_message = data.items[i].long_message.slice(0,-4);
			data.items[i].bold_message = 'SIX!';	
    	}
		if(data.items[i].event_type == "cricket_end_of_over_event")
		{
			data.items[i].is_end_of_over = true;
			overs++;
			var over_status = data.items[i].long_message.match(/, (\D+) is now at (\d+)/);

			data.items[i].current_team = over_status[1];
			data.items[i].current_score = over_status[2];
			

			if(data.items[i].long_message.match(/End of over 1,/) && overs > 2)
			{
				for(j=previous_over_index;j<i;j++)
				{
					innings = 2;
					overs = 1;
					wickets = 0;
				}
				data.items[previous_over_index+1].is_end_of_innings = true;		
			}
			previous_over_index = i;	
		}
		data.items[i].current_over = overs;
		data.items[i].current_inning = innings;
		data.items[i].current_wickets = wickets.toString();	
	}
	return data;
}

function getQuerystring(key, default_) 
{
    if (default_==null) default_=""; 
    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if(qs == null)
      return default_;
    else
      return qs[1];
}

function getMatchScoreDetails(id)
{
	$.ajax({
		type: "get",
	    url: "http://api.playup.com/sportsdata/contest_details/"+id,
	    dataType: 'json',
	    contentType: 'application/json; charset=utf-8',	
	    headers:{'X-PlayUp-API-Key':'com.playup.web.extensions-rVrrM4ZyIyzx9v'},
	}).success(function(data) {
	    	// console.log(data);
	    	return data;
	}).error(function() { alert("error"); });
}

function isLive(match_details){
	

	var start_date = new Date();

	if(!match_details["start_time"])
		start_date.setISO8601(match_details["scheduled_start_time"]);
	else
		start_date.setISO8601(match_details["start_time"]);
	
	date = new Date();

	var res = date > start_date;
	var res2 = res;
	var status;

	if(match_details["end_time"])
	 	res = res && (date < (new Date(match_details["end_time"])));
	
	if(match_details["clock"].annotation)
		res = res && (match_details["clock"].annotation != "Match ended");

	if(res==true)
		status = 'LIVE';
	else
		status = 'Completed';

	return [res,res2,status];
}

function getDatePlace(match_details){
	
	var date = new Date();
	date.setISO8601(match_details["start_time"]);
	
	var start_time;
	if(date == "Invalid Date")
		start_time = [];
	else
	start_time = date.toDateString().split(" ");

	var month = (start_time[1] || "");
	var day = (start_time[2] || "");
	var comma = (start_time.length != 0 && match_details["stadium_name"]) ? ", " : "";
	var stadium = match_details["stadium_name"] || "";
	return month + " " + day + comma + stadium;
}

function getInning(match_details,teamIndex, inningIndex){
	if(inningIndex == undefined)
		return match_details["scores"][teamIndex]["innings"];
	else
		return match_details["scores"][teamIndex]["innings"][inningIndex];
}

function getMatchStatus(match_details)
{
	var summary;
	// non-live match
	summary = match_details["clock"].summary;
	var team_name1 		 = match_details["scores"][0]["team"].display_name
	var team_name_short1 = match_details["scores"][0]["team"].short_name
	var team_name2 		 = match_details["scores"][1]["team"].display_name
	var team_name_short2 = match_details["scores"][1]["team"].short_name
	if(summary.length>32)
	{	
		summary=summary.replace(team_name1,team_name_short1); 
		summary=summary.replace(team_name2,team_name_short2); 
	}
	return summary;
}


function getMatchScores(match_details)
{
	var summary = '';
	if(isLive(match_details)[0] == false)
	{
		summary = getMatchStatus(match_details);
	}

	if(this.getInning(match_details,0).length == 1)
	{
		match_details.current_inning = 1;
		var batInningIndex = 1, bowlInningIndex = 0;
		if(getInning(match_details,0,0)["is_batting"] == true)
		{
			batInningIndex = 0;
			bowlInningIndex = 1;
		}

		if(summary == '')
		{
			summary = match_details["scores"][batInningIndex]["team"].display_name + " is batting first";
			if(summary.length>32)
				summary = match_details["scores"][batInningIndex]["team"].short_name + " is batting first";
		}
		
		match_details.batting_team_name = match_details["scores"][batInningIndex]["team"].display_name.toUpperCase();
		match_details.batting_team_score = match_details["scores"][batInningIndex]["innings"][0].total + "/" + match_details["scores"][bowlInningIndex]["innings"][0].wickets;
		match_details.batting_team_overs = match_details["scores"][batInningIndex]["innings"][0]["overs"] ? "(Ov " + match_details["scores"][batInningIndex]["innings"][0]["overs"]+ ")" : "";
		match_details.batting_team_runrate = match_details["scores"][batInningIndex]["innings"][0]["run_rate"] ? "(RR " + match_details["scores"][batInningIndex]["innings"][0]["run_rate"]+ ")" : "";

		

		// return summary;
	} // 2nd innings
	else 
	{
		match_details.current_inning = 2;
		var batInningIndex = 0, bowlInningIndex = 1;
		if(getInning(match_details,1,1).is_batting == true){
			batInningIndex = 1;
			bowlInningIndex = 0;
		}

		match_details.batting_team_name = match_details["scores"][batInningIndex]["team"].display_name.toUpperCase();
		match_details.batting_team_score = match_details["scores"][batInningIndex]["innings"][1].total + "/" + match_details["scores"][bowlInningIndex]["innings"][1].wickets;
		match_details.batting_team_overs = match_details["scores"][batInningIndex]["innings"][1]["overs"] ? "(Ov " + match_details["scores"][batInningIndex]["innings"][1]["overs"]+ ")" : "";
		match_details.batting_team_runrate = match_details["scores"][batInningIndex]["innings"][1]["run_rate"] ? "(RR " + match_details["scores"][batInningIndex]["innings"][1]["run_rate"]+ ")" : "";

		match_details.bowling_team_name = match_details["scores"][bowlInningIndex]["team"].display_name.toUpperCase();
		match_details.bowling_team_score = match_details["scores"][bowlInningIndex]["innings"][0].total + "/" + match_details["scores"][batInningIndex]["innings"][0].wickets;
		match_details.bowling_team_overs = match_details["scores"][bowlInningIndex]["innings"][0]["overs"] ? "(Ov " + match_details["scores"][bowlInningIndex]["innings"][0]["overs"]+ ")" : "";
		match_details.bowling_team_runrate = match_details["scores"][bowlInningIndex]["innings"][0]["run_rate"] ? "(RR " + match_details["scores"][bowlInningIndex]["innings"][0]["run_rate"]+ ")" : "";

		if(summary == '')
		{
			var totalBalls;
			if(match_details["competition_name"] == "Test Cricket")
				totalBalls = 0;
			else if(match_details["competition_name"] == "One Day Internationals")
				totalBalls = 300;
			else
				totalBalls = 120;

			var runs 			  = match_details["scores"][bowlTeamIndex]["innings"][0].total - match_details["scores"][batTeamIndex]["innings"][1].total;
			var balls 			  = totalBalls - parseInt(match_details["scores"][batInningIndex]["innings"][1].overs.split(".")[0])*6 - parseInt(match_details["scores"][batInningIndex]["innings"][1].overs.split(".")[1]);

			summary = team_name + " need " + (runs + 1) + " runs off " + balls + " balls";
			if(summary.length>32)
				summary = team_name_short + " need " + (runs + 1) + " runs off " + balls + " balls";
		}
	}
	match_details.summary = summary;
	return match_details;
}	

function setupScroll(){
	
	if(myScroll)
		return false;
		

	var height = $(window).height() - $("#match_stats").height() - 20; // - $(".result").height() - padding - $("#scores").height()
	$("#wrapper").css("height", height);	
	
	if(navigator.userAgent.match(/Windows Phone/i))
	{
		myScroll = $("#wrapper").niceScroll({touchbehavior : true, bouncescroll : true});
	}
	else
	{
		myScroll = new iScroll('wrapper', { 
			shrinkScrollbar : false,
			fadeScrollbar : true,
			checkDOMChanges: true
		});			
	}	

	
	return myScroll;
}

