<?php 

// Include functions
require 'includes/functions.php';


/**
 * Donately API
 */
if ( isset($_POST['action']) && $_POST['action'] == 'curl' ) {

  $url         = isset($_POST['url']) ? $_POST['url'] : '';
  $debug       = isset($_POST['debug']) ? $_POST['debug'] : false;
  $convertXML  = isset($_POST['convertXML']) ? $_POST['convertXML'] : false;

  $result = curlRequest( $url, $debug, $convertXML );

  print $result;
}