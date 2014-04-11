
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});


Parse.Cloud.define("check_RP", function(request, response) {

  	Parse.Cloud.useMasterKey();
	
	var shopper_id = request.params.shopper_id;	
	var shopperObj = {"__type":"Pointer","className":"shoppers","objectId":shopper_id};
	
	var rpoints = 0;
	var spoints = 0;	
	var out = new Object;
	
	var shopper_points = Parse.Object.extend("shopper_points");	
	var spQuery = Parse.Query(shopper_points);
	
	spQuery.equalTo("sp_s_id", shopperObj);
	spQuery.include("sp_rp_id");
	spQuery.find()
		.then(function(sp){
			success.response(sp);
		});
	
	
});


/*
Parse.Cloud.define("sum_up", function(request, response) {
  	Parse.Cloud.useMasterKey();
	var user_id = request.params.user_id;
	var userObj = {"__type":"Pointer","className":"testUser","objectId":user_id};
	
	var shopper_points = Parse.Object.extend("shopper_points");
	var spQuery = Parse.Query(shopper_points);
			
	var points = 0;
	var spoints = 0
	var out = new Object;
	
	pQuery.equalTo("user", userObj);
	pQuery.include("child");
	pQuery.select("child");
	pQuery.find()
	.then(function(child){
		
		if(typeof child != "undefined"){
			//response.success(child);
			for(var x = 0; x<child.length; x++){
				var pp = child[x].get("child");
				points = points + pp.get("points");
				
			}
			out.points = points;
		}else{
			response.error("NONE");
		}
		
	})
	.then(function(){
		var subParent = Parse.Object.extend("subParent");
		var spQuery = new Parse.Query(subParent);
		
		spQuery.equalTo("user", userObj);
		spQuery.include("subChild");
		spQuery.select("subChild");
		spQuery.find()
		.then(function(child){
			
			if(typeof child != "undefined"){
				//response.success(child);
				for(var x = 0; x<child.length; x++){
					var sp = child[x].get("subChild");
					spoints = spoints + sp.get("points");
					
				}
				out.spoints = spoints;
			}else{
				response.error("NONE");
			}
		var rp_points = out.points - out.spoints;
		response.success(rp_points);
		});
	});	
	
});

*/