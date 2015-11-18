var mongoose = require('mongoose');

module.exports = function(dbname){
	if(dbname == undefined){
		return {};
	}

	mongoose.connect('mongodb://localhost/' + dbname);
	var schema = mongoose.Schema({id: String,message: String,postedDate: Number,title:String});
	var Comment = mongoose.model('Comment',schema);
	return {
		insert: function(id,message,postedDate,title,on_success_callback){
			var c = new Comment({id:id,message:message,postedDate:new Date(postedDate).getTime(),title:title});
			Comment.find({id:id},function(err,result){
				if(!result.length){
					c.save(function(err,userObj){
						if(err){
							console.log("error saving: " + c.id);
						} else {
							if(on_success_callback != undefined){
								on_success_callback(userObj);
							}
						}

					})
				} else {
					on_success_callback(result[0]);
				}
			});
			
		},
		find: function(options,callback){ // callback(err,comment)
			Comment.find(options,callback);
		},
		close: function(){
			mongoose.disconnect();
		}

	}
	
}