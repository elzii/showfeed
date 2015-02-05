<?php 


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


function XMLToJSON( $xml ) 
{

  $fileContents = str_replace(array("\n", "\r", "\t"), '', $xml);
  $fileContents = trim(str_replace('"', "'", $fileContents));
  $simpleXml = simplexml_load_string($fileContents);
  $json = json_encode($simpleXml);

  return $json;
}