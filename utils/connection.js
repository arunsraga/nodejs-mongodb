/*globals  require, exports */

const mongoose = require("mongoose"),
	config     = require("../config/config.js"), 
	Dish       = require("../models/dish.js"),
	utils      = require("../utils/utils.js");

// Function to establish connection for the Database
exports.connectToDb = function(callback) {
	// If the connection is already established, Then don't create one more connection
	if (mongoose.connection.readyState) {
		callback(undefined, {msg: "connected", code: 200});
		return;
	}
	// Establish the DB connection
	mongoose.connect(config.dbPath);
	// Event for successfully connecting database
	mongoose.connection.on("connected", function () {
		callback(undefined, {msg: "connected", code: 200});
	});
	// Event when there is an error connecting for database
	mongoose.connection.on("error",function (err) {
		utils.log("[connectToDb] Error connecting to DB " + err);
		callback(err);
	});
};

// Function to get the information of a matched document
exports.getDish = function (dish, callback) {
	// Fetch the dish inforation
	Dish.find({name: dish}, function (err, success) {
		if (err) {
			utils.log("[getDoc] Error fetching the doc " + err);
			callback(err);
			return;
		}
		callback(undefined, success);
	});
};

// Function to create / update the Document for a dish
exports.createDish = function(dishName, dishInfo, callback) {
	let dish;
	Dish.find({name: dishName}, function (err, success) {
		if (err) {
			utils.log("[getDoc] Error fetching the doc " + err);
			callback(err);
			return;
		}
		// If the dish is available, Then update the existing document
		if (success.length > 0) {
			dish = success[0];
			dish.save(function(err, success) {
				if (err) {
					utils.log("[createDish] Error updating the doc " + err);
					callback(err);
					return;
				}
				callback(undefined, success);
			});
			return;
		}
		// If the dish is not available then create new document for Dish 
		let date = new Date().toISOString();
		// To create the model for new Dish
		dish = Dish({
			"name"  : dishName,
			"veg"   : dishInfo.veg,
			"price" : dishInfo.price,
			"user"  : {
				"createdBy"      : dishInfo.user.createdBy,
				"lastModifiedBy" : dishInfo.user.lastModifiedBy
			},
			"date"  : {
				"creationDate"     : date,
				"lastModifiedDate" : date
			}
		});
		// Saving the Dish model
		dish.save(function (err, success) {
			if (err) {
				utils.log("[createDish] Error creating the doc " + err);
				callback(err);
				return;
			}
			callback(undefined, success);
		});
	});
};

exports.deleteDish = function (dish, callback) {
	Dish.findOneAndRemove({name: dish}, function (err, success) {
		if (err) {
			utils.log("[deleteDoc] Error deleting the doc " + err);
			callback(err);
			return;
		}
		callback(undefined, success);
	});
};