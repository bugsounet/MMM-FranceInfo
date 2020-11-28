/* Magic Mirror
 * Module: FranceInfo
 *
 * By @bugsounet -- Dupont Cédric <bugsounet@bugsounet.fr>
 * MIT Licensed.
 */
const NodeHelper = require("node_helper")
var log = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function () {
    console.log("[FRINFO] MMM-FranceInfo Version:", require('./package.json').version)
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "CONFIG":
        this.config = payload
        if (this.config.debug) log = (...args) => { console.log("[FRINFO]", ...args) }
        log("Config:" , this.config)
        this.initialize()
        break
    }
  },

  initialize: function () {
    console.log("[FRINFO] MMM-FranceInfo est maintenant initialisé !")
    this.sendSocketNotification("INITIALIZED")
  },
  
  getInfos: function () {
   // fetch infos 
  },

  /** ***** **/
  /** Tools **/
  /** ***** **/

  /** convert h m s to ms **/
  getUpdateTime: function(intervalString) {
   let regexString = new RegExp("^\\d+[smhd]{1}$")
   let updateIntervalMillisecond = 0

   if (regexString.test(intervalString)){
     let regexInteger = "^\\d+"
     let integer = intervalString.match(regexInteger)
     let regexLetter = "[smhd]{1}$"
     let letter = intervalString.match(regexLetter)

     let millisecondsMultiplier = 1000
      switch (String(letter)) {
        case "s":
          millisecondsMultiplier = 1000
          break
        case "m":
          millisecondsMultiplier = 1000 * 60
          break
        case "h":
          millisecondsMultiplier = 1000 * 60 * 60
          break
        case "d":
          millisecondsMultiplier = 1000 * 60 * 60 * 24
          break
      }
      // convert the string into seconds
      updateIntervalMillisecond = millisecondsMultiplier * integer
    } else {
      updateIntervalMillisecond = 1000 * 60 * 60 * 24
    }
    return updateIntervalMillisecond
  },

});
