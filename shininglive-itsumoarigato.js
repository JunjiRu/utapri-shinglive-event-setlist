const song_count = 19;
const pro_lp = 25;
const max_boost_magnification = 3;
const lp_recovery_duration = 3; //unit is minute
const user_input_field = [
	'point_target', 'point_current', 'datetime_end', 'point_mission',
	'song_title1', 'song_title2', 'song_title3', 'song_title4', 'song_title5', 'song_title6', 'song_title7', 'song_title8', 'song_title9', 'song_title10', 'song_title11', 'song_title12', 'song_title13', 'song_title14', 'song_title15', 'song_title16', 'song_title17', 'song_title18', 'song_title19',
	'row1_0', 'row2_0', 'row3_0', 'row4_0', 'row5_0', 'row6_0', 'row7_0', 'row8_0', 'row9_0', 'row10_0', 'row11_0', 'row12_0', 'row13_0', 'row14_0', 'row15_0', 'row16_0', 'row17_0', 'row18_0', 'row19_0',
];
const important_element = [
	'row1_', 'row2_', 'row3_', 'row4_', 'row5_', 'row6_', 'row7_', 'row8_', 'row9_', 'row10_', 'row11_', 'row12_', 'row13_', 'row14_', 'row15_', 'row16_', 'row17_', 'row18_', 'row19_',
	'cost_', 'eff_', 'last_lp_', 'need_item_', 'ave_round_type3_'
];

window.onload = function(){
	log_access();
	init();
};

function init(){
	calcLastPoint();
	setEndDatetime();
}

function calcLastPoint(){
	var target = document.getElementById('point_target').value;
	var current = document.getElementById('point_current').value;
	var last = target - current;
	document.getElementById('point_last').innerHTML = last;
	updateAnyElement();
}

function updateAnyElement(){
	var datetime = new Date();
	document.getElementById('datetime_current').innerHTML = datetime.toLocaleString().slice(0, -3);
	calcLastTime(false);
}

function setEndDatetime(){
/*	var datetime = new Date();
	var event_last_days = parseInt(document.getElementById('event_last').value);
	datetime.setDate(datetime.getDate() + event_last_days);
	datetime.setHours(14);
	datetime.setMinutes(0);
	document.getElementById('datetime_end').value = datetime.toLocaleString().slice(0, -3);
	updateAnyElement();
*/}

function calcLastTime(get_last_days){
	var current_string = document.getElementById('datetime_current').innerHTML;
	var end_string = document.getElementById('datetime_end').value;
	var current = Date.parse(current_string);
	var end = Date.parse(end_string);
	var last_time = end - current;
	var mins = Math.floor(last_time / (1000 * 60));
	var hours = Math.floor(mins / 60);
	var days = Math.floor(hours / 24);
	var days_hours_mins = days+'日'+(hours-(days*24))+'時間'+(mins-(hours*60))+'分';
	var hours_mins = hours+'時間'+(mins-(hours*60))+'分';
	if(get_last_days === true){
		return days;
	}
	document.getElementById('last_time').innerHTML = days_hours_mins +'('+hours_mins+')';
	document.getElementById('last_recovery_lp').innerHTML = Math.floor(mins / lp_recovery_duration);
	calcPointEfficiency();
}

function setDividedValue(id){
	var value = document.getElementById(id).value;
	document.getElementById(id).value = Math.floor(value / max_boost_magnification);
	updateAnyElement();
}

function calcPointEfficiency(){
	// 全曲分ループ
	for(var song=1;song<=song_count;song++){
		var point = document.getElementById('row'+song+'_0').value;
		// ブースト後ポイント計算
		var boosted = false;
		for(var boost=1;boost<=song_count;boost++){
			if(!boosted && boost-1 >= (song_count-song)){
				point *= max_boost_magnification;
				boosted = true;
			}
			document.getElementById('row'+song+'_'+boost).innerHTML = point;
		}
	}
	calcOthers();
	get_state_text();
}

