$(function() {

  // Set up the guide's "state"
  var currentStep = parseInt(getUrlVars()['step']) || 0;
  var allSteps;
  var lastStep;
  var allActions;
  var timer = 0;
  var timerTimeout;
  var timePerTick = 100;

  if (currentStep > lastStep) {
    currentStep = 0;
  }

  // For when a timed step is running
  var autoPlay = false;
  var isPlaying = false;

  $('#brew-guide-button').click(buttonClick);
  $('#autoplay').change(toggleAutoplay);

  if (brewGuide) {
    drawBrewGuideHTML(brewGuide);
    setUpInitialView(currentStep);
  } else {
    alert('Missing Brew Guide definition');
  }

  function drawBrewGuideHTML() {
 
    var stepsContainer = $('.steps');
    var actionsContainer = $('.actions');
    var actionsTextContainer = $('.actions-text-container');
    var bgContainer = $('.step-bg-container');

    $(brewGuide.steps).each(function(index, step) {
      // Build the steps
      var newStep = $('<li class="step"></li>');
      var stepTitle = $('<h1 class="step-title">'+ step.title +'</h1>');
      $(newStep).html(stepTitle);
      $(stepsContainer).append(newStep);

      // Build the actions
      var newAction = $('<li class="action"></li>');
      if (step.time > 0) {
        $(newAction)
          .addClass('timed')
          .attr('data-time', step.time);
      } else {
        $(newAction).addClass('standalone');
      }
      $(actionsContainer).append(newAction);

      // Build the actions text
      var actionsText = $('<span class="actions-text step-'+ (parseInt(index) + 1) +'"></span>');
      $(actionsText).text(step.instruction);
      $(actionsTextContainer).append(actionsText);

      // Build the backgrounds
      var backgroundImage = $('<span class="step-bg step-'+ (parseInt(index) + 1) +'"><img src="/images/'+ step.illustration +'"></span>');
      $(bgContainer).append(backgroundImage);

    });
    // Structure the actions
    $(actionsContainer).find('.action.timed').wrapAll('<span class="timed-area"></span>');
    // Add in the timed area decorations
    var timedAreaHTML = $('<span class="start-time timer"></span><span class="end-time timer"></span><span class="timer-bar"></span>');
    $(actionsContainer).find('.timed-area').prepend(timedAreaHTML);

    // Build the intro screen
    //TODO

  }

  function setUpInitialView(currentStep) {
    // Get the latest state since building the parts
    allSteps = $('#brew-guide').find('.step');
    lastStep = allSteps.length - 1;
    allActions = $('#actions-container').find('.action'); 

    showStepbyIndex(currentStep);
    showCurrentAction(currentStep);
    updateButtonStatus();
    updateTimeOnPage(timeElapsed());
    calculateTotalTimes();
    setDotWidths();
    setTimerBar();
    if (currentStep > 0) {
      showActions();
      $('#brew-guide').removeClass('welcome');
    } else {
      $('#brew-guide').addClass('welcome');
    }
  }

  function isCurrentActionTimed() {
    var currentActionLI = $('#actions-container').find('.action')[currentStep];
    return $(currentActionLI).hasClass('timed');
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
    $('#brew-guide').addClass('welcome');
    showStepbyIndex(0);
    hideActions();
    resetTimerBar();
    currentStep = 0;
    updateURL();
  }

  function showFirstStep() {
    showStepbyIndex(1);
    $('#brew-guide').removeClass('welcome');
    showActions();
  }

  function showNextStep() {
    if (currentStep < lastStep) {
      currentStep++;
    } else {
      currentStep = 0;
    }
    showStepbyIndex(currentStep);
  }

  function showStepbyIndex(index) {
    // Calculates the previous and next indices, and updates the carousel
    currentStep = index;
    // Remove any previous, current, next classes
    removePreviousNextClasses();
  
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
    if (isCurrentActionTimed() && autoPlay && currentStep < lastStep) {
      buttonClick();
    } else {
      isPlaying = false;
    }
  }

  function removePreviousNextClasses() {
    $('#brew-guide').find('.step').attr('class', 'step')
  }

  function addPreviousClasses(index) {
    prevSteps = 0;
    index--;
    positionIndex = 0;
    if (index > 2) {
      positionTarget = 2;
    } else {
      positionTarget = index;
    }
    while (index >= 0 && prevSteps < 3) {
      $(allSteps[index])
        .addClass('previous')
        .addClass('bg-' + (3 - prevSteps))
        .addClass('position-' + (positionTarget - positionIndex));
      index--;
      prevSteps++;
      positionIndex++;
    }
  }

  function addNextClasses(index) {
    nextSteps = 0;
    index++;
    positionIndex = 0;
    if (lastStep - index < 2) {
      positionTarget = lastStep - index;
    } else {
      positionTarget = 2;
    }
    while (index <= lastStep && nextSteps < 3) {
      $(allSteps[index])
        .addClass('next')
        .addClass('bg-' + nextSteps)
        .addClass('position-' + (positionTarget - nextSteps));
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

  /* Actions */

  function showActions() {
    $('#actions-container').css('opacity', '1');
  }

  function hideActions() {
    $('#actions-container').css('opacity', '0');
  }

  function showCurrentAction() {
    $(allActions).removeClass('current');
    $(allActions[currentStep]).addClass('current');
  }

  function startTimedAction() {
    isPlaying = true;
    if (!timer) {
      timer = parseInt($(allActions[currentStep]).data('time')); // Seconds
    }
    countdownTimer();
  }

  function pauseTimedAction() {
    isPlaying = false;
    clearTimeout(timerTimeout);
    updateButtonStatus();
  }

  function countdownTimer() {
    if (timer > 0 && isPlaying) {
      timerTimeout = setTimeout(function() {
        timer--;
        var timeSoFar = timeElapsed();
        updateTimeOnPage(timeSoFar);
        updateTimerBarWidth(timer);
        countdownTimer();
      }, timePerTick);
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
      $(timedArea).attr('data-totalTime', totalTime);
      $(timedArea).find('.end-time').text(formatTime(totalTime));
    });
  }

  function timeElapsed() {
    var currentTimedActions = $(allActions[currentStep]).parents('.timed-area').find('.action');
    var timeElapsed = 0;
    $(currentTimedActions).each(function(index, action) {
      if (!$(action).hasClass('current')) {
        timeElapsed += parseInt($(action).attr('data-time'));
      } else {
        if (timer >= 0) {
          timeElapsed += parseInt($(action).attr('data-time')) - timer;
        }
        return false;
      }
    });
    return timeElapsed;
  }

  function updateTimeOnPage(timeSoFar) {
    $('.start-time').text(formatTime(timeSoFar));
  }

  function setTimerBar() {
    // Get the elapsed time so far
    if ($(allActions[currentStep]).hasClass('timed')) {
      var timerArea = $(allActions[currentStep]).parents('.timed-area');
      var timerBar = $(timerArea).find('.timer-bar');
      // Get position of first timed action in this timer area
      var firstTimedAction = $(timerArea).find('.action')[0];
      var currentAction = $(allActions[currentStep])[0];
      // Get difference between them
      var distance = getDistanceBetweenActions(firstTimedAction, currentAction);
      // Set width to that difference
      $(timerBar).css('width', distance + 'px');
      updateStartTimePosition(distance);
    } else{
      updateStartTimePosition(0);
    }
  }

  function getDistanceBetweenActions(start, current) {
    return absolutePosition(current).left - absolutePosition(start).left;
  }

  function resetTimerBar() {
    $('.start-time').text(formatTime(0));
    $('.start-time').removeClass('new-end-time');
    showEndTime();
    $('.timer-bar').css('width', 0);
    setTimerBar();
  }

  function updateTimerBarWidth(time) {
    var timerArea = $(allActions[currentStep]).parents('.timed-area');
    var timerBar = $(timerArea).find('.timer-bar');

    var firstTimedAction = $(timerArea).find('.action')[0];
    var currentAction = $(allActions[currentStep])[0];
    var distanceToStartOfCurrentAction = getDistanceBetweenActions(firstTimedAction, currentAction);

    var nextAction = $(allActions[currentStep + 1])[0];
    var distanceToStartOfNextAction = getDistanceBetweenActions(currentAction, nextAction);

    var currentActionTime = parseInt($(currentAction).attr('data-time'));
    if (!currentActionTime) {
      return;
    }
    var increments = distanceToStartOfNextAction / currentActionTime;
    var distance = distanceToStartOfCurrentAction + (increments * (currentActionTime - time))
    $(timerBar).css('width', distance + 'px');
    updateStartTimePosition(distance);
  }

  function updateStartTimePosition(distance) {
    $('.start-time').css('left', distance - 2 + 'px');
    var timerArea = $(allActions[currentStep]).parents('.timed-area');
    var rightBound = absolutePosition(
        $(allActions[currentStep]).parents('.timed-area')[0]
      ).right;
    var startTimeRightEdge = absolutePosition(
      $('.start-time')[0]
      ).right;
    var startTimeLeftEdge = absolutePosition(
      $('.start-time')[0]
      ).left;
    var endTimeLeftEdge = absolutePosition(
      $('.end-time')[0]
      ).left;
    if (startTimeRightEdge > endTimeLeftEdge) {
      hideEndTime();
    }
    if (startTimeLeftEdge >= endTimeLeftEdge && startTimeLeftEdge > 0) {
      placeStartTimeOnEndTime();
    }
  }

  function showEndTime() {
    $('.end-time').css('opacity', 1);
  }

  function hideEndTime() {
    $('.end-time').css('opacity', 0);
  }

  function placeStartTimeOnEndTime() {
    hideEndTime();
    $('.start-time').addClass('new-end-time');
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

  function absolutePosition(el) {
    var
          found,
          left = 0,
          top = 0,
          width = 0,
          height = 0,
          offsetBase = absolutePosition.offsetBase;
      if (!offsetBase && document.body) {
          offsetBase = absolutePosition.offsetBase = document.createElement('div');
          offsetBase.style.cssText = 'position:absolute;left:0;top:0';
          document.body.appendChild(offsetBase);
      }
      if (el && el.ownerDocument === document && 'getBoundingClientRect' in el && offsetBase) {
          var boundingRect = el.getBoundingClientRect();
          var baseRect = offsetBase.getBoundingClientRect();
          found = true;
          left = boundingRect.left - baseRect.left;
          top = boundingRect.top - baseRect.top;
          width = boundingRect.right - boundingRect.left;
          height = boundingRect.bottom - boundingRect.top;
      }
      return {
          found: found,
          left: left,
          top: top,
          width: width,
          height: height,
          right: left + width,
          bottom: top + height
      };
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
      if (isPlaying) {
        pauseTimedAction();
      } else {
        startTimedAction();
      }
      
    }
    updateButtonStatus();
  }

  function updateButtonStatus() {
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

  /* Play / pause */

  function togglePlayPause() {
    isPlaying = isPlaying ? false : true;
  }

  /* Autoplay */

  function toggleAutoplay() {
    autoPlay = autoPlay ? false : true;
    if (isCurrentActionTimed() && !isPlaying) {
      // Keep it playing
      buttonClick();
    }
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
    if (currentStep > 0) {
      var url = new URL(window.location.href);
      url.searchParams.set('step', currentStep);
      window.history.pushState('', 'Brew Guide - Step ' + currentStep, url);
    } else {
      var url = new URL(window.location.href.split("?")[0]);
      window.history.pushState('', 'Brew Guide' + currentStep, url);
    }
  }

  /* Draw the dot widths on load */

  function setDotWidths() {
    // Get the width of each timed area
    $('.timed-area').each(function(index, timedArea) {
      var timedAreaWidth = $(timedArea).width();
      var totalTime = $(timedArea).attr('data-totalTime');
      $(timedArea).find('.action.timed').each(function(index, action) {
        var actionTime = $(action).attr('data-time');
        if (actionTime > 0) {
          var actionWidth = (actionTime / totalTime) * timedAreaWidth;
          $(action).css('width', actionWidth);
        }
      });
    });
  }

});

