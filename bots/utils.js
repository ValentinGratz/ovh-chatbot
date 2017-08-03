"use strict";

const User = require("../models/users.model");
const WebAuth = require("../models/webAuth.model");
const config = require("../config/config-loader").load();
const ovh = require("ovh");
const Bluebird = require("bluebird");
const dns = require("dns");
const URL = require("url");
const responsesCst = require("../constants/responses").FR;
const request = require("request");

// custom OvhClient for the web users;
class OvhWebClient {
  constructor (cookie, userAgent) {
    this.options = {
      json: true,
      encoding: "utf8",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Cookie: `cookieAccepted=true; SESSION=${cookie}`,
        "User-Agent": userAgent,
        Referer: "https://www.ovh.com/manager/web/",
        Pragma: "no-cache",
        "Cache-Control": "no-cache"
      }
    };
  }

  requestPromised (method, path, data) {
    return new Bluebird((resolve, reject) => {
      const opt = {
        method,
        uri: config.ovh.urlBasePath + path,
        qs: method === "GET" ? data : {},
        body: method !== "GET" ? data : {}
      };
      return request(Object.assign(opt, this.options), (err, resp, body) => {
        if (err || resp.statusCode >= 400) {
          return reject({ statusCode: resp.statusCode, data: body });
        }
        return resolve(body);
      });
    });
  }
}

module.exports = {
  getOvhClient: (senderId) =>
    User.findOne({ senderId }).exec().then((userInfos) => {
      if (!userInfos) {
        // check if web user and if so return the custom "ovhClientModule";
        return WebAuth.findOne({ _nichandle: senderId }).exec().then((webAuth) => {
          if (!webAuth) {
            return Bluebird.reject({ statusCode: 403, message: responsesCst.signInFirst });
          }

          return new OvhWebClient(webAuth.cookie, webAuth.userAgent);
        });
      }

      return ovh({
        appKey: config.ovh.appKey,
        appSecret: config.ovh.appSecret,
        consumerKey: userInfos.consumerKey
      });
    }),

  dig (hostnameRaw) {
    const hostname = hostnameRaw.match(/https?:\/\//) ? URL.parse(hostnameRaw).hostname : hostnameRaw;

    return new Bluebird((resolve, reject) => {
      dns.lookup(hostname, (err, address) => {
        if (err) {
          return reject(err);
        }

        return resolve(address);
      });
    });
  }
};
