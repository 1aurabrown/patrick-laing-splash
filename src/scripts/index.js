import '../styles/index.scss';
import codedBy from './coded-by'
import $ from 'jquery';

const isTouchDevice = ('ontouchstart' in window || 'onmsgesturechange' in window)
const imageDuration = 2000;
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

function updateSubtitle (e) {
  const $subtitles = $(selectors.sectionTitle, $container);
  const newTitle = e.currentTarget.getAttribute('data-title')
  if ($subtitles.html() != newTitle) {
    $subtitles.fadeOut(300)
    $subtitles.promise().done(function() {
      $subtitles.html(newTitle).fadeIn(300)
    })
  }
}

function clearSubtitles (callback) {
  const $subtitles = $(selectors.sectionTitle, $container);
  $subtitles.fadeOut(300)
  $subtitles.promise().done(function() {
    $subtitles.html('')
  })
}

function mouseEntered(e) {
  const $activeHalf = $(selectors.half, $container).filter(selectors.activeHalf);
  const $hoveredHalf = $(e.currentTarget);
  if (($activeHalf.length > 0)  && !$hoveredHalf.is(selectors.activeHalf)) {
    $activeHalf.addClass(classes.shrink)
  } else {
    updateSubtitle(e)
  }
}


function mouseLeft(e) {
  const $activeHalf = $(selectors.half, $container).filter(selectors.activeHalf);
  const $hoveredHalf = $(e.currentTarget);
  if ($activeHalf.length > 0) {
    $activeHalf.removeClass(classes.shrink)
  }

}

function didClick(e) {
  const $activeHalf = $(selectors.half, $container).filter(selectors.activeHalf);
  const $clickedHalf = $(e.currentTarget);
  if (($activeHalf.length > 0)  && !$clickedHalf.is(selectors.activeHalf)) {
    $activeHalf.removeClass(classes.shrink);
    $activeHalf.removeClass(classes.activeHalf)
    $activeHalf.one('transitionend', () => {
      $activeHalf.removeClass(classes.front)
      if (!isTouchDevice) {
        $container.one('mousemove', selectors.half, updateSubtitle)
      }
      clearSubtitles();
    })
  } else {
    if (isTouchDevice) {
      updateSubtitle(e)
    }
    $clickedHalf.addClass('front full-width')
    $clickedHalf.one('transitionend', () => {
      $activeHalf.removeClass(classes.front)
    })
  }
}

function displayImage(el, context) {
  $(el).addClass(classes.activeMediaItem);
  setTimeout(cycleMedia.bind(context), imageDuration)
}

function displayVideo(el, context) {
  $(el).addClass(classes.activeMediaItem);
  $(el).one('ended', cycleMedia.bind(context))
  el.play()
}

function cycleMedia() {
  var $mediaItems = $(this).children().filter((index, el) => {
    if (el.matches(selectors.video) && el.readyState < 4 ) { return false; }
    return true;
  })

  if ($mediaItems.length > 1) {
    $mediaItems = $mediaItems.filter((index, el) => {
      if (el.matches(selectors.activeMediaItem)) { return false; }
      return true;
    })
  }
  const randomIndex = Math.floor(Math.random() * $mediaItems.length)
  const random = $mediaItems[randomIndex];
  $(this.children).removeClass(classes.activeMediaItem)
  if (random.matches(selectors.image)) {
    displayImage(random, this)
  } else if (random.matches(selectors.video)) {
    displayVideo(random, this)
  }
}

$(document).ready(() => {
  codedBy();
  $container = $(selectors.container);
  if (!isTouchDevice) {
    $container.on('mouseenter', selectors.half, mouseEntered)
    $container.one('mousemove', selectors.half, updateSubtitle)
    $container.on('mouseleave', selectors.half, mouseLeft)
  }
  $container.on('click', selectors.half, didClick)
  $(selectors.media, $container).each(cycleMedia)
})