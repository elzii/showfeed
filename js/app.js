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

    // URLs
    url : {
      site : window.location.href.match(/(localhost)/g) ? 'http://localhost/projects/showfeed/' : 'http://showfeed.io/'
    },

    // Elements
    $el : {
      body : $('body'),

      shows_header : $('#shows__header'),
      shows_container : $('#shows__container'),
      shows : $('#shows'),
      
      shows_upcoming : $('#shows__upcoming'),

      loader : $('#loader'),

      nav : {
        main : $('#nav--main'),
        upcoming : $('#nav--upcoming')
      },

      form : {
        create_feed : $('#form--create_feed'),
      },

      views : {
        index : $('#view--index'),
        feed : $('#view--feed'),
      }
    },

    settings : {

    },

    dir : {
      js : rootLocation() + 'js/',
      css : rootLocation() + 'css/',
      images : rootLocation() + 'images/',
    },

    feeds : {
      showrss_all : 'http://showrss.info/rss.php?user_id=207854&hd=0&proper=null',
      showrss_schedule : 'http://showrss.info/ical.php?user_id=207854&export=rss'
    }


  };



  /**
   * Init
   */
  app.init = function () {

    // routing
    this.routing.init()

    // plugin init & general event bindings
    this.plugins()
    this.events()
    this.forms.init()
    
  }



  /**
   * Plugins 
   */
  app.plugins = function() {

    // Routie
    if ( window.routie && window.routie !== undefined ) {
      if ( app.config.debug ) console.log('%cPLUGIN:', 'color:#8e2fb1', 'routie.js')
    }
  }


  /**
   * Event Listeners 
   */
  app.events = function() {

    // Dropdown toggle
    $(document).on('click', '.dropdown-toggle', function (event) {

      event.preventDefault()

      var $this     = $(this),
          targetID  = $this.data('target'),
          $dropdown = $this.find('.dropdown-menu')

      $(targetID).toggle().toggleClass('show')

    })

  }

  /**
   * Forms
   */
  app.forms = {

    init: function() {

      var _this = app.forms;

      _this.create_feed()
    },


    create_feed: function() {

      var $form = app.$el.form.create_feed;

      $form.on('submit', function (event) {

        event.preventDefault()

        var $this      = $(this),
            $submit    = $this.find('button[type=submit]'),
            feed_url   = $this.find('input[name=feed_url]').val(),
            $your_feed = $this.find('input[name=your_feed]');

            feed_url   = btoa( feed_url )

        // Toggle submit classes
        $submit
          .toggleClass('btn-primary btn-success')
          .attr('disabled', 'disabled')
          .text('Success')
          .blur()

        // Display new feed hash url
        $your_feed
          .show()
          .val( app.url.site + '#feed/' + feed_url )
          .parent()
          .addClass('has-success')
        
          

        if ( app.config.debug ) console.log('%cFORM:', 'color:#ec344a', 'create_feed' )
      })

    },


  }



  /**
   * Show Feed
   */
  app.showFeed = {

    debug : false,

    date_offset : -1,

    template : {
      grid : 'templates/_show-grid.html',
      list : 'templates/_show-list.html',
    },
        
    calendar : {
      today : [],
      weekly : {
        'mon' : [],
        'tue' : [],
        'wed' : [],
        'thu' : [],
        'fri' : [],
        'sat' : [],
        'sun' : []
      }
    },

    init: function() {

      var _this = app.showFeed;

      app.loader.show()

      // Render Show Feed
      this.renderShowFeed( {
        url             : app.feeds.showrss_all,
        template        : _this.template.list,
        sort_by_day     : true,
        container_class : 'container'
      }, function (data) {
        // callback 
        
        app.$el.shows_container.show()
        app.loader.hide()
        
        if ( app.config.debug ) console.log('%cCALLBACK:', 'color:#66d9ef', 'renderShowFeed()' )

      })

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
    renderShowFeed: function(options, callback) {

      var _this           = app.showFeed,
          url             = options.url || '',
          body_class      = options.body_class || '',
          sort_by_day     = options.sort_by_day || false,
          container_class = options.container_class || 'container-fluid'
          template        = options.template || _this.template.grid

      // Get the feed
      this.getShowFeed( url, function (items) {

        // If no items, return
        if ( !items || items.length <= 0 ) return false;

        // Set vars
        var date_grouped_html = {};

        // Add body & container classes & optional header
        app.$el.body.addClass( body_class )
        app.$el.shows_container
          .removeClass()
          .addClass( container_class )
        app.$el.shows_header.show()

        // Wait for template to be read
        $.get( template ).done(function (html) {

          if ( app.config.debug ) console.log('%cTEMPLATE:', 'color:#d79c29', template )

          $.each(items, function (i, show) {

            // Clone a copy of the html template
            var $html = html;

            // Get cleaned up torrent info
            var show_info = _this.filterShowTorrentInfo( show.link, show.title )   

            // Build data object, keys must match template vars
            var data = {
              'title'               : show_info.title,
              'sxe'                 : show_info.sxe,
              'season'              : show_info.season,
              'episode'             : show_info.episode,
              'link'                : show.link,
              'release_date'        : formatPubDate( show.pubDate ),
              'release_day_of_week' : formatPubDate( show.pubDate, 'day' ),
              'cover_image_src'     : app.dir.images + show_info.slug + '.png'
            };

            // Check if it was released today
            // @todo separate weeks for weekly calendar
            var day = getDayNameFromPubDate( show.pubDate )        

            if ( dateIsToday( show.pubDate ) ) {
              _this.calendar.today[day].push( data )
            }

            // Populate the template vars with real data
            $html = populateTemplateVars( $html, data )

            // Group by day
            if ( sort_by_day ) {

              var show_date       = formatPubDate( show.pubDate, 'day' ) + ' ' + formatPubDate( show.pubDate ),
                  show_date_slug  = dateSlugFromString( show_date )

              // Add to date grouped HTML obj
              if ( typeof date_grouped_html[show_date_slug] === 'undefined' ) {
                // does exist
                date_grouped_html[show_date_slug] = [];
                date_grouped_html[show_date_slug].push( {
                  html : $html
                })
              } else {
                // does not exit
                date_grouped_html[show_date_slug].push( {
                  html : $html
                })
              }
              
            } else {

              // Append to shows container
              app.$el.shows.empty()
              app.$el.shows.append( $html )
            }

          })

          // Render if we sorted by day
          if ( sort_by_day ) {

            if ( app.config.debug ) console.log('%cSUBROUTINE:', 'color:#2b7723', 'getShowFeed( sort_by_day )')

            app.$el.shows.empty()

            $.each( date_grouped_html, function (date_index, show_data ) {

              var nice_date        = dateStringFromSlug( date_index ),
                  nice_date__day   = nice_date.split(' ')[0],
                  nice_date__date  = nice_date.split(' ')[1];

              var html  = '<div class="show-list-group"> \
                            <div class="show-list-group__header"> \
                            <h3 class="m0">' + nice_date__day + ' <br> <small>' + nice_date__date + '</small> </h3> \
                          </div>';

              for ( var x=0; x<show_data.length; x++ ) {
                // app.$el.shows.append( show_data[x].html )

                html += show_data[x].html
              } 

              html += '</div>';

              app.$el.shows.append( html )


            })
          } 

          // Callback
          callback(items)

        })


        if ( _this.debug ) console.log('Show Torrent Info: ', show_info )

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
           torrent_info.season  = show_season.replace('S', '').replace(/^0/g, '')

        // Episode
        var show_episode        = torrent_str.match(/E(\d{1,2})/)[0]
           torrent_info.episode = show_episode.replace('E', '').replace(/^0/g, '')
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


  }




  /**
   * Show Schedule
   */
  app.showSchedule = {


    /**
     * Initialize
     */
    init: function() {

      var _this = app.showSchedule;

      // Get the show schedule feed
      _this.getShowScheduleFeed( app.feeds.showrss_schedule, function (data) {

        if ( app.config.debug ) console.log('%cCALLBACK:', 'color:#66d9ef', 'getShowScheduleFeed()' )

        // Populate the calendar object
        _this.populateShowCalendar( data, function (schedule) {

          if ( app.config.debug ) console.log('%cFUNCTION:', 'color:#3db330', 'populateShowCalendar()')

          // Render the upcoming show list
          _this.renderUpcomingShowList( schedule, function ( days ) {

            app.$el.nav.upcoming.show()

            if ( app.config.debug ) console.log('%cFUNCTION:', 'color:#3db330', 'renderUpcomingShowList()')

          })
        } )

      })

    },


    hide: function() {

      app.$el.shows_upcoming.hide()
      app.$el.nav.upcoming.hide()

    },


    /**
     * Get Show Schedule Feed
     * 
     * @param  {String}   url      
     * @param  {Function} callback 
     */
    getShowScheduleFeed: function(url, callback) {

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

        console.log('%cERROR:', 'color:#bc2226', 'getShowScheduleFeed()', data)

        callback(data)
      })

    },

    /**
     * Populate Show Calendar
     * 
     * @param  {Object} shows 
     * @return {Object}      
     */
    populateShowCalendar: function(shows, callback) {

      var _this    = app.showSchedule,
          shows    = shows || {},
          data     = {},
          calendar = {
            weekly : {
              'mon' : [],
              'tue' : [],
              'wed' : [],
              'thu' : [],
              'fri' : [],
              'sat' : [],
              'sun' : []
            }
          };

      shows.forEach( function (show, i) {

        var day = getDayNameFromPubDate( show.pubDate )        

        // write to calendar
        calendar.weekly[day]
        calendar.weekly[day].push({
          title : show.title,
          link  : show.link
        })

      })

      callback( calendar.weekly )

      if ( app.config.debug ) console.log('%cFUNCTION:', 'color:#3db330', 'populateShowCalendar()' )
      // if ( app.config.debug ) console.log( this.feeds.showrss_all )

    },

  
    /**
     * Render Upcoming Show List
     * 
     * @param  {Object} shows 
     * @return {Object}      
     */
    renderUpcomingShowList: function(schedule, callback) {

      var _this     = app.showSchedule,
          schedule  = schedule || {},
          $upcoming = app.$el.shows_upcoming.find('.shows__upcoming-list')

      $('.shows__upcoming-list').empty()
      
      // Loop through schedule
      $.each( schedule, function (day, shows) {
          
        var html      = '',
            day_name  = dayAbbreviationToFull( day ),
            day_num   = getDayNumberFromString( day, false ), // offset
            today_num = (new Date()).getDay()

        // Skip if prior to today
        if ( day_num < (today_num-1) ) return true;

        // Build HTML string
        html += '<li class="shows__upcoming-group">';
        html += '<h5 class="shows__upcoming-day">' + day_name + '</h5>';

        if ( shows.length == 0 ) return true;

        shows.forEach( function (show, i) {
          
          html += '<a class="shows__upcoming-show" href="' + show.link + '">' + show.title + '</a>';

        })

        html += '</li>';

        $upcoming.append( html )

      })

      callback()

      if ( app.config.debug ) console.log('%cFUNCTION:', 'color:#3db330', 'renderUpcomingShowList()' )

    },


  }



  /**
   * Loader
   */
  app.loader = {

    show : function() {

      app.$el.loader.show()

    },

    hide : function() {

      app.$el.loader.hide()

    }

  }



  /**
   * Routing
   *
   * @depencies routie.js
   */
  app.routing = {

    /**
     * Initialize
     */
    init: function() {

      // Check routie dependency
      if ( !window.routie || window.routie === undefined ) return false;
      
      this.routes()

    },

    /**
     * Routes
     *
     * /
     * #feed/
     * #feed/:encodeduri
     */
    routes : function() {

      var _this = app.routing;


      /**
       * GET /
       */
      routie('', function () {
        // Redirect
        routie('#home')
      })

      
      /**
       * GET /#home
       */
      routie('home', function () {

        _this.showView( app.$el.views.index )
        _this.setActiveNavItem( 'home' )

      })
      
      /**
       * GET /#feed
       */
      routie('feed', function (page) {
        
        _this.showView( app.$el.views.feed )
        _this.setActiveNavItem( 'feed' )

        app.showFeed.init()
        app.showSchedule.init()
         
      })


      /**
       * GET /#feed/:encodeduri
       */
      // routie('feed/:encodeduri', function (encoded_uri) {

      //   _this.showView( app.$el.views.feed )
         
      //   var encoded_uri = decodeURIComponent(atob(encoded_uri)) || '';

      //   console.log('loading feed uri: ', encoded_uri)

      // })

    },

    /**
     * Show View
     */
    showView : function($view) {

      $.each( app.$el.views, function (key, view) {
        view.hide()
      })

      // Hide misc subview components
      app.$el.nav.upcoming.hide()

      $view.show()

      if ( app.config.debug ) console.log('%cROUTER:', 'color:#e65ad7', $view.selector )
    },


    /**
     * Set Active Nav Item
     */
    setActiveNavItem: function(hash) {

      var _this = app.router,
          hash  = hash || '',
          $nav  = app.$el.nav.main;

      var lis = $nav.find('li'),
          li  = $nav.find('a[href="#'+hash+'"]').parent()

      lis.removeClass('active')
      li.addClass('active')

    }

  }




  /**
   * Regular Expressions
   */
  app.regex = {

    first_word    : /(^[A-Z])\w+/g,
    detail_groups : /(.*?)\.S?(\d{1,2})E?(\d{2})\.(.*)/g

  }





































  /**
   * Curl Request
   * 
   * @param  {Object} options 
   *        
   */
  function curlRequest(options) {

    var options = options || {},
        request;

    options.url        = options.url || '';
    options.data_type  = options.data_type || 'xml';
    options.parse_json = options.parse_json || true;
    options.callback   = options.callback || undefined;

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
      
      if ( options.parse_json ) {
        var json  = $.parseJSON(data),
            items = json.channel.item

        callback(items)
      } else {
        callback(data)
      }

    })
    .fail(function (data) {
      console.log("error", data);

      callback(data)
    })
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
  function formatPubDate( date_str, format, offset ) {
    
    var format = ( format !== undefined ) ? format : 'full',
        offset = offset ? offset : true;

    var date = new Date( date_str )

    // Offset to correct
    if ( offset ) {
      date.setHours( date.getHours() - 24 )
    }

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
   * Populate HTML Template Variables
   * 
   * @param  {String} html    
   * @param  {Object} data     
   * @param  {RegEx} pattern 
   * @return {String}
   */
  function populateTemplateVars(template_html, data, pattern) {

    var template_html = template_html || null,
        data          = data || {},
        pattern       = pattern || /\{\{(.*?)\}\}/g;

    // Find the template vars
    var template_vars = template_html.match( pattern )

    template_vars.forEach(function (key, k) {
      
      // Get string value between double brackets to use as key
      var key_clean = key.replace('{{', '').replace('}}', '')

      // Replace HTML with real data values
      template_html = template_html.replace(key, data[key_clean])

    })

    return template_html;

  };




  /**
   * Read Single File
   * 
   * @param  {Object} evt 
   * @return {String}
   */
  function readSingleFile(file_path) {

    // Path to file
    var file_path = file_path || '';

    // Create hidden input element
    var input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('id', randomString(8, 'aA'))

  
    var file = evt.target.files[0]; 

    if ( file ) {

      var reader = new FileReader()

      reader.onload = function(event) { 

        var contents = event.target.result;

        console.log( "Got the file.n" 
              +"name: " + f.name + "n"
              +"type: " + f.type + "n"
              +"size: " + f.size + " bytesn"
              + "starts with: " + contents.substr(1, contents.indexOf("n"))
        );  
      }
      reader.readAsText( file );
    } else { 
      console.log("Failed to load file");
    }
  };


  /**
   * Random String
   * 
   * @param  {Integer} length 
   * @param  {Sting} chars  
   * @return {String}
   *
   * @usage randomString(32, '#aA'), randomString(8, 'aA')
   */
  function randomString(length, chars) {
    var mask = '';

    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    
    var result = '';

    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];

    return result;
  };



  /**
   * Get Day Name from Published Dat
   * 
   * @param  {String} string
   * @return {string} 
   * 
   * @example Wed, 18 Feb 2015 00:00:00 +0000
   */
  function getDayNameFromPubDate(string) {

    var string = string || '';

    string = string.substring(0, string.match(',').index).toLowerCase();

    return string;
    
  }



  function rootLocation() {

    var href = window.location.href,
        hash = window.location.hash;

    if ( hash.length > 0 ) {
      return href.replace(hash, '')
    } else {
      return href.replace('#', '')
    }

  }

  function dateIsToday( date ) {
    
    var today = (new Date())
        today.setHours(0)
        today.setMinutes(0)
        today.setSeconds(0)
    
    var d = (new Date( date ))
        d.setHours(0)
        d.setMinutes(0)
        d.setSeconds(0)

    if ( today === d ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Day Abbreviation To Fullname
   * 
   * @param  {String} day 
   * @return {String} 
   */
  function dayAbbreviationToFull( day ) {

    var days = {
      'mon' : 'Monday',
      'tue' : 'Tuesday',
      'wed' : 'Wednesday',
      'thu' : 'Thursday',
      'fri' : 'Friday',
      'sat' : 'Saturday',
      'sun' : 'Sunday'
    }

    return days[day];
  }


  /**
   * Date Slug from Date String
   * 
   * @param  {String} str 
   * @return {String}     
   */
  function dateSlugFromString( str ) {

    return str
      .replace(' ', '_')
      .replace('/', '-')
      .replace('/', '-')
      .replace('/', '-')
      .toLowerCase()
  }

  /**
   * Date String from Date Slug
   * 
   * @param  {String} slug 
   * @return {String}      
   */
  function dateStringFromSlug( slug ) {

    slug = slug.charAt(0).toUpperCase() + slug.slice(1)
    slug = slug
      .replace('_', ' ')
      .replace(/-/g, '/')

    return slug

  }

  /**
   * Get Day Number from String
   * 
   * @param  {String} day    
   * @param  {Boolean} offset
   *  
   * @return {String}        
   */
  function getDayNumberFromString( day, offset ) { // offset

    var day     = day || '',
        offset  = offset ? offset : false;

    var day_nums = {
      'mon' : 1,
      'tue' : 2,
      'wed' : 3,
      'thu' : 4,
      'fri' : 5,
      'sat' : 6,
      'sun' : 7
    };

    if ( offset ) {
      return day_nums[day - 1]
    } else {
      return day_nums[day]
    }
  }

  /**
   * Size Prototype
   * 
   * @param  {Object} obj 
   * @return {Integer}     
   */
  Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
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