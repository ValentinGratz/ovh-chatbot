"use strict";

const messenger = require("../platforms/messenger/messenger");
const bot = require("../bots/common")();
const config = require("../config/config-loader").load();
const apiai = require("../utils/apiai");
const Bluebird = require("bluebird");
const { Button, ButtonsMessage, BUTTON_TYPE, createFeedback } = require("../platforms/generics");
const ovh = require("../utils/ovh");
const translator = require("../utils/translator");
const logger = require("../providers/logging/logger");

function getWebhook (req, res) {
  if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === config.facebook.validationToken) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    logger.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
}

module.exports = () => {
  function postWebhook (req, res) {
    const data = req.body;

    // Make sure this is a page subscription
    if (data.object === "page") {
      // Iterate over each entry
      // There may be multiple if batched
      data.entry.forEach((pageEntry) => {

        // Iterate over each messaging event
        pageEntry.messaging.forEach((messagingEvent) => {
          if (messagingEvent.message) {
            // checks for quick_replies => use postback handler
            if (messagingEvent.message.quick_reply) {
              receivedPostback(res, Object.assign(messagingEvent, { postback: messagingEvent.message.quick_reply }));
            } else {
              receivedMessage(res, messagingEvent);
            }
          } else if (messagingEvent.postback) {
            receivedPostback(res, messagingEvent);
          }
        });
      });

      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know you"ve
      // successfully received the callback. Otherwise, the request will time out.
      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  }

  /*
   * Message Event
   *
   * This event is called when a message is sent to your page. The "message"
   * object format can vary depending on the kind of message that was received.
   * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
   *
   */
  function receivedMessage (res, event) {
    const senderID = event.sender.id;
    const message = event.message;

    const isEcho = message.is_echo;
    const messageText = message.text;

    if (isEcho) {
      return;
    }

    if (messageText) {
      getSenderLocale(senderID).then((local) => sendCustomMessage(res, senderID, messageText, local));
    }
  }

  function getSenderLocale (senderId) {
    return ovh.getOvhClient(senderId)
      .then((client) => client.requestPromised("GET", "/me"))
      .then((meInfos) => meInfos.language)
      .catch(() => messenger.getUserProfile(senderId).then((body) => JSON.parse(body).locale.replace("_", "-")))
      .catch((err) => {
        logger.error(err);
        return "en-US";
      });
  }

  function receivedPostback (res, event) {
    let needFeedback = false;
    const senderId = event.sender.id;
    const payload = event.postback.payload;
    let locale;
    getSenderLocale(senderId)
      .then((localeLocal) => {
        locale = localeLocal;
        return bot
          .ask("postback", senderId, payload, null, null, res, locale)
          .then((answer) => {
            needFeedback = answer.feedback || needFeedback;
            return sendResponses(res, senderId, answer.responses);
          });
      })
      .then(() => {
        if (needFeedback) {
          return sendFeedback(res, senderId, payload, "message", locale);
        }
        return null;
      }) // Ask if it was useful
      .catch((err) => {
        res.logger.error(err);
        messenger.send(senderId, `Oups ! ${err.message}`);
      });
  }

  function sendCustomMessage (res, senderId, message, locale) {
    let needFeedback = false;

    apiai
      .textRequestAsync(message, {
        sessionId: senderId
      }, locale)
      .then((resp) => {
        if (resp.status && resp.status.code === 200 && resp.result) {
          if (resp.result.action === "connection" || resp.result.action === "welcome") {
            const accountLinkButton = new Button(BUTTON_TYPE.ACCOUNT_LINKING, `${config.server.url}${config.server.basePath}/authorize?state=${senderId}-facebook_messenger`, "");
            return sendResponse(res, senderId, new ButtonsMessage(translator("welcome", locale), [accountLinkButton]));
          }

          if (resp.result.fulfillment && resp.result.fulfillment.speech && Array.isArray(resp.result.fulfillment.messages) && resp.result.fulfillment.messages.length) {
            const smalltalk = resp.result.action && resp.result.action.indexOf("smalltalk") !== -1;
            let quickResponses = resp.result.fulfillment.messages;

            if (smalltalk && Math.floor(Math.random() * 2)) {
              // random to change response from original smalltalk to our custom sentence
              quickResponses = [{ speech: resp.result.fulfillment.speech, type: 0 }];
            }

            return sendQuickResponses(res, senderId, quickResponses).then(() => sendFeedback(res, senderId, resp.result.action, message, locale)); // Ask if it was useful
          }

          return bot
            .ask("message", senderId, message, resp.result.action, resp.result.parameters, res, locale)
            .then((answer) => {
              needFeedback = answer.feedback || needFeedback;

              return sendResponses(res, senderId, answer.responses);
            })
            .then(() => {
              if (needFeedback) {
                sendFeedback(res, senderId, resp.result.action, message, locale);
              }
            }) // Ask if it was useful
            .catch((err) => {
              res.logger.error(err);
              return messenger.send(senderId, `Oups ! ${err.message}`);
            });
        }
        return null;
      })
      .catch(res.logger.error);
  }

  function sendFeedback (res, senderId, intent, rawMessage, locale) {
    return sendResponse(res, senderId, createFeedback(intent, rawMessage, locale));
  }

  function sendQuickResponses (res, senderId, responses) {
    return Bluebird.mapSeries(responses, (response) => {
      switch (response.type) {
      default: {
        const textResponse = response.speech.replace(/<(.*)\|+(.*)>/, "$1");
        return sendResponse(res, senderId, textResponse);
      }
      }
    });
  }

  function sendResponses (res, senderId, responses) {
    return Bluebird.mapSeries(responses, (response) =>
      Bluebird.resolve(response)
        .then((resp) => Array.isArray(resp) ? sendResponses(res, senderId, resp) : sendResponse(res, senderId, resp)));
  }

  function sendResponse (res, senderId, response) {
    return messenger.send(senderId, response);
  }

  return {
    getWebhook,
    postWebhook
  };
};
