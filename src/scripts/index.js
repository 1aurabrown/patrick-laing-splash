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

function imageDuration() {
  return Math.floor((3 * Math.random() + 2) * 1000)
}

function updateSubtitle (e) {
  const newTitle = e.currentTarget.getAttribute('data-title')
  fadeSubtitle(newTitle)
}

function fadeDuration(text) {
  if (text.length > 0) {
    return 300
  } else {
    return 0
  }
}

function fadeSubtitle(newTitle) {
  const $subtitles = $(selectors.sectionTitle, $container);
  const oldTitle = $subtitles.html();
  if ( oldTitle == newTitle) { return }

  const fadeInDuration = fadeDuration(newTitle)
  const fadeOutDuration = fadeDuration(oldTitle)

  $subtitles.stop().fadeTo(fadeOutDuration, 0, "linear")
  $subtitles.promise().done(function() {
    $subtitles.html(newTitle)
    $subtitles.fadeTo(fadeInDuration, 1, "linear")
  })
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

function displayImage(el, context) {
  $(el).addClass(classes.activeMediaItem);
  setTimeout(cycleMedia.bind(context), imageDuration())
}

function displayVideo(el, context) {
  $(el).addClass(classes.activeMediaItem);
  $(el).one('ended', cycleMedia.bind(context))
  el.play()
}

function cycleMedia() {
  var $mediaItems = $(this).children().filter((index, el) => {
    if (el.matches(selectors.video)  ) { return false; }
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
  // codedBy();
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
  $(selectors.media, $container).each(cycleMedia)
})