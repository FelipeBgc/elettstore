$(document).ready(function () {
  $(".productslider").slick({
    infinite: true,
    autoSlidesToShow: true,
    variableWidth: true,
    swipeToSlide: true,
    autoplay: true,
    autoplaySpeed: 2000,
    appendArrows: $(".productsliderarrow"),
    prevArrow: '<span class="material-icons arrow left">navigate_before</span>',
    nextArrow: '<span class="material-icons arrow right">navigate_next</span>'
  });
});
