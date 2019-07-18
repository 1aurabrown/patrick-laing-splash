import './styles/index.scss';
import $ from 'jquery';

const classes = {
  active: 'full-width',
  front: 'front',
  transitioning: 'transitioning'
}
const selectors = {
  container: '.split',
  half: '.split-half',
  sectionTitle: '.js-section-title',
  active: `.${classes.active}`,
}
$(document).ready(() => {
  const $container = $(selectors.container);
  $container.on('mouseenter', selectors.half, (e) => {
    const $half = $(selectors.sectionTitle, $container);
    $half.html(e.currentTarget.getAttribute('data-title'))
  })

  $container.on('click', selectors.half, (e) => {
    const $activeHalf = $(selectors.half, $container).filter(selectors.active);
    $container.addClass(classes.transitioning)
    if ( $activeHalf.length > 0 ) {
      $activeHalf.removeClass(classes.active)
      $activeHalf.one('transitionend', () => {
        $activeHalf.removeClass(classes.front)
        $container.removeClass(classes.transitioning)
      })
    } else {
      let $clickedHalf = $(e.currentTarget);
      $clickedHalf.addClass('front full-width')
      $clickedHalf.one('transitionend', () => {
        $activeHalf.removeClass(classes.front)
        $container.removeClass(classes.transitioning)
      })
    }
  })
})