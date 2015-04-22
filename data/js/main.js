console.log('test')

require([
  'vendor/jquery',
  'vendor/awesomplete',
  'vendor/routie',
  'lib/storage',
  'lib/stencil',
  'lib/imdb',
  'lib/kat',
  'lib/tvdb'
], function ($, Awesomplete, Routie, Storage, Stencil, IMDB, KAT, TVDB) {
    
    console.log(Storage, Stencil, IMDB)
});
