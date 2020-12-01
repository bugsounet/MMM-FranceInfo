/* Magic Mirror
 * Module: FranceInfo
 *
 * By @bugsounet -- Dupont Cédric <bugsounet@bugsounet.fr>
 * MIT Licensed.
 */

Module.register("MMM-FranceInfo", {
  /** config par default **/
  defaults: {
    debug: false,
    update: "15m",
    speed: "15s",
    maxItems: 100,
    flux: [
      "Les Titres",
      //"Vidéos",
      //"Diaporamas",
      //"France",
      //"Politique",
      //"Société",
      //"Faits divers",
      //"Justice",
      "Monde",
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
      //"Internet"
    ]

  },

  /** demarrage et initialisation **/
  start: function () {
    this.item = 0
    this.RSS = []
    this.update = null
    this.fade = null
    this.config.speed = this.getUpdateTime(this.config.speed)
    console.log("[FRINFO] Démarrage de MMM-FranceInfo")
  },

  /** notification envoyer depuis d'autres modules **/
  notificationReceived: function (notification, payload, sender) {
    switch (notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("CONFIG", this.config)
        break
    }
  },

  /** notification reçu depuis le node_helper **/
  socketNotificationReceived: function (notification, payload) {
    switch (notification) {
      case "INITIALIZED":
        console.log("[FRINFO] Prêt!")
        this.item = 0
        this.displayChoice()
        break
      case "DATA":
        console.log("[FRINFO] Data", payload)
        this.RSS= payload
        this.item = -1
        break
    }
  },

  /** choisi l'article suivant selon le delai d'update **/
  DisplayNext: function () {
    if (this.config.speed < 10*1000) this.config.speed = 10*1000
    clearInterval(this.update)
    this.update = setInterval(() => {
      this.item++
      this.displayChoice()
    }, this.config.speed)
  },

  /** affiche l'article **/
  displayChoice: function () {
    if (this.RSS.length == 0) {
      this.item = -1
      return this.DisplayNext()
    }
    if (this.item > this.RSS.length-1) this.item = 0

    var title = document.getElementById("FRANCEINFO_TITLE")
    var image = document.getElementById("FRANCEINFO_IMAGE")
    var description = document.getElementById("FRANCEINFO_DESCRIPTION")
    var source = document.getElementById("FRANCEINFO_SOURCE")
    var published = document.getElementById("FRANCEINFO_TIME")
    var contener = document.getElementById("FRANCEINFO_CONTENER")

    contener.classList.add("hideArticle")
    contener.classList.remove("showArticle")

    source.classList.remove("start")
    source.classList.add("stop")

    description.classList.add("hideArticle")
    description.classList.remove("showArticle")

    this.fade = setTimeout(()=>{
      if (this.RSS[this.item]) {
        title.innerHTML = this.RSS[this.item].title
        image.src = this.RSS[this.item].image
        image.addEventListener('error', () => { image.src = this.file("franceinfo.png") }, false)
        description.innerHTML = this.RSS[this.item].description
        source.textContent = this.RSS[this.item].from + (this.config.debug ? " [" + this.item + "/" + this.RSS.length + "]" : "")
        published.textContent = moment(new Date(this.RSS[this.item].pubdate)).fromNow()
        contener.classList.remove("hideArticle")
        contener.classList.add("showArticle")
        source.classList.remove("stop")
        source.classList.add("start")
        description.classList.remove("hideArticle")
        description.classList.add("showArticle")
        this.DisplayNext()
      } else {
        console.log("[FRINFO] RSS error")
        this.item = 0
        this.displayChoice()
      }
    }, 1200)
  },

 /** Cree la structure du dom **/
  getDom: function () {
    var wrapper= document.createElement("div")

    var contener= document.createElement("div")
    contener.id= "FRANCEINFO_CONTENER"
    contener.classList.add("hideArticle")

    var article= document.createElement("div")
    article.id= "FRANCEINFO_ARTICLE"

    var logo = document.createElement("div")
    logo.id = "FRANCEINFO_LOGO"
    article.appendChild(logo)
    partA = document.createElement("div")
    partA.id ="FRANCEINFO_LOGO_PARTA"
    partA.textContent = "franceinfo"
    logo.appendChild(partA)
    partB = document.createElement("div")
    partB.id ="FRANCEINFO_LOGO_PARTB"
    partB.textContent = ":"
    logo.appendChild(partB)

    var title= document.createElement("div")
    title.id= "FRANCEINFO_TITLE"
    contener.appendChild(article)
    article.appendChild(title)

    var content= document.createElement("div")
    content.id= "FRANCEINFO_CONTENT"
    var image = document.createElement("img")
    image.id = "FRANCEINFO_IMAGE"
    var source = document.createElement("div")
    source.id = "FRANCEINFO_SOURCE"
    var description= document.createElement("div")
    description.id = "FRANCEINFO_DESCRIPTION"
    contener.appendChild(content)
    content.appendChild(image)
    content.appendChild(source)
    content.appendChild(description)

    var footer= document.createElement("div")
    footer.id = "FRANCEINFO_FOOTER"
    var published = document.createElement("div")
    published.id = "FRANCEINFO_TIME"
    contener.appendChild(footer)
    footer.appendChild(published)

    wrapper.appendChild(contener)

    return wrapper
  },

  /** page de style **/
  getStyles: function() {
    return ["MMM-FranceInfo.css"]
  },

  /** Suspend le module completement **/
  suspend: function () {
    clearInterval(this.update)
    clearTimeout(this.fade)
    var contener = document.getElementById("FRANCEINFO_CONTENER")
    contener.classList.add("hideArticle")
    contener.classList.remove("showArticle")
    this.sendSocketNotification("SUSPEND")
    console.log("MMM-FranceInfo is suspended.")
  },

  /** resume le module **/
  resume: function () {
    console.log("MMM-FranceInfo is resumed.")
    this.displayChoice()
    setTimeout (() => {this.sendSocketNotification("RESUME")}, 3000)
  },

  /** ***** **/
  /** Tools **/
  /** ***** **/

  /** convert h m s to ms
   ** str sample => "1d 15h 30s"
   **/
  getUpdateTime: function(str) {
    let ms = 0, time, type, value
    let time_list = ('' + str).split(' ').filter(v => v != '' && /^(\d{1,}\.)?\d{1,}([wdhms])?$/i.test(v))

    for(let i = 0, len = time_list.length; i < len; i++){
      time = time_list[i]
      type = time.match(/[wdhms]$/i)

      if(type){
        value = Number(time.replace(type[0], ''))

        switch(type[0].toLowerCase()){
          case 'w':
            ms += value * 604800000
            break
          case 'd':
            ms += value * 86400000
            break
          case 'h':
            ms += value * 3600000
            break
          case 'm':
            ms += value * 60000
            break
          case 's':
            ms += value * 1000
          break
        }
      } else if(!isNaN(parseFloat(time)) && isFinite(time)){
        ms += parseFloat(time)
      }
    }
    return ms
  }

});
