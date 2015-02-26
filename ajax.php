<?php 

// Include functions
require 'includes/functions.php';


/**
 * CURL
 */
if ( isset($_POST['action']) && $_POST['action'] == 'curl' ) {

  $url         = isset($_POST['url']) ? $_POST['url'] : '';
  $debug       = isset($_POST['debug']) ? $_POST['debug'] : false;
  $convertXML  = isset($_POST['convertXML']) ? $_POST['convertXML'] : false;

  $result = curlRequest( $url, $debug, $convertXML );

  print $result;
}


/**
 * IMDB
 */
if ( isset($_POST['action']) && $_POST['action'] == 'imdb' ) {
  
  /**
   * IMDB Show Title URL
   *
   * @param  {String} $show_title 
   * @return {String} $show_url
   */
  if ( isset($_POST['method']) && $_POST['method'] == 'show_url' ) {

    $term       = isset($_POST['term']) ? $_POST['term'] : '';
    $show_url   = scrapeIMDBTitleURL( urlencode( $term ) );

    print $show_url;
  }

  /**
   * IMDB Episode Rating
   *
   * @param  {String} $episode_title
   * @return {String} $episode_rating
   */
  if ( isset($_POST['method']) && $_POST['method'] == 'episode_rating' ) {

    $term           = isset($_POST['term']) ? $_POST['term'] : '';
    $episode_rating = scrapeIMDBEpisodeRating( urlencode( $term ) );
    
    print $episode_rating;
  }

}

























