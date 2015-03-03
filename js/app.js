var APP = (function () {

  /**
   * Modules
   *
   * app
   * tvdb
   */
  var app     = {}
  var storage = window.LSTORE;
  var tvdb    = window.TVDB;
  var imdb    = window.IMDB;
  var kat     = window.KAT;

  /**
   * Module Properties
   *
   * config
   * url
   * data
   * $el
   * settings
   * dir
   * feeds
   * init
   * plugins
   * events
   * forms
   * loader
   * routing
   * 
   * showFeed
   * showSchedule
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

      get : {
        show_desc : $('.get--show_desc'),
      },
      
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
        debug : $('#view--debug'),
      },

      debug : $('#debug'),
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

    this.showList.init()

    this.environmentVars()
    
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

    // Display Show Synopsis
    $(document).on('click', '.get--show_desc', function (event) {

      event.preventDefault()

      var $this         = $(this),
          show_name     = $this.data('show-name'),
          episode_date  = $this.data('episode-date'),
          $show_meta    = $this.parent(),
          $show_desc    = $this.parent().parent().parent().find('.show__desc-inner'),
          html          = '';

      // TVDB API Request
      tvdb.getSeriesID( show_name.toLowerCase(), function (series_id) {

        tvdb.getEpisodesByAirDate(series_id, episode_date, function (episode) {

          var episode = episode || {};

          if ( episode.Overview == undefined ) {
            $show_desc.html( 'Could not find episode synopsis.' ).fadeIn(150)
          } else {

            html += '<b>' + episode.EpisodeName + '</b><br>';
            html += '' + episode.Overview + '<br>';

            $show_desc.html( html ).fadeIn(150)

            // Get IMDB Rating
            imdb.getEpisodeRating( episode.EpisodeName.toLowerCase(), function (rating) {

              if ( parseFloat(rating) > 0 ) {
                $show_meta.find('.rating').html( rating+' / 10' ).fadeIn(150)
              } else {
                $show_meta.find('.rating').html( 'No Reviews' ).fadeIn(150)
              }
            })

          }

        })
      })



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
            $alert     = $this.find('.alert'),
            user_id    = $this.find('[name=user_id]').val(),
            $your_feed = $this.find('[name=your_feed]');

        $alert.hide()  
        
        if ( !user_id || user_id === undefined || user_id === '' || user_id.length < 6 ) {
          $alert.show()
          return false;
        } 

        // Toggle submit classes
        $submit
          .toggleClass('btn-primary btn-success')
          .attr('disabled', 'disabled')
          .text('Success')
          .blur()

        // Display new import hash url
        $your_feed
          .show()
          .text( 'Your Feed' )
          .attr( 'href', app.url.site + '#import/' + user_id )
        
          

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

    init: function(feed_url, schedule_url) {

      var _this         = app.showFeed,
          feed_url      = feed_url ? feed_url : app.feeds.showrss_all,
          schedule_url  = schedule_url ? app.feeds.showrss_all : false

      app.loader.show()

      // Prevent re-running unless forced refresh
      // if ( app.$el.shows.children().length > 0 ) {
      //   app.loader.hide()
      //   app.$el.nav.upcoming.show()
      //   return false;
      // }

      // Show Schedule
      if ( schedule_url ) {
        app.showSchedule.init( schedule_url ) 
      }

      // Show Feed
      this.renderShowFeed( {
        url             : feed_url,
        template        : _this.template.list,
        sort_by_day     : true,
        container_class : 'container'
      }, function (data) {
        // callback 
        
        app.$el.shows_container.show()
        app.loader.hide()
        

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
          template        = options.template || _this.template.grid,
          calendar        = {
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
          }

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
              'pub_date'            : show.pubDate,
              'release_date'        : formatPubDate( show.pubDate ),
              'release_day_of_week' : formatPubDate( show.pubDate, 'day' ),
              'cover_image_src'     : app.dir.images + show_info.slug + '.png'
            };

            // Check if it was released today
            // @todo separate weeks for weekly calendar
            var day = getDayNameFromPubDate( show.pubDate )        

            if ( dateIsToday( show.pubDate ) ) {
              calendar.today[day].push( data )
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
            if ( app.config.debug ) console.groupEnd()


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

          if ( app.config.debug ) console.log('%cFUNCTION:', 'color:#3db330', 'populateShowCalendar()')
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
    init: function( schedule_url ) {

      var _this         = app.showSchedule,
          schedule_url  = schedule_url ? schedule_url : app.feeds.showrss_schedule;

      // Get the show schedule feed
      _this.getShowScheduleFeed( app.feeds.showrss_schedule, function (data) {

        if ( app.config.debug ) console.group('%cCALLBACK:', 'color:#66d9ef', 'getShowScheduleFeed()' )

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

    show: function() {
      app.$el.shows_upcoming.show()
      app.$el.nav.upcoming.show()
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


      routie({

        /**
         * GET /
         */
        '': function() {
          routie('#home')
        },

        /**
         * GET /#home
         */
        'home': function() {
          _this.showView( app.$el.views.index )
          _this.setActiveNavItem( 'home' )
        },
        
        /**
         * GET /#feed
         */
        'feed': function() {
          _this.showView( app.$el.views.feed )
          _this.setActiveNavItem( 'feed' )

          app.showFeed.init( app.feeds.showrss_all, true )
        },

        /**
         * GET /#import/:id
         */
        'import/:id' : function(id) {

          // var feed_url = encoded_uri ? decodeURIComponent(atob(encoded_uri)) : '';
          
          var id        = id ? id : '207854',
              feed_url  = 'http://showrss.info/rss.php?user_id='+id+'hd=0&proper=null';

          console.log(feed_url)

          _this.showView( app.$el.views.feed )
          _this.setActiveNavItem( 'feed' )

          app.showFeed.init( feed_url, false )

          console.log('loading feed uri: ', encoded_uri)
        },

        /**
         * GET /#debug
         */
        'debug': function() {

          _this.showView( app.$el.views.debug )
          _this.setActiveNavItem( 'debug' )

          app.debug.init({
            kat : true,
            imdb : true,
            tvdb : true
          })
        },

      })

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

      // Show current view
      $view.show()

      // Hide loadoer (redundancy)
      app.loader.hide()

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
   * Show List
   * 
   */
  app.showList = {

    debug : false,

    file : 'data/show-list.json',

    db : 'my-shows',

    /**
     * Initialize
     */
    init: function() {

      var _this = app.showList;


      // Set DB
      storage.getOrSet(_this.db, [])
      // storage.getOrSet(_this.db, ['Archer (2009)', 'Arrow'])

      // Read show list
      _this.readShowListJSON( _this.file , function (list) {

        // Create the input element
        _this.createInputElement(list, function () {

          // Bind events
          _this.eventBindings()

          // Populate existing data
          _this.displayShowList()

        })

      })
      

    },

    /**
     * Read Show List JSON
     * 
     * @param  {String}   file     
     * @param  {Function} callback 
     */
    readShowListJSON: function(file, callback) {

      var _this = app.showList,
          file  = file ? file : '',
          list  = '';

      $.ajax({
        url: app.url.site + file,
        type: 'GET',
        dataType: 'json'
      })
      .done(function (data) {

        if ( _this.debug ) console.log('%cAJAX:', 'color:#d76c15', 'app.showList.readShowListJSON()', data.shows)

        callback(data.shows)
      })
      .fail(function (data) {
        console.log("error", data);
        callback(data)
      })
      

    },


    /**
     * Create Awesomplete Input Element
     * 
     * @param  {Function} callback
     */
    createInputElement: function(list, callback) {

      var _this = app.showList,
          input = document.getElementById('input--show_list');

      // Create awesomplete element
      var awesomplete = new Awesomplete( input, {
        list : list
      })

      callback()

    },

    /**
     * Event Bindings
     *
     * submit
     * awesomplete-select
     * awesomplete-selectcomplete
     */
    eventBindings: function() {

      var _this  = app.showList,
          $input = $('#input--show_list'),
          $list  = $('#list--show_list');

      // Submit
      $input.on('submit', function (event) {
        event.preventDefault()

        console.log('form submitted')
      })

      // Add selection to list && check for dupes
      document.addEventListener('awesomplete-select', function (event) {

        var show_name = event.text;

        // Clear input and show on screen
        $input.val('')
        // $list.append('<li>' + show_name + '</li>')

        _this.addShowToList( show_name )

      })

      // Clear after selection complete
      document.addEventListener('awesomplete-selectcomplete', function (event) {

        $input.val('')

      })

    },

    /**
     * Add Show To List
     * 
     * @param {String}   show     
     * @param {Function} callback 
     */
    addShowToList: function(show, callback) {

      var _this   = app.showList,
          db      = _this.db;

      if ( $.inArray(show, storage.get(db)) >= 0 ) {
        console.log('Duplicate', show)
      } else { 
        var arr = storage.get(db)
            arr.push(show)

        // Updated LS DB
        storage.set(db, arr)
        // Display the list
        _this.displayShowList(arr)
      } 
      
    },

    /**
     * Display Show List
     * 
     * @param  {Array}   list     
     * @param  {Function} callback 
     */
    displayShowList: function(list, callback) {

      var _this = app.showList,
          db    = _this.db,
          data  = storage.get(db),
          $list = $('#list--show_list');

      // If no list provided, show current from LS
      if ( !list || list === undefined ) {
        $.each( data, function (i, show) {
          $list.append('<li>' + show + '</li>')
        })
      } else {
        // Update list 
        $list.empty()

        $.each( list, function (i, show) {
          $list.append('<li>' + show + '</li>')
        })
      }

    }


  }








  /**
   * Debug/Tests
   * 
   * @param  {Object} options [kat, imdb, tvdb]
   * 
   */
  app.environmentVars = function() {

    // Show [debug] on local env only
    if ( app.config.environment === 'development' ) {
      $('[debug]').attr('style', 'display:block !important;')
    }


  }






  /**
   * Debug/Tests
   * 
   * @param  {Object} options [kat, imdb, tvdb]
   * 
   */
  app.debug = {

    init: function(options) {

      var _this   = app.debug,
          options = options ? options : {};

      // Show loader
      app.loader.show()

      // Prevent re-running unless forced refresh
      if ( app.$el.debug.children().length > 0 ) {
        app.loader.hide()
        return false;
      }

      // kat.js
      if ( options.kat ) {
        _this.kat(function (data) {
          _this.output('kat.js', data)
          app.loader.hide()
        })
      }

      // imdb
      if ( options.imdb ) {
        _this.imdb(function (data) {
          _this.output('imdb.js', data)
          app.loader.hide()
        })
      }

    },

    kat: function(callback) {

      var arr = [];

      // Build EZTV Feed (get x pages from user:eztv )
      kat.buildEZTVFeed( 5, function (data) {
      
        $.each( data, function (i, torrent) {
          arr.push( torrent )
        })

        callback( arr )

      })

    },

    imdb: function(callback) {

      var arr = [];

      // DEMO - Get Show URL
      imdb.getShowURL('breaking bad', function (show_url) {
        arr.push( show_url )

        // DEMO - Get Episode Rating
        imdb.getEpisodeRating('ozymandias', function (rating) {
          arr.push( rating )

          callback( arr )
        })

        
      })



    },


    /**
     * Output
     * 
     * @param  {String} title 
     * @param  {Object} data  
     */
    output: function(title, data) {

      app.$el.debug.append('\
        <div class="row row-padded"> \
          <div class="col-sm-12"> \
            <div class="col-inner"> \
              <header class="col-header"> \
                <h3 class="m0">' + title + '</h3> \
              </header> \
              <div class="col-content"> \
                <pre class="pre-scroll">' + JSON.stringify(data, null, 2) + '</pre> \
              </div> \
            </div> \
          </div> \
        </div> \
      ')

    }


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