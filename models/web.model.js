"use strict";

const Bluebird = require("bluebird");
const mongoose = require("mongoose");

mongoose.Promise = Bluebird;

/**
 * Web Schema
 */
const ButtonSchema = new mongoose.Schema({
  type: String,
  value: String,
  text: String
});

const HistoryMessageSchema = new mongoose.Schema({
  message: {
    type: String
  },
  origin: {
    type: String
  },
  buttons: [ButtonSchema]
});

const WebSchema = new mongoose.Schema({
  nichandle: {
    type: String,
    required: true,
    unique: true
  },
  history: [HistoryMessageSchema]
});

/**
 * Methods
 */
WebSchema.method({});

/**
 * Statics
 */
WebSchema.statics = {
  get (nichandle) {
    return this.findOne({ nichandle }).exec().then((user) => {
      if (user) {
        return user;
      }
      const err = { message: "Web User not found", statusCode: 404 };
      return Bluebird.reject(err);
    });
  }
};

module.exports = mongoose.model("Web", WebSchema);
