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
      {
        from: "Politique",
        url: "https://www.francetvinfo.fr/politique.rss"
      },
      {
        from: "Société",
        url: "https://www.francetvinfo.fr/societe.rss"
      },
      {
        from: "Faits divers",
        url: "https://www.francetvinfo.fr/faits-divers.rss"
      },
      {
        from: "Justice",
        url: "https://www.francetvinfo.fr/justice.rss"
      },
      {
        from: "Monde",
        url: "https://www.francetvinfo.fr/monde.rss"
      },
      {
        from: "Afrique",
        url: "https://www.francetvinfo.fr/afrique.rss"
      },
      {
        from: "Amériques",
        url: "https://www.francetvinfo.fr/ameriques.rss"
      },
      {
        from: "Europe",
        url: "https://www.francetvinfo.fr/europe.rss"
      },
      {
        from: "Proche Orient",
        url: "https://www.francetvinfo.fr/proche-orient.rss"
      },
      {
        from: "Environnement",
        url: "https://www.francetvinfo.fr/environnement.rss"
      },
      {
        from: "Tendances",
        url: "https://www.francetvinfo.fr/tendances.rss"
      },
      {
        from: "Entreprises",
        url: "https://www.francetvinfo.fr/entreprises.rss"
      },
      {
        from: "Marchés",
        url: "https://www.francetvinfo.fr/marches.rss"
      },
      {
        from: "Immobilier",
        url: "https://www.francetvinfo.fr/immobilier.rss"
      },
      {
        from: "Sports",
        url: "https://www.francetvinfo.fr/sports.rss"
      },
      {
        from: "Foot",
        url: "https://www.francetvinfo.fr/foot.rss"
      },
      {
        from: "Rugby",
        url: "https://www.francetvinfo.fr/rugby.rss"
      },
      {
        from: "F1",
        url: "https://www.francetvinfo.fr/f1.rss"
      },
      {
        from: "Découvertes",
        url: "https://www.francetvinfo.fr/decouverte.rss"
      },
      {
        from: "Sciences",
        url: "https://www.francetvinfo.fr/sciences.rss"
      },
      {
        from: "Santé",
        url: "https://www.francetvinfo.fr/sante.rss"
      },
      {
        from: "Animaux",
        url: "https://www.francetvinfo.fr/animaux.rss"
      },
      {
        from: "Bizarre",
        url: "https://www.francetvinfo.fr/bizarre.rss"
      },
      {
        from: "Buzz+",
        url: "https://www.francetvinfo.fr/culture.rss"
      },
      {
        from: "Médias",
        url: "https://www.francetvinfo.fr/medias.rss"
      },
      {
        from: "Cinéma",
        url: "https://www.francetvinfo.fr/cinema.rss"
      },
      {
        from: "Musique",
        url: "https://www.francetvinfo.fr/musique.rss"
      },
      {
        from: "Internet",
        url: "https://www.francetvinfo.fr/internet.rss"
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
    log("Flux RSS chargé: " + this.config.flux.length + "/" + this.flux.length)
    console.log("[FRINFO] MMM-FranceInfo est maintenant initialisé !")
    this.sendSocketNotification("INITIALIZED")
  },

  getInfos: async function () {
    // fetch all RSS infos
    await this.checkRSS()
    log("Titres trouvés:", this.RSS.length)

    // sort by date
    this.RSS.sort(function (a, b) {
      var dateA = new Date(a.pubdate);
      var dateB = new Date(b.pubdate);
      return dateB - dateA;
    })
    log("Titres classés par date: Done ✓")

    if (this.config.maxItems > 0) {
     this.RSS = this.RSS.slice(0, this.config.maxItems)
     log("Titres affichés:", this.RSS.length)
    }

    if (this.config.dev) log("DATA:", this.RSS)
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
        else count++
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
          "User-Agent": "Mozilla/5.0 (Node.js " + nodeVersion + ") MMM-FranceInfo v" + require('./package.json').version + " (https://github.com/bugsounet/MMM-FranceInfo)",
          "Cache-Control": "max-age=0, no-cache, no-store, must-revalidate", Pragma: "no-cache"
        },
        encoding: null
      };
      log ("Fetch Rss infos for:", from, "(", url, ")")

      request(url, opts)
        .on("error", error => {
          log("Error!", error)
        })
        .pipe(rss)

      rss.on("item", item => {
        this.RSS.push({
          title: item.title,
          description: item.description,
          pubdate: item.pubdate,
          image: item.enclosure && item.enclosure.url ? item.enclosure.url : null,
          url: item.link,
          from: from
        })
      })
      rss.on("end", () => {
        log("Fetch done for:", from)
        resolve()
      })
      rss.on("error", error => {
        log("Fetch error for url:", url, error)
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
