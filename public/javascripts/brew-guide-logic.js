$(function() {
  // Set up the guide's "state"
  var currentIndex = 0;
  var lastIndex = $('#brew-guide').find('.step').length - 1;
  var allSteps = $('#brew-guide').find('.step');

  // For when a timed step is running
  guideRunning = false;

  // Actions to listen for
  $('#brew-guide').on('click', '.step.previous', showStep);
  $('#brew-guide').on('click', '.step.next', showStep);

  function showStep(event) {
    // Get the index of the clicked quote and show it
    if ($(event.target).hasClass('step')) {
      var target = $(event.target);
    } else {
      var target = $(event.target).parents('.step');
    }
    var index = $('#brew-guide').find('.step').index(target);
    showbyIndex(index);
  }

  function showbyIndex(index) {
    // Calculates the previous and next indices, and updates the carousel
    currentIndex = index;
    // Remove any previous, current, next classes
    $('#brew-guide').find('.step.previous').removeClass('previous');
    $('#brew-guide').find('.step.current').removeClass('current');
    $('#brew-guide').find('.step.next').removeClass('next');
  
    $(allSteps[currentIndex]).addClass('current');
    addPreviousClasses(index);
    addNextClasses(index);
  }

  function addPreviousClasses(index) {
    prevSteps = 0;
    index--;
    while (index >= 0 && prevSteps < 3) {
      $(allSteps[index]).addClass('previous');
      index--;
      prevSteps++;
    }
  }

  function addNextClasses(index) {
    nextSteps = 0;
    index++;
    while (index <= lastIndex && nextSteps < 3) {
      $(allSteps[index]).addClass('next');
      index++;
      nextSteps++;
    }
  }

  // Lastly, add a listener for situations where the browser is in another tab / not visible
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      guideRunning = false;
    } else {
      guideRunning = true;
    }
  });

});

