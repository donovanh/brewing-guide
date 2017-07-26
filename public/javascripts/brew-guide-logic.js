$(function() {


  // Set up the guide's "state"
  var currentStep = parseInt(getUrlVars()['step']) || 0;
  var allSteps = $('#brew-guide').find('.step');
  var lastStep = allSteps.length - 1;
  var allActions = $('#actions-container').find('.action');
  var timer = 0;

  if (currentStep > lastStep) {
    currentStep = 0;
  }

  // For when a timed step is running
  var autoPlay = false;
  var isPlaying = false;

  setUpInitialView(currentStep);

  // Actions to listen for
  // $('#brew-guide .step.previous').click(showStep);
  // $('#brew-guide .step.next').on('click', showStep);

  $('#brew-guide-button').click(buttonClick);

  function setUpInitialView(currentStep) {
    showStepbyIndex(currentStep);
    showCurrentAction(currentStep);
    updateButtonStatus();
    updateTimeOnPage();
    calculateTotalTimes();
    if (currentStep > 0) {
      showActions();
    }
  }

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

  function showStart() {
    // Remove any current actions 
    $(allActions[currentStep]).removeClass('current');
    // Reset the visible timer
    $('.start-time').text(formatTime(0));
    showStepbyIndex(0);
    hideActions();
  }

  function showFirstStep() {
    showStepbyIndex(1);
    showActions();
  }

  function showNextStep() {
    if (currentStep < lastStep) {
      currentStep++;
    } else {
      // TODO: Show a "done / restart" option here
      // ALso, a way to go back through steps would be good 
      currentStep = 0;
    }
    showStepbyIndex(currentStep);
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
    showCurrentAction(index);
    showCurrentContent();
    updateButtonStatus();
    // Save to URL
    updateURL();
    if (currentStep > 0) {
      showActions();
    }
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

  function showCurrentContent() {
    $('.step-bg').removeClass('current');
    $('.actions-text').removeClass('current');
    var currentBg = $('.step-' + [currentStep]);
    $(currentBg).addClass('current');
  }

  function showCurrentBackground() {
    
  }

  /* Actions */

  function showActions() {
    $('#actions-container').css('display', 'block');
  }

  function hideActions() {
    $('#actions-container').css('display', 'none');
  }

  function showCurrentAction() {
    $(allActions).removeClass('current');
    $(allActions[currentStep]).addClass('current');
  }

  function startTimedAction() {
    isPlaying = true;
    timer = parseInt($(allActions[currentStep]).data('time')); // Seconds
    // Set a timeout for 1 second to progress the timer until empty or paused
    countdownTimer();
    // Have the progress bar match the timer
  }

  function countdownTimer() {
    if (timer > 0 && isPlaying) {
      setTimeout(function() {
        timer--;
        countdownTimer();
        updateTimeOnPage();
      }, 100);
    } else if (isPlaying) {
      // Go to the next step
      isPlaying = false;
      showNextStep();
    }
  }

  function calculateTotalTimes() {
    var timedAreas = $('.timed-area').each(function(index, timedArea) {
      var timedActions = $(timedArea).find('.action');
      var totalTime = 0;
      $(timedActions).each(function(index, action) {
        totalTime += parseInt($(action).attr('data-time'));
      });
      $(timedArea).find('.end-time').text(formatTime(totalTime));
    });
  }

  function updateTimeOnPage() {
    // Work out how much time has elapsed, make sure the timeElapsed variable is right
    var currentTimedActions = $(allActions[currentStep]).parents('.timed-area').find('.action');
    var timeElapsed = 0;
    $(currentTimedActions).each(function(index, action) {
      if (!$(action).hasClass('current')) {
        timeElapsed += parseInt($(action).attr('data-time'));
      } else {
        if (timer > 0) {
          timeElapsed += parseInt($(action).attr('data-time')) - timer;
        }
        return false;
      }
    });
    $(allActions[currentStep]).parents('.timed-area').find('.start-time').text(formatTime(timeElapsed));
  }

  function formatTime(input) {
      var sec_num = parseInt(input, 10);
      var minutes = Math.floor(sec_num / 60);
      var seconds = sec_num - (minutes * 60);
      return minutes+':'+pad(seconds, 2);
  }

  function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  }

  /* Button */

  function buttonClick() {
    if ($('#brew-guide-button').hasClass('start')) {
      showFirstStep();
    } else if($('#brew-guide-button').hasClass('standalone')) {
      showNextStep();
    } else if($('#brew-guide-button').hasClass('end')) {
      showStart();
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
      .removeClass('paused')
      .removeClass('end');

    if (currentStep > 0 && currentStep < lastStep) {
      var currentActionLI = $('#actions-container').find('.action')[currentStep];
      if ($(currentActionLI).hasClass('standalone')) {
        $('#brew-guide-button').addClass('standalone');
      } else {
        if (isPlaying) {
          $('#brew-guide-button').addClass('playing');
        } else {
          $('#brew-guide-button').addClass('paused');
        }
      }     
    } else if (currentStep === lastStep) {
      $('#brew-guide-button').addClass('end');
    } else {
      $('#brew-guide-button').addClass('start');
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
    window.history.pushState('', 'Brew Guide - Step ' + currentStep, url);
  }

});

