var api_key = "";
var id = 'ICEB-2015-0002';
var http = require('http');
var dbname = 'comments'
var m = require('./mongo.js')(dbname);
var pack_size = 1000;

var get_options = function(api_key,countsOnly,id,rpp,po){
	return {
		host : "api.data.gov",
		path: '/regulations/v3/documents.json?api_key=' + api_key 
		+ '&countsOnly=' + countsOnly 
		+ '&s=' + id 
		+ '*&dct=PS&rpp=' + rpp
		+ '&po=' + po
	}
}
var target = 0;
var worker_callback = function(response){
	var str = '';
	response.on('data',function(chunk){
		str += chunk;
	});

	response.on('end',function(){
		var num = JSON.parse(str)["totalNumRecords"];
		var comments = JSON.parse(str)["documents"];
		var success = 0;
		for(var c in comments){
			m.insert(comments[c]['documentId'],comments[c]['commentText'],comments[c]['postedDate'],comments[c]['title'],function(){
				success += 1;
				if(success == comments.length){
					console.log("success");
					target -= success;
					console.log(target + " remains")
					if(target == 0){
						m.close();
					}
				}
			});
		}
	})
}

var callback = function(response){
	var str = '';
	response.on('data',function(chunk){
		str += chunk;
	});

	response.on('end',function(){
		var num = JSON.parse(str)["totalNumRecords"];
		target = num;
		console.log('there are ' + num + ' comments');
		for(var i = 0;i < num;i += pack_size){
			http.request(get_options(api_key,0,id,pack_size,i),worker_callback).end();
		}
	})
}

http.request(get_options(api_key,1,id,10,0),callback).end();

