/* Magic Mirror
 * Module: FranceInfo
 *
 * By @bugsounet -- Dupont Cédric <bugsounet@bugsounet.fr>
 * MIT Licensed.
 */

Module.register("MMM-FranceInfo", {
  defaults: {
    debug: false,
    dev: true,
    update: "15m",
    maxItems: 3,
    flux: [
      "Titres",
      //"Vidéos",
      //"Diaporamas",
      //"France",
      //"Politique",
      //"Société",
      //"Faits divers",
      //"Justice",
      //"Monde",
      //"Afrique",
      //"Amériques",
      //"Europe",
      //"Proche Orient",
      //"Environnement",
      //"Tendances",
      //"Entreprises",
      //"Marchés",
      //"Immobilier",
      //"Sports",
      //"Foot",
      //"Rugby",
      //"F1",
      //"Découvertes",
      //"Sciences",
      //"Santé",
      //"Animaux",
      //"Bizarre",
      //"Buzz+",
      //"Médias",
      //"Cinéma",
      //"Musique",
      "Internet"
    ]

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
      case "DATA":
        console.log("[FRINFO] Data", payload)
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
