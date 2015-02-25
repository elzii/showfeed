<?php 

require '../includes/functions.php';
// require '../includes/DOMScraper.php';

/**
 * IMDB Advanced Title Search URL EXAMPLE
 * http://www.imdb.com/search/title?title=one%20last%20ride&title_type=tv_episode
 *
 * //*[@class="results"]/tr[2]/td[3]/a/@href
 * 
 * <a href="/title/tt1266020/">Parks and Recreation</a>
 * <a href="/title/tt3784126/">One Last Ride: Part 1</a>
 * 
 */

// $title_url = scrapeIMDBTitleURL( 'parks and recreation' );

// print '<pre>';
// print_r( $title_url );
// print '</pre>';

$scraper = new DOM_Scraper;

// $data = scrapeURL( 'http://www.imdb.com/search/title?title=one%20last%20ride&title_type=tv_episode', '//*[@class="results"]/tr[2]/td[3]/a/@href', true );
$data = scrapeURL( 'http://www.imdb.com/search/title?title=Valediction&title_type=tv_episode', '//*[@class="results"]/tr[2]/td[3]/div[@class="user_rating"]/div[1]/span[4]/span[1]', true );





print '<pre>';
print_r( $data );
print_r( $scraper->getElementData( $data ) );
print '</pre>';
