import '../styles/index.scss';
import codedBy from './coded-by'
import $ from 'jquery';

const imageDuration = 2000;
const classes = {
  activeHalf: 'full-width',
  activeMediaItem: 'split-half__media__item--active',
  front: 'front',
  transitioning: 'transitioning'
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

function toggleSubtitle (e) {
  const $half = $(selectors.sectionTitle, $container);
  $half.html(e.currentTarget.getAttribute('data-title'))
}

function didClick(e) {
  const $activeHalf = $(selectors.half, $container).filter(selectors.activeHalf);
  const $clickedHalf = $(e.currentTarget);
  if (($activeHalf.length > 0)  && ($clickedHalf.is(`:not(${selectors.activeHalf}`))) {
    $container.addClass(classes.transitioning)
    $activeHalf.removeClass(classes.activeHalf)
    $activeHalf.one('transitionend', () => {
      $activeHalf.removeClass(classes.front)
      $container.removeClass(classes.transitioning)
    })
  } else {
    $container.addClass(classes.transitioning)
    $clickedHalf.addClass('front full-width')
    $clickedHalf.one('transitionend', () => {
      $activeHalf.removeClass(classes.front)
      $container.removeClass(classes.transitioning)
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
  const $mediaItems = $(this).children().filter((index, el) => {
    if (el.matches(selectors.activeMediaItem)) { return false; }
    if (el.matches(selectors.video) && el.readyState < 4 ) { return false; }
    return true;
  })
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
  $container.on('mouseenter', selectors.half, toggleSubtitle)
  $container.on('click', selectors.half, didClick)
  $(selectors.media, $container).each(cycleMedia)
})