function calcOthers(){
	var best_efficiency = 0;
	var best_boost = 0;
	// 一周獲得ポイント, 一周消費LP
	for(var boost=0;boost<=song_count;boost++){
		// 一周獲得ポイント
		var point = 0;
		point += parseInt(document.getElementById('point_mission').value);
		point += parseInt(document.getElementById('point_clear').value);
		for(var song=1;song<=song_count;song++){
			if(boost !== 0){
				point += parseInt(document.getElementById('row'+song+'_'+boost).innerHTML);
			}else{
				point += parseInt(document.getElementById('row'+song+'_'+boost).value);
			}
		}
		document.getElementById('get_point_'+boost).innerHTML = point;

		// 一周消費LP
		var lp = pro_lp * song_count;
		if(boost !== 0){
			lp = (pro_lp * (max_boost_magnification - 1)) + parseInt(document.getElementById('cost_'+(boost-1)).innerHTML);
		}
		document.getElementById('cost_'+boost).innerHTML = lp;

		// 効率(合計pt/LP)
		var eff = Math.round(point/lp*1000)/1000;
		document.getElementById('eff_'+boost).innerHTML = eff;

		// 最高効率 確認
		if(best_efficiency <= eff){
			best_boost = boost;
			best_efficiency = eff;
		}

		var point_last = parseInt(document.getElementById('point_last').innerHTML);
		// 必要残り周回数
		var last_round = Math.round(point_last/point*10)/10;
		document.getElementById('last_round_'+boost).innerHTML = last_round;

		// 必要LP(概算)
		var last_lp = Math.round(lp * last_round*10)/10;
		document.getElementById('last_lp_'+boost).innerHTML = last_lp;

		// 要アイテム回復
		var need_item = last_lp - parseInt(document.getElementById('last_recovery_lp').innerHTML);
		document.getElementById('need_item_'+boost).innerHTML = need_item;

		var last_days = calcLastTime(true);
		// 今日, 明日, 明後日から平均周回 
		for(var i=1;i<=3;i++){
			var tmp = '-';
			if(last_days > 0){
				tmp = Math.round(last_round/last_days*10)/10;
			}
			document.getElementById('ave_round_type'+i+'_'+boost).innerHTML = tmp;
			last_days -= 1;
		}
	}

	// 最高効率の列全体の文字色を赤にする
	var count = important_element.length;
	for(boost=0;boost<=song_count;boost++){
		var color = 'black';
		if(boost === best_boost){
			color = 'red';
		}
		for(var i=0;i<count;i++){
			var element = document.getElementById(important_element[i]+boost);
			element.style.color = color;
		}
	}
}

function get_state_text(){
	var count = user_input_field.length;
	var result = {};
	for(var i=0;i<count;i++){
		result[user_input_field[i]] = document.getElementById(user_input_field[i]).value;
	}
	var json_text = JSON.stringify(result);
	document.getElementById('state_text').value = json_text;
}

function set_state_text(){
	var count = user_input_field.length;
	var json_text = document.getElementById('state_text').value;
	var json = JSON.parse(json_text);
	for(var i=0;i<count;i++){
		document.getElementById(user_input_field[i]).value = json[user_input_field[i]];
	}
	calcLastPoint();
}

function copy_state_text(){
	var textarea = document.getElementById("state_text");
	textarea.select();
	document.execCommand("copy");
}

function get_song_title(){
	var data = {};
	var set_list_url = 'https://junjiru.github.io/utapri-shininglive-event/set_list.txt?date=' + new Date().getTime();
	var xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.onreadystatechange = function(){
		var arr = this.responseText.split("\n");
		for(var i=1;i<=song_count;i++){
			document.getElementById('song_title'+i).value = arr[i-1];
		}
	};
	xmlHttpRequest.open('GET', set_list_url, false);
	xmlHttpRequest.send(JSON.stringify(data));
}

function set_save_data_api(){
/*
	get_state_text();
	var data = {
		'type': 'set',
		'name': document.getElementById('db_name').value,
		'pass': document.getElementById('db_pass').value,
		'json': document.getElementById('state_text').value
	};

	var xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.onreadystatechange = function(){
        if(this.responseText){
			alert(this.responseText);
		}
	};
	xmlHttpRequest.open('POST', 'https://www4078uo.sakura.ne.jp/shining_live_api/api.php', false);
	xmlHttpRequest.send(JSON.stringify(data));
*/
}

function get_save_data_api(){
/*
	var data = {
		'type': 'get',
		'name': document.getElementById('db_name').value,
		'pass': document.getElementById('db_pass').value,
		'json': 'dummy'
	};

	var xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.onreadystatechange = function(){
		document.getElementById('state_text').value = this.responseText;
		set_state_text();
	};
	xmlHttpRequest.open('POST', 'https://domain/shining_live_api/api.php', false);
	xmlHttpRequest.send(JSON.stringify(data));
*/
}

function log_access(){
/*
	var data = {
		'type': 'access'
	};

	var xmlHttpRequest = new XMLHttpRequest();
	xmlHttpRequest.open('POST', 'https://domain/shining_live_api/api.php', false);
	xmlHttpRequest.send(JSON.stringify(data));
*/
}
