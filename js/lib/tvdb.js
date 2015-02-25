var TVDB = (function () {

  var tvdb = {}

  tvdb = {

    debug : true,

    settings : {
      api_key : 'ADEA451797D45B34',
    },
    
    api : {

      /**
       * Get Series
       *
       * @param {String} seriesname
       * @param {String} language
       */
      get_series : 'http://thetvdb.com/api/GetSeries.php',

      /**
       * Get Episode By Air Date
       *
       * @param {String} apikey
       * @param {String} seriesid
       * @param {String} airdate
       * @param {String} language
       */
      get_episodes_by_air_date : 'http://thetvdb.com/api/GetEpisodeByAirDate.php',

    }

  }



  /**
   * Init
   */
  tvdb.init = function() {

    var _this = tvdb;

  }


  /**
   * Demos
   *
   * getSeries()
   * getSeriesID()
   * getEpisodesByAirDate()
   */
  tvdb.demo = function() {

    
    // EXAMPLE  - getSeries
    tvdb.getSeries('modern family', true, function (series) {
      console.log('series', series)
    })

    // EXAMPLE  - getSeriesID & getEpisodesByAirDate
    tvdb.getSeriesID('breaking bad', function (series_id) {

      console.log( 'series_id', series_id )

      tvdb.getEpisodesByAirDate(series_id, '2013-8-11', function (episodes) {

        console.log('episode', episode)
      })

    })

  }




  /**
   * Get Series
   *
   * @param {String}    series_name
   * @param {Boolean}   get_first
   * @param {Function}  callback
   *
   * @return {Object}   series
   */
  tvdb.getSeries = function(series_name, get_first, callback) {

    var series_name = series_name || null;

    // Make request
    this.request( tvdb.api.get_series, {
      seriesname : series_name
    }, function (data) {
      
      var series = data.Series || [];

      // If get_first is not passed, make 2nd param the callback
      if ( get_first && typeof get_first === 'function' ) {
        callback = get_first;
        callback(series)
      } else {
        // one result
        if ( $.isArray(series) ) {
          callback(series[0])
        } else {
          callback(series)
        }
      }
    })

  }






  /**
   * Get Series ID
   * 
   * @param  {String}   series_name 
   * @param  {Function} callback
   * 
   * @return {Object}   series.seriesid
   */
  tvdb.getSeriesID = function(series_name, callback) {

    var series_name = series_name ? series_name : '';

    this.getSeries(series_name, true, function (series) {
      callback( series.seriesid )
    })
  }





  /**
   * Get Episodes By Air Date
   * 
   * @param  {String}   series_name 
   * @param  {Function} callback
   * 
   */
  tvdb.getEpisodesByAirDate = function(series_id, air_date, callback) {

    var series_id = series_id || 0,
        air_date  = air_date  || '';

    // Make request
    this.request( tvdb.api.get_episodes_by_air_date, {
      apikey   : tvdb.settings.api_key,
      seriesid : series_id,
      airdate  : air_date,
    }, function (data) {
      callback(data.Episode)
    })

  }




  /**
   * Request
   */
  tvdb.request = function(url, params, callback) {

    var url    = url || '',
        params = $.param( params ) || '',
        request;

    url = url + '?' + params;

    request = $.ajax({
      url  : 'ajax.php',
      type : 'POST',
      data : {
        action : 'curl',
        url : url,
        convertXML : true
      }
    })
    .done(function (data) {
      callback( $.parseJSON(data) )
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



  return tvdb;
}());