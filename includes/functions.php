<?php 

require 'DOMScraper.php';

/**
 * curlRequest
 * @param  {String} $URL         
 * @return {Object} $result
 */
function curlRequest( $url, $decode=false, $xml_to_json=false ) 
{

  // Param sanitizing
  $url    = isset($url) ? $url : '';
  $decode = isset($decode) ? $decode : false;

  //  Initiate curl
  $ch = curl_init();
  // Disable SSL verification
  curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false);
  // Will return the response, if false it print the response
  curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true);
  // Set the url
  curl_setopt( $ch, CURLOPT_URL, $url );
  // Execute
  $result = curl_exec($ch);
  // Close
  curl_close($ch);

  if ( $decode ) {
    return json_decode($result, true);
  } else {
    if ( $xml_to_json ) {
      return XMLToJSON( $result );
    } else {
      return $result;
    }
    
  }
}


/**
 * XML to JSON
 * 
 * @param  {String} $xml
 * @return {String} $json
 */
function XMLToJSON( $xml ) 
{

  $fileContents = str_replace(array("\n", "\r", "\t"), '', $xml);
  $fileContents = trim(str_replace('"', "'", $fileContents));
  $simpleXml = simplexml_load_string($fileContents);
  $json = json_encode($simpleXml);

  return $json;
}


/**
 * Scrape URL
 *
 * @param   {String} $url
 * @param   {String} $xpath_query
 * 
 */
function scrapeURL( $url, $xpath_query, $test=false ) {

  $scraper = new DOM_Scraper;

  // Request URL
  $scraper->scrape( $url );

  // XPath Query
  $elements = $scraper->query( $xpath_query );

  if ( $test ) {
    return $elements;
  } else {
    // Parse Data
    $data = $scraper->getElementData( $elements );
    $data = $scraper->getElementValue( $data['node_value'] );

    return $data;
  }


}



/**
 * Scrape IMDB Title URL
 *
 * @example [$title_query] - 'parks%20and%20recreation'
 * @example [$xpath_query] - '//*[@class="results"]/tr[2]/td[3]/a/@href'
 * @param   {String} $url
 */
function scrapeIMDBTitleURL( $title_query ) {

  $scraper = new DOM_Scraper;

  $url          = 'http://www.imdb.com/search/title?title_type=tv_series&title=' . $title_query;
  $xpath_query  = '//*[@class="results"]/tr[2]/td[3]/a/@href';

  $title_url    = scrapeURL( $url, $xpath_query );

  return 'http://imdb.com' . $title_url;

}



/**
 * Scrape IMDB Episode Rating
 *
 * @example [$title_query] - 'Valediction'
 * @example [$xpath_query] - '//*[@class="results"]/tr[2]/td[3]/a/@href'
 * @param   {String} $url
 */
function scrapeIMDBEpisodeRating( $episode_title ) {

  $scraper = new DOM_Scraper;

  $url          = 'http://www.imdb.com/search/title?&title_type=tv_episode&title=' . $episode_title;
  $xpath_query  = '//*[@class="results"]/tr[2]/td[3]/div[@class="user_rating"]/div[1]/span[4]/span[1]';

  $episode_rating  = scrapeURL( $url, $xpath_query );

  if ( !is_null($episode_rating) ) {
    return $episode_rating;
  } else {
    return '';
  }


}























