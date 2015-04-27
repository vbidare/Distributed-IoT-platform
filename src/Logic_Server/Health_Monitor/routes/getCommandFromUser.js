var express = require('express');
var router = express.Router();
var http = require('http');
var util = require('util');
var query = require('querystring');

var router = express.Router();

/* Input JSON
 * { 
 * 		accessKey : "sourabh",
 * 		sensorFamilyId : 11
 * }
 */
 
router.post('/', function(req, response, next) {
	
	range = '1000';
	var ids = [];
	
	var lat=req.body.lat
	var lon=req.body.lon
	var familyId=req.body.familyId
	var command=req.body.command
	
	console.log("\n\n---------------")
	//console.log("Received lat & lon as post parameters : " + lat + lon)
	//console.log("Access Token is : " + filterServerAccessToken )

	function getIdsFromRegistry(index){
		if(index < 1){
	        var options = {
	      		host: registryServerIP,
	      		port: PORT,
	      		path: '/registry/sensors/location/'+familyId+'?lat='+lat+'&lon='+lon+'&range='+range+'&accessKey='+filterServerAccessToken
	    	};
	    	console.log('/registry/sensors/location/'+familyId+'?lat='+lat+'&lon='+lon+'&range='+range+'&accessKey='+filterServerAccessToken);
	    	var req = http.get(options, function(res) {
		    	var registryData = "";
		   		res.on('data', function(chunk) {
		   		  	registryData += chunk;
			    }).on('end', function() {
			    	console.log(JSON.parse(registryData));
			    	registryData = JSON.parse(registryData).data.sensordata;
			    	for (var j = registryData.length - 1; j >= 0; j--) {
			    		// console.log(registryData[j].id);
			    		ids[ids.length] = registryData[j].id;
			    	}    	   
					getIdsFromRegistry(index+1);
		        });
			});
		}else{
			// Post call to filter server
			console.log("IDS are : " + ids)
	    	var dataToSend = JSON.stringify({
		    	command : command

			});

			var options = {
		    	host: filterServerIP,
		    	port: 3000,
		    	path: '/commands/'+ids[0],
		    	method: 'POST',
		    	headers: {
		        	'Content-Type': 'application/json',
		        	'Content-Length': Buffer.byteLength(dataToSend)
		    	}
			};

			var req1 = http.request(options, function(res1) {

		    	var message = '';
		    	res1.on('data', function(chunk) {
		      	  message += chunk;
		    	});

		    	res1.on('end', function() {
		        	response.json(JSON.parse(message));
		    	});
			});

			req1.on('error', function(err) {
		    	console.log(err);
			});

			req1.write(dataToSend);
			req1.end();
			//End of post call
		}
	}
	getIdsFromRegistry(0);
});

module.exports = router;

