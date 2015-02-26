var IMDB = (function () {

  var imdb = {}

  imdb = {

    config : {
      debug : true
    },

    settings : {
      api_key : '',
    },

    url: {
      root : window.location.href.match(/(localhost)/g) ? 'http://localhost/projects/showfeed/' : 'http://showfeed.io/',
    },
    
    api : {

      /**
       * Show URL
       */
      show_url       : 'http://www.imdb.com/search/title?title_type=tv_series&title=',

      /**
       * Episode Rating
       */
      episode_rating : 'http://www.imdb.com/search/title?title_type=tv_episode&title='
    }

  }



  /**
   * Init
   */
  imdb.init = function() {

    var _this = imdb;

  }


  /**
   * Demos
   */
  imdb.demos = function() {

    // DEMO - Get Show URL
    imdb.getShowURL('breaking bad', function (show_url) {
      if ( imdb.config.debug ) console.log('%cCALLBACK:', 'color:#66d9ef', 'getShowURL("breaking bad")', show_url )
    })

    // DEMO - Get Episode Rating
    imdb.getEpisodeRating('ozymandias', function (rating) {
      if ( imdb.config.debug ) console.log('%cCALLBACK:', 'color:#66d9ef', 'getEpisodeRating("ozymandias")', rating )
    })
    
  }


  /**
   * Get Show URL
   * 
   * @param  {String}   episode_title 
   * @param  {Function} callback      
   */
  imdb.getShowURL = function(show_name, callback) {

    imdb.request('show_url', show_name, function (show_url) {
      callback( show_url )
    })

  }



  /**
   * Get Episode Rating
   * 
   * @param  {String}   episode_title 
   * @param  {Function} callback      
   */
  imdb.getEpisodeRating = function(episode_title, callback) {

    imdb.request('episode_rating', episode_title, function (episode_rating) {
      if ( episode_rating > 0 ) {
        callback(episode_rating)
      } else {
        callback('0')
      }  
    })

  }




  /**
   * Request
   * 
   * @param  {String}   method   
   * @param  {String}   term     
   * @param  {Function} callback 
   */
  imdb.request = function(method, term, callback) {

    var url    = url || '',
        method = method || '',
        term   = term || '',
        request;

    request = $.ajax({
      url  : imdb.url.root+'ajax.php',
      type: 'POST',
      data : {
        action : 'imdb',
        method : method,
        term   : term
      }
    }).done(function (data) {
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



  return imdb;
}());