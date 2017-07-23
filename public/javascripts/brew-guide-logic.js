$(function() {


  // Set up the guide's "state"
  var currentStep = getUrlVars()['step'] || 0;
  var currentAction = getUrlVars()['action'] || 0;
  var lastStep = $('#brew-guide').find('.step').length - 1;
  var allSteps = $('#brew-guide').find('.step');

  showStepbyIndex(currentStep);
  showActionByIndex(currentAction);

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
    showStepbyIndex(index);
  }

  function showFirstStep() {
    showStepbyIndex(1);
  }

  function showNextStep() {
    if (currentStep < lastStep) {
      showStepbyIndex(currentStep + 1);
    } else {
      showStepbyIndex(0);
    }
  }

  function showStepbyIndex(index) {
    // Calculates the previous and next indices, and updates the carousel
    currentStep = index;
    // Remove any previous, current, next classes
    $('#brew-guide').find('.step.previous').removeClass('previous');
    $('#brew-guide').find('.step.current').removeClass('current');
    $('#brew-guide').find('.step.next').removeClass('next');
  
    $(allSteps[currentStep]).addClass('current');
    addPreviousClasses(index);
    addNextClasses(index);
    // Save to URL
    updateURL();
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
    while (index <= lastStep && nextSteps < 3) {
      $(allSteps[index]).addClass('next');
      index++;
      nextSteps++;
    }
  }

  /* Actions */

  function showNextAction() {
    var numberOfActions = $(allSteps[currentStep]).find('.action').length;
    if (currentAction < numberOfActions) {
      currentAction++;
      showActionByIndex(currentAction);
    } else {
      // It's the last action, go to the next step and reset the action
      currentAction = 0;
      showNextStep();
    }
    updateURL();
  }

  function showActionByIndex(index) {
    $(allSteps[currentStep])
      .find('.action')
      .removeClass('current');
    var nextAction = $(allSteps[currentStep]).find('.action')[index];
    $(nextAction).addClass('current');
  }

  function startTimedAction() {
    console.log('Starting timed action');
    isPlaying = true;
    // Get the time from the current action
    // Start progressing the timer
    // Have the progress bar match the timer
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
    updateButtonStatus();
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
      var currentActionLI = $(allSteps[currentStep]).find('.action.current');
      console.log('currentActionLI: ', currentActionLI)
      console.log('currentAction: ', currentAction)
      if ($(currentActionLI).hasClass('standalone')) {
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

  function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }

  function updateURL() {
    var url = new URL(window.location.href);
    url.searchParams.set('step', currentStep);
    url.searchParams.set('action', currentAction);
    window.history.pushState('', 'Brew Guide - Step ' + currentStep, url);
  }

});

