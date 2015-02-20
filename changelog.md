changelog
==========

### 2015-02-16

* build a templating system. old HTML append:

  // app.$el.shows.append('\
  //   <div class="show"> \
  //     <div class="show__info"> \
  //       <h5 class="show__title">' + show_info.title + ' ' + show_info.sxe + '</h5> \
  //       <div class="show__meta"><b>' + release_day_of_week + '</b> - ' + release_date + '</div> \
  //       <a href="' + show.link + '"><i class="show__play fa fa-play-circle"></i></a> \
  //     </div> \
  //     <div class="show__cover-photo" style="background-image:url(\'' + cover_image_src + '\')"></div> \
  //   </div> \
  // ')