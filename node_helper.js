/* Magic Mirror
 * Module: FranceInfo
 *
 * By @bugsounet -- Dupont Cédric <bugsounet@bugsounet.fr>
 * MIT Licensed.
 */

const NodeHelper = require("node_helper")
const FeedMe = require("feedme")
const request = require("request")
var log = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function () {
    console.log("[FRINFO] MMM-FranceInfo Version:", require('./package.json').version)
    this.RSS= []
    this.flux= [
      {
        from: "Titres",
        url: "https://www.francetvinfo.fr/titres.rss"
      },
      {
        from: "Diaporamas",
        url: "https://www.francetvinfo.fr/images/slideshows.rss"
      },
      {
        from: "Vidéos",
        url : "https://www.francetvinfo.fr/images/videos.rss"
      },
      {
        from: "France",
        url : "https://www.francetvinfo.fr/france.rss"
      },
    ]
    this.error = false
  },

  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "CONFIG":
        this.config = payload
        if (this.config.debug) log = (...args) => { console.log("[FRINFO]", ...args) }
        log("Config:" , this.config)
        this.checkConfig()
        if (!this.error) this.initialize()
        break
    }
  },

  checkConfig() {
    this.config.flux.forEach(flux => {
      if (this.flux.map((e) => { return e.from } ).indexOf(flux) < 0) {
        console.log("[FRINFO] Erreur, Flux Rss inconnu:", flux)
        this.error = true
      }
    })
  },

  initialize: async function () {
    await this.getInfos()
    console.log("[FRINFO] MMM-FranceInfo est maintenant initialisé !")
    this.sendSocketNotification("INITIALIZED")
  },

  getInfos: async function () {
    // fetch all RSS infos
    await this.checkRSS()
    log("Titres trouvé:", this.RSS.length)
    this.sendSocketNotification("DATA", this.RSS)
  },

  checkRSS: async function() {
    /** @todo better **/
    var count = 0
    return new Promise(async (resolve, reject) => {
      this.flux.forEach(async (flux) => {
        if (this.config.flux.indexOf(flux.from) >= 0) {
          await this.getRssInfo(flux.from, flux.url)
          count++
        }
        if (count == this.flux.length) resolve()
      })
    })
  },

  getRssInfo: function (from, url) {
    return new Promise((resolve, reject) => {
      const rss = new FeedMe()
      const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
      const opts = {
        headers: {
          "User-Agent": "Mozilla/5.0 (Node.js " + nodeVersion + ") MMM-FranceInfo " + require('./package.json').version + " (https://github.com/bugsounet/MMM-FranceInfo)",
          "Cache-Control": "max-age=0, no-cache, no-store, must-revalidate",
          Pragma: "no-cache"
        },
        encoding: null
      };
      log ("Fetch Rss infos from:", url)

      request(url, opts)
        .on("error", error => {
          log("error!", error)
        })
        .pipe(rss)

      rss.on("item", item => {
        this.RSS.push({
          title: item.title,
          description: item.description,
          pubdate: item.pubdate,
          image: item.enclosure.url,
          url: item.link,
          from: from
        })
      })
      rss.on("end", () => {
        log("fetch done for:", url)
        resolve()
      })
      rss.on("error", error => {
        log("fetch error", error)
        resolve()
      })
    })
  },

  /** ***** **/
  /** Tools **/
  /** ***** **/

  /** convert h m s to ms **/
  getUpdateTime: function(intervalString) {
    let regexString = new RegExp("^\\d+[smhd]{1}$")
    let updateIntervalMillisecond = 0

    if (regexString.test(intervalString)) {
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
