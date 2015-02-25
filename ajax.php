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
 * IMDB Show Title URL
 *
 * @param {String} $show_title  - 'parks and recreation'
 */
if ( isset($_POST['action']) && $_POST['action'] == 'imdb_title_url' ) {

  $show_title  = isset($_POST['show_title']) ? $_POST['show_title'] : '';

  $title_url = scrapeIMDBTitleURL( urlencode( $show_title ) );

  print $title_url;
}


/**
 * IMDB Episode Rating
 *
 * @param {String} $show_title  - 'one last ride'
 */
if ( isset($_POST['action']) && $_POST['action'] == 'imdb_episode_rating' ) {

  $episode_title  = isset($_POST['episode_title']) ? $_POST['episode_title'] : '';

  $episode_rating = scrapeIMDBEpisodeRating( urlencode( $episode_title ) );

  print $episode_rating;
}























