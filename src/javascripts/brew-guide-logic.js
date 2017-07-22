$(function() {
  // Set up the guide's "state"
  var currentStep = 0;
  var lastIndex = $('#brew-guide').find('.step').length - 1;
  var allSteps = $('#brew-guide').find('.step');

  // For when a timed step is running
  autoPlay = false;
  isPlaying = false;

  // Actions to listen for
  $('#brew-guide .step.previous').click(showStep);
  $('#brew-guide .step.next').click(showStep);

  $('#brew-guide-button').click(buttonClick);

  /* Steps */

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

  function showFirstStep() {
    showbyIndex(1);
    updateButtonStatus();
  }

  function showbyIndex(index) {
    // Calculates the previous and next indices, and updates the carousel
    currentStep = index;
    // Remove any previous, current, next classes
    $('#brew-guide').find('.step.previous').removeClass('previous');
    $('#brew-guide').find('.step.current').removeClass('current');
    $('#brew-guide').find('.step.next').removeClass('next');
  
    $(allSteps[currentStep]).addClass('current');
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

  /* Actions */

  function showNextAction() {
    // Get the current action index
    var target = $(allSteps[currentStep]).find('.action.current');
    var index = $(allSteps[currentStep]).find('.action').index(target);
    showAction(index + 1);
    updateButtonStatus();
  }

  function showAction(index) {
    $(allSteps[currentStep])
      .find('.action')
      .removeClass('current');
    var nextAction = $(allSteps[currentStep]).find('.action')[index];
    $(nextAction).addClass('current');
  }

  function startTimedAction() {

  }

  /* Button */

  function buttonClick() {
    if ($('#brew-guide-button').hasClass('start')) {
      showFirstStep();
    } else if($('#brew-guide-button').hasClass('standalone')) {
      showNextAction();
    } else {
      startTimedAction();
    }
  }

  function updateButtonStatus() {
    // For the current step, is the current action a timed action
    // If not a timed action, show the skip arrow
    // If a timed section, show the play button if not currently playing
    $('#brew-guide-button')
      .removeClass('start')
      .removeClass('standalone')
      .removeClass('playing')
      .removeClass('paused');

    if (currentStep > 0) {
      // Check what the current action's class is! TODO
      var currentAction = $(allSteps[currentStep]).find('.action.current');
      if ($(currentAction).hasClass('standalone')) {
        $('#brew-guide-button').addClass('standalone');
      } else {
        if (isPlaying) {
          $('#brew-guide-button').addClass('playing');
        } else {
          $('#brew-guide-button').addClass('paused');
        }
      }
      
    }
  }

  function toggleAutoplay() {

  }

  // Lastly, add a listener for situations where the browser is in another tab / not visible
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      isPlaying = false;
    } else {
      isPlaying = true;
    }
  });

});

