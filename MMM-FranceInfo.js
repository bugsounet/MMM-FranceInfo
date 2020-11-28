/* Magic Mirror
 * Module: FranceInfo
 *
 * By @bugsounet -- Dupont Cédric <bugsounet@bugsounet.fr>
 * MIT Licensed.
 */

Module.register("MMM-FranceInfo", {
  defaults: {
    debug: false,
    flux: [ "Titres" ]
  },

  start: function () {
    console.log("[FRINFO] Démarrage de MMM-FranceInfo")
  },

  notificationReceived: function (notification, payload, sender) {
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("CONFIG", this.config)
        break
    }
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "INITIALIZED":
        console.log("[FRINFO] Prêt!")
        break
    }
  },

  getDom: function () {
    var wrapper = document.createElement("div")
    return wrapper
  },

/*
  suspend: function () {
    console.log("suspended")
  },
  resume: function () {
    console.log("resumed")
  },
*/

});
