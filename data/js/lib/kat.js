var KAT = (function () {

  var kat = {}

  kat = {

    config : {
      debug : true
    },

    settings : {
      api_key : '',
    },

    url: {
      root : window.location.href.match(/(localhost)/g) ? 'http://localhost/projects/showfeed/' : 'http://showfeed.nerdi.net/',
    },
    
    api : {

      test : 'https://kickass.to/usearch/%22modern%20family%22%20OR%20%22always%20sunny%22%20user%3Aeztv%20age%3Aweek/?field=time_add&sorder=desc',
      /**
       * Get User Feed
       */
      usearch : 'https://kickass.to/usearch/',
      
    },

    users : {
      eztv : 'user:eztv',
      ettv : 'user:ettv'
    },

    data : {
      feed : {}
    }

  }



  /**
   * Init
   */
  kat.init = function() {

    var _this = kat;


  }



  /**
   * Demos
   */
  kat.demos = function() {

    this.buildEZTVFeed( 5, function (data) {
    
      $.each( data, function (i, torrent) {
        console.log( torrent )
      })

    })
 
  }



  kat.buildSearchQuery = function(show_names) {



  }


  /**
   * Build EZTV Feed
   */
  kat.buildEZTVFeed = function(count, callback) {

    var _this = kat;

    var start   = 0,
        end     = count,
        feed    = {};

    // Callback for each req
    var pageCallback = function(data) {

        populateData(data.page, data.items);

        if ( ++start === end ) {
          var merged = sortFeedByPage( feed, true )
          callback( merged )
        }
    }

    // Loop through pages
    for (var i=start; i<end; i++) {
      _this.getUserFeed( 'eztv', ((i+1).toString()), pageCallback)
    }

    // Populate the data object
    function populateData(page, items) {
      feed[page] = items;
    }

    // Sort the feed by page, and flatten if desired
    function sortFeedByPage(obj, flatten) {

      var obj     = obj ? obj : null,
          flatten = flatten ? flatten : false,
          arr     = [],
          merged  = [];

      for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
              arr.push(obj[key]);
          }
      }

      arr.sort()

      if ( flatten ) {
        merged =$.map( arr, function (n) {
           return n;
        })
        return merged;
      } else {
        return arr;
      }

    }
    
  }



  /**
   * Get Show URL
   * 
   * @param  {String}   episode_title 
   * @param  {Function} callback      
   */
  kat.getUserFeed = function(user, page, callback) {

    var user = user ? this.users[user] : '',
        page = page ? page : '1',
        url = ( this.api.usearch + user )

    kat.request( url, {
      rss  : 1,
      page : page
    }, function ( user_feed ) {

      // console.log( user, page, user_feed )
      
      callback({
        user : user,
        page : page,
        items : user_feed
      })

    })

  }



 


  /**
   * Request
   * 
   * @param  {String}   method   
   * @param  {String}   term     
   * @param  {Function} callback 
   */
  kat.request = function(url, params, callback) {

    var url    = url || '',
        params = $.param( params ) || '',
        request;

    url = url + '/?' + params;

    request = $.ajax({
      url  : kat.url.root+'ajax.php',
      type : 'POST',
      data : {
        action : 'curl',
        url : url,
        convertXML : false
      }
    })
    .done(function (data) {
      
      var json = $.parseJSON(data),
          json = json.channel.item;

      callback( json )
    })
    .fail(function (data) {
      console.log("error", data);
      callback(data)
    })
    

  }



  /**
   * DOCUMENT READY
   * -------------------------------------------------------------------
   *
   */
  document.addEventListener('DOMContentLoaded', function (event) {


    
  })



  return kat;
}());