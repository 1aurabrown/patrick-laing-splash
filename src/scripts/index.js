import '../styles/index.scss';
import codedBy from './coded-by'
import $ from 'jquery';

const isTouchDevice = ('ontouchstart' in window || 'onmsgesturechange' in window)

const classes = {
  activeHalf: 'full-width',
  activeMediaItem: 'split-half__media__item--active',
  front: 'front',
  transitioning: 'transitioning',
  shrink: 'shrink'
}
const selectors = {
  container: '.split',
  half: '.split-half',
  media: '.split-half__media',
  mediaItem: '.split-half__media__item',
  activeMediaItem: `.${classes.activeMediaItem}`,
  image: '[data-type=image]',
  video: '[data-type=video]',
  sectionTitle: '.js-section-title',
  activeHalf: `.${classes.activeHalf}`,
}
var $container;

var nextMedia;


function isDesktop() {
  return window.outerWidth >= 768;
}
function updateSubtitle (e) {
  const half = e.currentTarget.getAttribute('data-section')
  fadeSubtitle(half)
}

const fadeDuration = 300;
var animating = false;
function fadeSubtitle(half) {
  const $allSubtitles = $(selectors.sectionTitle, $container);
  animating = true
  if (half) {
    const $newSubtitles = $allSubtitles.filter("." + half);
    const $oldSubtitles = $allSubtitles.not("." + half);
    const fadeInDuration =  $newSubtitles.is(':visible') ? 0 : fadeDuration
    const fadeOutDuration = $oldSubtitles.is(':visible') ? fadeDuration : 0
    if ( $newSubtitles.is(':visible')) { return }
    $allSubtitles.stop(true, true)
    $oldSubtitles.fadeTo(fadeOutDuration, 0, "linear", () => {
      $oldSubtitles.hide()
      $newSubtitles.show()
      $newSubtitles.fadeTo(fadeInDuration, 1, "linear", () => {
        animating = false
      })
    })
  } else {
    $allSubtitles.stop(true, true)
    $allSubtitles.filter(':visible').fadeTo(fadeDuration, 0, "linear", () => {
      $allSubtitles.hide()
      animating = false
    })
  }
}

function mouseEntered(e) {
  const $activeHalf = $(selectors.half, $container).filter(selectors.activeHalf).first();
  const $hoveredHalf = $(e.currentTarget);
  if (($activeHalf.length > 0)  && !$hoveredHalf.is(selectors.activeHalf)) {
    $activeHalf.addClass(classes.shrink)
  } else {
    updateSubtitle(e)
  }
}


function mouseLeft(e) {
  const $activeHalf = $(selectors.half, $container).filter(selectors.activeHalf).first();
  const $hoveredHalf = $(e.currentTarget);
  if ($activeHalf.length > 0) {
    $activeHalf.removeClass(classes.shrink)
  }
}

function didClick(e) {
  const $activeHalf = $(selectors.half, $container).filter(selectors.activeHalf).first();
  const $clickedHalf = $(e.currentTarget);
  if ($activeHalf.length > 0) {

    if(!$clickedHalf.is(selectors.activeHalf)) {
      $activeHalf.removeClass(classes.shrink);
      $activeHalf.removeClass(classes.activeHalf)
      $activeHalf.one('transitionend', () => {
        $activeHalf.removeClass(classes.front)
        if (!isTouchDevice) {
          $container.one('mousemove', selectors.half, updateSubtitle)
        }
        fadeSubtitle('');
      })
    }
  } else {
    updateSubtitle(e)
    $clickedHalf.addClass('front full-width')
    $clickedHalf.one('transitionend', () => {
      $activeHalf.removeClass(classes.front)
    })
  }
}

class CycleMedia {

  constructor(el) {
    this.$el = $(el)
    this.nextMedia = this.getNextMedia()
  }
  imageDuration() {
    return Math.floor((4 * Math.random() + 5) * 1000)
  }
  preloadImage(url) {
    var img=new Image();
    img.src=url;
  }
  cycle() {
    this.displayNextMedia()
    this.nextMedia = this.getNextMedia()
  }

  displayImage(el) {
    this.$el.children().removeClass(classes.activeMediaItem)
    $(el).addClass(classes.activeMediaItem);
    setTimeout(this.cycle.bind(this), this.imageDuration())
  }

  displayVideo(el) {
    this.$el.children().removeClass(classes.activeMediaItem)
    $(el).addClass(classes.activeMediaItem);
    $(el).one('ended', this.cycle.bind(this))
    el.play()
  }
  displayNextMedia() {
    if (this.nextMedia.matches(selectors.image)) {
      this.displayImage(this.nextMedia)
    } else if (this.nextMedia.matches(selectors.video)) {
      this.displayVideo(this.nextMedia)
    }
  }
  getNextMedia() {
    var $mediaItems = this.$el.children()
    if ($mediaItems.length > 1) {
      $mediaItems = $mediaItems.filter((index, el) => {
        if (el.matches(selectors.video) && el.readyState < 4) { return false; }
        if (el.matches(selectors.activeMediaItem)) { return false; }
        return true;
      })
    }
    const randomIndex = Math.floor(Math.random() * $mediaItems.length)
    const media = $mediaItems[randomIndex]
    if (media.matches(selectors.image)) {
      const imageSelector = `${(isDesktop() ? '.desktop' : '.mobile')} .image`
      var url = $(media).find(imageSelector).css('background-image');
      // ^ Either "none" or url("...urlhere..")
      url = /^url\((['"]?)(.*)\1\)$/.exec(url);
      url = url ? url[2] : ""; // If matched, retrieve url, otherwise ""
      this.preloadImage(url)
    } else {
      media.querySelector('source').src = media.querySelector('source').getAttribute('data-src')
    }
    return media;
  }
}

function isTouch() {
  return 'ontouchstart' in window;
}


$(document).ready(() => {
  codedBy();
  $container = $(selectors.container);
  if (!isTouchDevice) {
    $container.on('mouseenter', selectors.half, mouseEntered)
    $container.one('mousemove', selectors.half, updateSubtitle)
    $container.on('mouseleave', selectors.half, mouseLeft)
  }
  $('video', $container).each(function(index, el) {
    el.load();
  })
  $container.on('click', selectors.half, didClick)
  $(selectors.media, $container).each(function() {
    new CycleMedia(this).cycle()
  })
})