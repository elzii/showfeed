var APP = (function () {

  var app = {}


  /**
   * Module Properties
   *
   * config
   * data
   * $el
   * 
   */
  app = {

    // Config
    config : {
      environment : window.location.href.match(/(localhost)/g) ? 'development' : 'production',
      debug : window.location.href.match(/(localhost)/g) ? true : false,
      debug_plugins : window.location.href.match(/(localhost)/g) ? true : false,
      debug_console: false
    },


    // Elements
    $el : {
      body : $('body'),

      shows : $('#shows')
      
    },

    settings : {

    },

    dir : {
      js : window.location.href + 'js/',
      css : window.location.href + 'css/',
      images : window.location.href + 'images/',
    },

    feeds : {
      showrss_all : 'http://showrss.info/rss.php?user_id=207854&hd=0&proper=null'
    }


  };



  /**
   * Init
   */
  app.init = function () {
    
    this.showFeed.init()
    

  }





  /**
   * Show Feed
   */
  app.showFeed = {

        
    init: function() {

      this.renderShowFeed( app.feeds.showrss_all )

    },

    /**
     * getShowFeed
     *
     * Use curl proxy to get showrss feed, parse XML to json and return it
     *
     * @param {String} url
     * @param {Function} callback
     */
    getShowFeed: function(url, callback) {

      var request;

      request = $.ajax({
        url: 'ajax.php',
        type: 'POST',
        data : {
          action : 'curl',
          url : url,
          convertXML : true
        }
      })
      .done(function (data) {
        
        var json  = $.parseJSON(data),
            items = json.channel.item

        callback(items)

      })
      .fail(function (data) {
        console.log("error", data);

        callback(data)
      })
      
    },

    /**
     * renderShowFeed
     *
     * Read the object containing the show list returning from getShowFeed
     * 
     * @param  {String} url
     */
    renderShowFeed: function(url) {

      // Get the feed
      this.getShowFeed( url, function (items) {

        var _this = app.showFeed;
        
        $.each(items, function (i, show) {

          // Get cleaned up torrent info
          var show_info = _this.filterShowTorrentInfo( show.link, show.title )   

          // Format date
          var release_date = formatPubDate( show.pubDate )
          var release_day_of_week = formatPubDate( show.pubDate, 'day' )

          
          var cover_image_src = app.dir.images + show_info.slug + '.png';

          app.$el.shows.append('\
            <div class="show col-md-3"> \
              <div class="show__info"> \
                <h4 class="show__title">' + show_info.title + ' ' + show_info.sxe + '</h4> \
                <div class="show__meta"><b>' + release_day_of_week + '</b> - ' + release_date + '</div> \
                <a href="' + show.link + '"><i class="show__play fa fa-play-circle"></i></a> \
              </div> \
              <div class="show__cover-photo" style="background-image:url(\'' + cover_image_src + '\')"></div> \
            </div> \
          ')

          console.log('Show Torrent Info: ', show_info)
        })

      })

    },



    /**
     * filterShowTorrentInfo
     *
     * Use regex on torrent file name to return some cleaned up strings
     */
    filterShowTorrentInfo: function( show_link, show_title ) {
 
      var torrent_info = {};

      if ( show_link ) {
        // Get torrent filename
        var torrent_str = getTorrentFilenameFromMagnetURI( show_link )

        // Nicename
        var show_nicename       = torrent_str.match(/^(\[.+\])?(.+[^a-z0-9])(?=S\d)/)[0]
            show_nicename       = show_nicename.replace(/\+/g, ' ').replace(' US', '').trim()
            show_nicename       = show_nicename.replace(/\d{4}$/g, '').trim()
            torrent_info.title  = show_nicename.replace(/\d{4}$/g, '').trim()

        // Slug
        torrent_info.slug       = generateSlug(show_nicename)

        // Season
        var show_season         = torrent_str.match(/S(\d{1,2})/)[0]
           torrent_info.season  = show_season.replace('S', '')

        // Episode
        var show_episode        = torrent_str.match(/E(\d{1,2})/)[0]
           torrent_info.episode = show_episode.replace('E', '')
      } else {
        console.log('ERROR: show_link not passed')
      }

      // Episode Name
      if ( show_title ) {
        var show_sxe = show_title.match(/\d{1,2}x\d{1,2}/)
            show_sxe = show_sxe[0]

        // SxE
        torrent_info.sxe = show_sxe

        // Episode Name
        var show_episode_name = show_title.substring( show_title.indexOf(show_sxe) )
            show_episode_name = show_episode_name.replace(show_sxe, '')
            show_episode_name = show_episode_name.replace(/[-][\d].[\s]/, '').trim()

        torrent_info.episode_name = show_episode_name

       } else {
         console.log('ERROR: show_title not passed')
       }
       

       return torrent_info;

    },


  },


  /**
   * Show List
   *
   * Manually generated (copy/paste) from showrss.info acct
   */
  app.showList = [
    "Archer",
    "Bob's Burgers",
    "Community",
    "Derek",
    "Drugs, Inc.",
    "Game of Thrones",
    "Girls",
    "Hannibal",
    "House of Cards",
    "Legit",
    "Mad Men",
    "Marvel's Agents of S.H.E.I.L.D",
    "Parenthood",
    "Parks and Recreation",
    "QI",
    "Rick and Morty",
    "Shameless",
    "Sherlock",
    "South Park",
    "The League",
    "The Simpsons",
    "Vice",
    "Wilfred",
    "Workaholics"
  ]



  /**
   * Regular Expressions
   */
  app.showRegex = {
    first_word : /(^[A-Z])\w+/g,
    detail_groups : /(.*?)\.S?(\d{1,2})E?(\d{2})\.(.*)/g
  }



  








  /**
   * searchStringInArray
   */
  function searchStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
  }


  /**
   * substringBetween
   */
  function substringBetween( string, start, end ) {
    return string.substring( show.link.lastIndexOf(start)+1, show.link.lastIndexOf(end) );
  }

  /**
   * replaceAllInString
   */
   function replaceAllInString(find, replace, str) {
     return str.replace(new RegExp(find, 'g'), replace);
   }


   /**
    * getTorrentFilenameFromMagnetURI
    */
  function getTorrentFilenameFromMagnetURI( magnet_link ) {

    var str_arr = magnet_link.split(/[&]/)
        str_arr = str_arr[1]

    return str_arr.replace('dn=', '')

  }

  /**
   * Format Published Date
   */
  function formatPubDate( date_str, format ) {
    
    var format = ( format !== undefined ) ? format : 'full'

    var date = new Date(date_str)

    if ( format == 'full' ) {

      return date.toLocaleDateString()

    } else if ( format == 'day' ) {
      
      var day = date.getDay()
      return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][day]

    } else {
      return date
    }
  }

  /**
   * Format Published Date to Day of Week
   */
  function pubDateToDayOfWeek( date_str ) {
    
    var date = new Date(date_str)

    return date.getDay()
  }

  /**
  * Converts a day number to a string.
  *
  * @method dayOfWeekAsString
  * @param {number} day_index
  * @return {Number} Returns day as number
  */
  function dayOfWeekAsString(day_index) {
    return ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][day_index];
  }

  /**
   * Generate Slug
   *
   * convert to lowercase, remove dashes and pluses, replace spaces with dashes
   * remove everything but alphanumeric characters and dashes
   */
  function generateSlug (value) {
    return value.toLowerCase().replace(/-+/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  };





  /**
   * DOCUMENT READY
   * -------------------------------------------------------------------
   *
   */
  document.addEventListener('DOMContentLoaded', function (event) {

    app.init()
  })



  return app;
}());