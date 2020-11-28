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
  }

});
