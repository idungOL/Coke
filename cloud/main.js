
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("hi", function(request, response) {

Parse.Cloud.useMasterKey();
 Parse.Cloud.run("check_RP", {shopper_id: request.params.shopper_id},
 			{	
 				success: function(rp_points){
		 			if(rp_points>1000){
			 			response.success("redempt");
		 			}else{
			 			response.error("Not enough Points");
		 			}
	 			}
 			});
});



Parse.Cloud.define("check_RP", function(request, response) {

  	Parse.Cloud.useMasterKey();
	
	var shopper_id = request.params.shopper_id;	
	var shopperObj = {"__type":"Pointer","className":"shoppers","objectId":shopper_id};
	
	var rpoints = 0;
	var spoints = 0;	
	var out = new Object;
	
	var shopper_points = Parse.Object.extend("shopper_points");	
	var spQuery = new Parse.Query(shopper_points);
	
	spQuery.equalTo("sp_s_id", shopperObj);
	spQuery.include("sp_rp_id");
	spQuery.find()
		.then(function(shop){
			if(typeof shop != "undefined"){
				
				for(var x = 0; x<shop.length; x++){
					var pp = shop[x].get("sp_rp_id");
					rpoints = rpoints + pp.get("rp_point");
					
				}
				out.rpoints = rpoints;
				
				//response.success(rpoints);
			}else{
				response.error("rp_point error");
			}
			
			
		})
		.then(function(){
			var shopRed = Parse.Object.extend("shopper_redemption");
			var srQuery = new Parse.Query(shopRed);
			
			srQuery.equalTo("sr_s_id", shopperObj);
			srQuery.include("sr_p_id");
			srQuery.find()
			.then(function(prize){
				if(typeof prize != "undefined"){
				
					for(var x = 0; x<prize.length; x++){
						var ppoint = prize[x].get("sr_p_id");
						spoints = spoints + ppoint.get("p_point");
						
					}
					out.spoints = spoints;					
					
				}else{
					response.error("p_point error");
				}
				var rp_points = out.rpoints - out.spoints;
				response.success(rp_points);
				
			});
			
		});
	
});


Parse.Cloud.define("redeem", function(request, response) {

Parse.Cloud.useMasterKey();
var reward_id = request.params.reward_id;
var rewardObj = {"__type":"Pointer","className":"rewards","objectId":reward_id};
var shopper_id = request.params.shopper_id;	
var shopperObj = {"__type":"Pointer","className":"shoppers","objectId":shopper_id};

 Parse.Cloud.run("check_RP", {shopper_id: request.params.shopper_id},
 			{	
 				success: function(rp_points){
 					
 					var prizes = Parse.Object.extend("prizes");
 					var prizeQuery = new Parse.Query(prizes);
 					prizeQuery.equalTo("p_r_id", rewardObj);
 					prizeQuery.find() 					
 					.then(function(myPrize){
	 					//response.success(myPrize);
	 					
	 					if(typeof myPrize != 'undefined'){
		 					
		 					if(myPrize.length>0){
			 					var reqPoints = myPrize[0].get("p_point");
			 					if(rp_points>reqPoints){
						 			//response.success("redempt");
						 			//insert validation here before saving						 			
						 			var shop_reds = Parse.Object.extend("shopper_redemption");
						 			var myPrizeObj = {"__type":"Pointer","className":"prizes","objectId":myPrize[0].id};
						 			var newSRQuery = new Parse.Query(shop_reds);
						 			newSRQuery.equalTo("sr_s_id", shopperObj);
						 			newSRQuery.equalTo("sr_p_id", myPrizeObj);
						 			newSRQuery.find()
						 			.then(function(checkSR){
							 			if(typeof checkSR != 'undefined'){
								 			if(checkSR.length == 0){
								 			
									 			var shop_red = new shop_reds();
									 			shop_red.set("sr_s_id", shopperObj);
									 			shop_red.set("sr_p_id", myPrizeObj);
									 			shop_red.save({
									 				success: function(){
										 				response.success("Redemption Successful");
									 				},
									 				error: function(error){
										 				response.error(error);
									 				}
									 			});									 			
									 			
								 			}else{
								 			
									 			response.error("Duplicate redemption.")
								 			
								 			}
								 			
								 			
							 			}else{
							 			
								 			response.error("Invalid shopper_redemtion query.")
							 			
							 			}
							 			
						 			});
						 			
						 			
						 			
						 			
					 			}else{
						 			response.error("Not enough Points");
					 			}
					 			
					 		}else{
						 		response.error("Prize for this reward can not be found.");
					 		}
		 					
	 					}else{
	 						response.error("Rewards not found.");
	 					}		 			
		 			});
	 			}
 });
 
});


