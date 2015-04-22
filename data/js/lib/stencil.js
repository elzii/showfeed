var STENCIL = (function ($) {

  var stencil = {}


  /**
   * Render - wrapper function using all methods
   * 
   */
  stencil.render = function(options, callback) {

    /**
     * Options
     *
     * template
     * data
     * container
     */
    var options = options ? options : {};

    stencil.getTemplate( options.template, function (html) {
      stencil.buildHTML( html, options.data, function (data) {
        stencil.displayHTML( data, options.container, function() {
          
          var $elements = options.container.children()

          callback( $elements )
        })
      })
    })
  }




  /**
   * Get Template
   * 
   * @param  {String}   template_path 
   * @param  {Function} callback      
   */
  stencil.getTemplate = function(template_path, callback) {

    var template_path = template_path ? template_path : '';

    $.get( template_path ).done(function (html) {

      callback(html)

    })

  }

  /**
   * Build HTML String
   * 
   * @param  {String}   html     
   * @param  {Array}    data     
   * @param  {Function} callback 
   */
  stencil.buildHTML = function( html, data, callback ) {

    var data  = data ? data : [],
        $html = '';

    data.forEach(function (item, i) {
      
      // clone html template
      var $template = html;

      // populate template vars
      $template = stencil.populateTemplate( $template, item )

      // add to html string
      $html += $template;

    })

    callback( $html )

  }

  /**
   * Display HTML
   * 
   * @param  {String}       html      
   * @param  {HTMLElement}  container 
   * @param  {Function}     callback  
   */
  stencil.displayHTML = function( html, container, callback) {

    var html       = html ? html : null,
        $container = container ? container : {};

    $container.append( html );

    callback()
  }


  /**
   * Populate HTML Template Variables
   * 
   * @param  {String} html    
   * @param  {Object} data     
   * @param  {RegEx} pattern 
   * @return {String}
   */
  stencil.populateTemplate = function( template_html, data, pattern ){

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
    
  }




  return stencil;

})(jQuery);