Parse.Cloud.define("avail_promo", function(request, response) {

Parse.Cloud.useMasterKey();
var rp_id = request.params.rewards_point_id;
var rewardObj = {"__type":"Pointer","className":"rewards_point","objectId":rp_id};
var shopper_id = request.params.shopper_id;	
var shopperObj = {"__type":"Pointer","className":"shoppers","objectId":shopper_id};

var shopper_points = Parse.Object.extend("shopper_points");
var spQuery = new Parse.Query(shopper_points);

spQuery.equalTo("sp_s_id", shopperObj);
spQuery.equalTo("sp_rp_id", rewardObj);
spQuery.find()
	.then(function(mySP){
		if(typeof mySP != 'undefined'){			
			if(mySP.length == 0){
				var shopper_point = new shopper_points();
				shopper_point.set("sp_s_id", shopperObj);
				shopper_point.set("sp_rp_id", rewardObj);
				shopper_point.save({
	 				success: function(){
		 				response.success("Success!");
	 				},
	 				error: function(error){
		 				response.error(error);
	 				}
	 			});			
	 				
	 		}else{
				response.error("You have already availed this promo.")
			}
		
		}else{
			response.error("Invalid shopper_points query.");
		}		
	}); 
});



Parse.Cloud.define("sample_promo", function(request, response) {

Parse.Cloud.useMasterKey();
var keyword = request.params.keyword;
var shopper_id = request.params.shopper_id;	
var shopperObj = {"__type":"Pointer","className":"shoppers","objectId":shopper_id};

var shopper_points = Parse.Object.extend("shopper_points");
var spQuery = new Parse.Query(shopper_points);

spQuery.equalTo("sp_s_id", shopperObj);
spQuery.equalTo("sp_rp_id", rewardObj);
spQuery.find()
	.then(function(mySP){
		if(typeof mySP != 'undefined'){			
			if(mySP.length == 0){
				var shopper_point = new shopper_points();
				shopper_point.set("sp_s_id", shopperObj);
				shopper_point.set("sp_rp_id", rewardObj);
				shopper_point.save({
	 				success: function(){
		 				response.success("Success!");
	 				},
	 				error: function(error){
		 				response.error(error);
	 				}
	 			});			
	 				
	 		}else{
				response.error("You have already availed this promo.")
			}
		
		}else{
			response.error("Invalid shopper_points query.");
		}		
	}); 
});



//query for valid rewards with prizes

Parse.Cloud.define("get_rewards", function(request, response) {

Parse.Cloud.useMasterKey();
var shopper_id = request.params.shopper_id;	
var shopperObj = {"__type":"Pointer","className":"shoppers","objectId":shopper_id};

//query shopper_redemption
var shopper_redemptions =  Parse.Object.extend("shopper_redemption");
var srQuery = new Parse.Query(shopper_redemptions);
srQuery.equalTo("sr_s_id", shopperObj);
srQuery.include("sr_p_id.p_r_id");
srQuery.find()
	.then(function(exp){
	
		//var srpid = exp[0].get("sr_p_id");
		var prid = new Array();
		
		
		for(var x=0; x<exp.length;x++){
			prid[x] = exp[x].get("sr_p_id").get("p_r_id").id;
			
		}
		
		//rewards query with date validation
		var rewards = Parse.Object.extend("rewards");
		var rwQuery = new Parse.Query(rewards);
		var d = new Date();
		var thisDay = new Date(d.getTime());
		
		rwQuery.greaterThanOrEqualTo("r_to", thisDay);
		rwQuery.lessThanOrEqualTo("r_from", thisDay);
		rwQuery.notContainedIn("objectId", prid);
		
		rwQuery.find()
			.then(function(ValidRewards){
				
				
				if(typeof ValidRewards != 'undefined'){
					if(ValidRewards.length>0){
						
						var pr = new Array();
						for(var y = 0; y < ValidRewards.length; y++){
							pr[y] = {"__type":"Pointer","className":"rewards","objectId":ValidRewards[y].id};
													
						}
						//response.success(pr);
						
						var prizes = Parse.Object.extend("prizes");
						var pQuery = new Parse.Query(prizes);
						pQuery.include("p_r_id");
						pQuery.containedIn("p_r_id",pr);
						pQuery.find()
							.then(function(myPrizes){
								response.success(myPrizes);
							});
						
												
						
					}else{
						response.error("No Available Rewards.");
					}
				}else{
					response.error("No available Rewards.");
				}
				
			});
		//end rewards query
		
		
	});

});


