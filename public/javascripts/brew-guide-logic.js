$(function() {

  // Set up the guide's "state"
  var currentStep = parseInt(getUrlVars()['step']) || 0;
  var allSteps;
  var lastStep;
  var allActions;
  var timer = 0;
  var timerTimeout;
  var timePerTick = 1000;

  if (currentStep > lastStep) {
    currentStep = 0;
  }

  // Detect if mobile
  var isMobile = false;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    isMobile = true;
  }

  // Add a "intro-animation" class to body while the bars are animating into place
  $('html').addClass('intro');
  setTimeout(function() {
    $('html').removeClass('intro');
  }, 2000);

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
    window.steps = {};

    $(brewGuide.steps).each(function(index, step) {
      // Build the steps
      var newStep = $('<li class="step"></li>');
      var stepTitle = $('<h1 class="step-title" id=step-"'+ index +'">'+ step.title +'</h1>');
      $(newStep).html(stepTitle);
      $(stepsContainer).append(newStep);

      // Add each step to a global object for animating
      //window.steps['step-' + index] = 

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
      var actionsText = $('<div class="actions-text step-'+ (parseInt(index) + 1) +'"></div>');
      $(actionsText).text(step.instruction);
      $(actionsTextContainer).append(actionsText);

      // Build the backgrounds
      if (isMobile) {
        var backgroundImage = $('<span class="step-bg step-'+ (parseInt(index) + 1) +'"></span>');
        $(backgroundImage).html('<h1 class="step-title-mobile">'+ step.title +'</h1>');
        $(backgroundImage).css('background-image', 'url("./images/' + step.mobile_illustration +'")');
      } else {
        var backgroundImage = $('<span class="step-bg step-'+ (parseInt(index) + 1) +'"><img src="./images/'+ step.illustration +'"></span>');
      }
      $(bgContainer).append(backgroundImage);

    });
    // Structure the actions
    $(actionsContainer).find('.action.timed').wrapAll('<span class="timed-area"></span>');
    // Add in the timed area decorations
    var timedAreaHTML = $('<span class="start-time timer"></span><span class="end-time timer"></span><span class="timer-bar"></span>');
    $(actionsContainer).find('.timed-area').prepend(timedAreaHTML);

    // Build the intro screen
    // Set the title
    $('.welcome-container').find('.title').find('h1').html(brewGuide.title);

    // Set the description
    $('.welcome-container').find('.description').find('p').html(brewGuide.description);

    // Set the "You'll need" content
    // coffee
    $('#amount-label').text(brewGuide.overview.amount + 'g');

    // grindText / grindValue
    //$('#grind-label').text('Coarseness: ' + brewGuide.overview.grindText);
    $('.coarseness').addClass('level-' + brewGuide.overview.grindValue);

    // temp
    $('#temp-label').html(brewGuide.overview.temp + '&deg;C');

    // water
    $('#water-label').text(brewGuide.overview.water + 'g');

    // brewTime
    $('#brewTime-label').text(brewGuide.overview.brewTime);

    // totalTime
    $('#totalTime-label').text(brewGuide.overview.totalTime);

    // cups
    $('#cups-label').text(brewGuide.overview.cups);

    // items
    var itemsList = $('#items-list');
    var delay = 1.5;
    $(brewGuide.items).each(function(index, item) {
      var newItem = $('<li class="fade-in">'+ item +'</li>');
      $(newItem).css('animation-delay', delay + 's');
      itemsList.append(newItem);
      delay += .1;
    });

  }

  function setUpInitialView(currentStep) {
    // Get the latest state since building the parts
    allSteps = $('#brew-guide').find('.step');
    lastStep = allSteps.length - 1;
    allActions = $('#actions-container').find('.action'); 

    $('#brew-guide').on('click', '.next-0', function(event) { addStepClass('next-0', event); });
    $('#brew-guide').on('click', '.next-1', function(event) { addStepClass('next-1', event); });
    $('#brew-guide').on('click', '.next-2', function(event) { addStepClass('next-2', event); });
    $('#brew-guide').on('click', '.previous', function(event) { addStepClass('previous', event); });
    $('#brew-guide').on('click', '#mob-start-button', function(event) { showStartMob(); });

    // $('.step').click(showStep);
    $('body').on('click', '.action', showByAction);
    $('.step').hover(hoverNext, hoverOut);

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

  if (isMobile) {
    setUpMobileMode();
  }

  function addStepClass(className, event) {
    $('body').removeClass().addClass('animating-' + className);
    setTimeout(function() {
      $('body').removeClass();
    }, 1100)
    showStep(event);
  }

  function isCurrentActionTimed() {
    var currentActionLI = $('#actions-container').find('.action')[currentStep];
    return $(currentActionLI).hasClass('timed');
  }

  /* Steps */

  function showStep(event) {
    // Get the index of the clicked item and show it
    if ($(event.target).hasClass('step')) {
      var target = $(event.target);
    } else {
      var target = $(event.target).parents('.step');
    }
    var index = $('#brew-guide').find('.step').index(target);
    if ($(target).hasClass('previous')) {
      $('#brew-guide').addClass('going-back');
    } else {
      $('#brew-guide').removeClass('going-back');
    }
    if (index === 0) {
      if (currentStep > 1) {
        showStepbyIndex(currentStep - 1);
      } else {
        showStart();
      }
    } else {
      $('#brew-guide').removeClass('welcome');
      showStepbyIndex(index);
    }
  }

  function showByAction(event) {
    var target = $(event.target);
    var index = $('#brew-guide').find('.action').index(target);
    setTimerBar();
    showStepbyIndex(index, 'action');
  }

  function hoverNext(event) {
    if ($(event.target).hasClass('welcome')) {
      // Do welcome hover bit
      console.log('welcome bit');
    } else if ($(event.target).hasClass('next')) {
      if ($(event.target).hasClass('step')) {
        var target = $(event.target);
      } else {
        var target = $(event.target).parents('.step');
      }
      if ($(event.target).hasClass('previous') ||
        $(event.target).hasClass('current')) {
        return;
      }
      var index = $('#brew-guide').find('.step').index(target);
      TweenLite.to($(allSteps[index]), .3, {width: '48px'});
      while (index < lastStep) {
        index++;
        $(allSteps[index]).addClass('shift-right');
        shiftRight();
      }
    }
  }

  function shiftRight() {
    TweenLite.to($('.shift-right'), .3, {left: '10'});
  }

  function unShiftRight() {
    TweenLite.to($('.shift-right'), .3, {left: '0'});
  }

  function hoverOut() {
    unShiftRight();
    $(allSteps).removeClass('shift-right');
    if ($(event.target).hasClass('step')) {
      var target = $(event.target);
    } else {
      var target = $(event.target).parents('.step');
    }
    var index = $('#brew-guide').find('.step').index(target);
    TweenLite.to($(allSteps[index]), .3, {width: '38px'});
  }

  function hoverPrev() {
    TweenLite.to($('.previous'), .2, {width: '38px', left: -10});
  }

  function hoverPrevOut() {
    TweenLite.to($('.previous'), .2, {width: '16px', left: 0});
  }

  function showStart() {
    // Remove any current actions 
    $(allActions[currentStep]).removeClass('current');
    // Reset the visible timer
    $('.start-time').text(formatTime(0));
    $('#brew-guide').addClass('welcome');
    if (isMobile) {
      // Scroll to top 
      window.isScrolling = true;
      $('body').scrollTo(0, 1000);
      setTimeout(function() {
          window.isScrolling = false;
        }, 1200);
    }
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

  function showStartMob() {
    scrollTime = 1000;
    window.isScrolling = true;
    $('body').scrollTo($('.step-bg')[0], scrollTime);
    setTimeout(function() {
      window.isScrolling = false;
    }, scrollTime + 100);
  }

  function showStepbyIndex(index, action) {
    // Calculates the previous and next indices, and updates the carousel
    var direction;
    if (index === (currentStep + 1)) {
      direction = 'next';
    } else if (currentStep > index) {
      direction = 'prev';
    } else {
      action = 'skip';
    }
    currentStep = index;
    if (currentStep > 0) {
      // Activate the actions bar
      $('.brew-guide').removeClass('welcome');
    } else {
      $('.brew-guide').addClass('welcome');
    }
    // Remove any previous, current, next classes
    removePreviousNextClasses();

    $(allSteps[currentStep]).addClass('current');
    addPreviousClasses(index);
    addNextClasses(index);
    showCurrentAction(index);
    showCurrentContent();
    updateTimeOnPage(timeToSpecificStep(index));
    setTimerBar();
    updateButtonStatus();
    updateAutoPlayVisibility(index);
    if (!isMobile && !action) {
      animateSteps(direction);
    } else {
      setTimeout(function() {
        clearStepStyles();
      }, 100);
    }
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

  function animateSteps(direction) {
    // Register the next and prev step items 
    var $welcomeStep = $('.steps').find('[data-step=welcome]');
    var $prevStep = $('.steps').find('.previous').last();
    var $next0 = $('.steps').find('.next-0');
    var $next1 = $('.steps').find('.next-1');
    var $next2 = $('.steps').find('.next-2');
    var $moreNext = $('.steps').find('.more-next');
    $('.steps').find('.step-title').attr('style', '');
    var $moreNextText = $('.steps').find('.more-next').find('.step-title');

    var easing = Expo.easeOut;
    var duration = 0.8;
    if (direction === 'next') {
      // Going right to left
      if (currentStep === 1) {
        $('.steps').find('.previous').hide();
        $($welcomeStep).show();
        // Showing the "welcome" previous step
        TweenLite.fromTo($welcomeStep, duration,
          {x: 38, width: '35.5px', background: '#ed764f'},
          {x: -17, delay: .5, width: '18px', background: '#ef8661', ease:easing}
        );
      } else {
        TweenLite.fromTo($prevStep, duration,
          {x: -2, width: '35.5px', delay: .5, background: '#ed764f', left: 0},
          {x: -17, delay: .5, width: '18px', background: '#ef8661', ease:easing}
        );
      }
      TweenLite.fromTo($(allSteps[currentStep]), duration, {x: 643, background: '#ef8661'}, {x: 610, width: '35.5px', ease:easing, background: '#ed764f'});
      TweenLite.fromTo($(allSteps[currentStep]), duration, {x: 32, background: '#ed764f', delay: .5}, {x: -2, delay: .5, background: '#ed764f', ease:easing});
      TweenLite.fromTo($next0, duration, {x: 677}, {left: 0, x: 642, background: '#ed764f', width: '35.5px', ease:easing});
      TweenLite.fromTo($next1, duration, {x: 712}, {left: 0, x: 677, background: '#ef8661', width: '35.5px', ease:easing});
      TweenLite.fromTo($next2, duration, {x: 748, autoAlpha: 0}, {left: 0, x: 712, autoAlpha: 1, background: '#f19572', width: '35.5px', ease:easing});
    } else if (direction === 'prev') {
      // Going left to right
      TweenLite.to($('.previous'), .2, {width: '38px', x: -17, ease:easing});
      TweenLite.fromTo($(allSteps[currentStep]), duration,
        {x: -17, width: '30px', background: '#ef8661'},
        {x:-2, width: '35.5px', background: '#ed764f', ease:easing}
      );
      TweenLite.fromTo($next0, duration, {x: -2}, {x: 32, ease:easing, left: 0});
      TweenLite.fromTo($next0, duration, {x: 612, delay: .5}, {x: 643, delay: .5, background: '#ed764f', width: '35.5px', ease:easing});
      TweenLite.fromTo($next1, duration, {x: 642, delay: .5}, {x: 677, delay: .5, background: '#ef8661', width: '35.5px', ease:easing});
      TweenLite.fromTo($next2, duration, {x: 677, delay: .5}, {x: 712, delay: .5, background: '#f19572', width: '35.5px', ease:easing});
      TweenLite.fromTo($moreNext, duration, {background: '#f19572', width: '35.5px', x: 712, delay: duration / 1.5}, {background: '#f19572', width: '35.5px', x: 748, ease:easing, delay: duration / 1.5});
      $($moreNext).addClass('fade-out-delayed');
      setTimeout(function() {
        $($moreNext).removeClass('fade-out-delayed');
      }, 1000);
      TweenLite.to($moreNext, duration, {autoAlpha: 0, delay: duration / 2.5});
      TweenLite.to($moreNextText, duration, {autoAlpha: 0, ease:easing, delay: duration});
    }
    // setTimeout(function() {
    //   clearStepStyles();
    // }, duration * 1000);
  }

  function clearStepStyles() {
    $('.steps').find('.step').attr('style', '');
    $('.steps').find('.step-title').attr('style', '');
  }

  function updateAutoPlayVisibility(index) {
    if (!$(allActions[index]).hasClass('timed')) {
      $('.autoplay-container').addClass('hidden');
    } else {
      $('.autoplay-container').removeClass('hidden');
    }
  } 

  function removePreviousNextClasses() {
    $('#brew-guide').find('.step').attr('class', 'step');
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
        .addClass('previous-' + (positionTarget - positionIndex));
      index--;
      prevSteps++;
      positionIndex++;
    }
    if (index >= 0) {
      while (index >= 0) {
        $(allSteps[index])
          .addClass('more-previous');
        index--;
      }
    }
    // Add a class to body so that I can position the button etc based on how many prev items
    $('html').attr('data-prev', prevSteps);
    //$('.step.previous').hover(hoverPrev, hoverPrevOut);
  }

  function addPreviousClass(index) {
    if (index > 0) {
      positionTarget = index - 1;
    } else {
      return;
    }
    $(allSteps[positionTarget]).addClass('previous');
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
        .addClass('next-' + nextSteps);
      index++;
      nextSteps++;
    }
    $(allSteps[index]).addClass('more-next');
    $(allSteps[index]).attr('style', '');
    $('html').attr('data-next', nextSteps);
  }

  function showCurrentContent() {
    $('.step-bg.current').addClass('hide').removeClass('current');
    $('.actions-text').removeClass('current');
    setTimeout(function() {
      var currentBg = $('.step-' + [currentStep]);
      $('.step-bg').removeClass('hide');
      $(currentBg).addClass('current');
    }, 500);
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
        if (timer <= 6) {
          $('.button-border-bg').addClass('countdown');
        } else{
          $('.button-border-bg').removeClass('countdown');
        }
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
    if ($(allActions).index($(allActions[currentStep])) === ($(allActions).length - 1)) {
      currentTimedActions = $('.timed-area').find('.action');
    }
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
    return timeElapsed;
  }

  function timeToSpecificStep() {
    var timedActions = $('.timed-area').find('.action');
    var index = $(timedActions).index($(allActions[currentStep]));
    var totalTime = 0;
    $(timedActions).each(function(i, action) {
      if (i < index || index < 0) {
        totalTime += parseInt($(action).attr('data-time'));
      }
    });
    return totalTime;
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
    } else if ($(allActions).index($(allActions[currentStep])) === ($(allActions).length - 1)) {
      // This is the last item
      currentTimedActions = $('.timed-area').find('.action');
      var timerArea = $('.timed-area');
      var timerBar = $(timerArea).find('.timer-bar');
      // Get position of first timed action in this timer area
      var firstTimedAction = $(timerArea).find('.action')[0];
      var currentAction = $(allActions)[$(allActions).length - 1];
      // Get difference between them
      var distance = getDistanceBetweenActions(firstTimedAction, currentAction);
      // Set width to that difference
      $(timerBar).css('width', distance + 'px');
      // hide the end time
      hideEndTime();
      updateStartTimePosition(distance);
    } else if ($(allActions[currentStep]).hasClass('standalone')) {
      // Reset the bar position entirely
      $('.start-time').text(formatTime(0));
      $('.start-time').removeClass('new-end-time');
      showEndTime();
      $('.timer-bar').css('width', 0);
      updateStartTimePosition(0);
    } else {
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
    if (!$('.end-time').hasClass('hidden')) {
      if (startTimeRightEdge > endTimeLeftEdge) {
        hideEndTime();
      }
      if (startTimeLeftEdge >= endTimeLeftEdge && startTimeLeftEdge > 0) {
        placeStartTimeOnEndTime();
      }
    } else {

    }
  }

  function showEndTime() {
    $('.end-time').removeClass('hidden');
    $('.end-time').css('opacity', 1);
  }

  function hideEndTime() {
    $('.end-time').addClass('hidden');
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
    $('#brew-guide').removeClass('going-back');
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
    if (currentStep > 0 && !isMobile) {
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

  function setUpMobileMode() {
    updateStepOnScrolling();
    correctStepBackgroundOnScrollEnd();
  }

  function updateStepOnScrolling() {

    var elementsToShow = document.querySelectorAll('.step-bg'); 
    var shown = false;

    $(window).scroll(function() {
      if (currentStep > 0) {
        // Activate the actions bar
        $('.brew-guide').removeClass('welcome');
      } else {
        $('.brew-guide').addClass('welcome');
      }
      if (!window.isScrolling) {
        var visible = [];
        elementsToShow.forEach(function (element) {
          if (isElementInViewport(element)) {
            visible.push(element);
          }
        });
        var closestElement = {};
        visible.forEach(function(element, index) {
          // Show whichever one is most visible
          var offset = $(element).offset();
          var height = $(element).height();
          var centerY = offset.top + height / 2;
          var screenCenterY = $(window).scrollTop() + ($(window).height() / 2);
          var distance = centerY - screenCenterY;
          if (distance < 0) distance = 1 - distance;
          if (distance < closestElement.distance || !closestElement.distance) {
            closestElement.element = element;
            closestElement.distance = distance;
          }
        });
        var targetStep = $(elementsToShow).index($(closestElement.element)) + 1;
        if ((currentStep != targetStep && !shown) || (currentStep === 0 && !shown)) {
          showStepbyIndex(targetStep);
          currentStep = targetStep;
          shown = true;
        } else {
          shown = false;
        }
      }
    });
  }

  function correctStepBackgroundOnScrollEnd() {

    // Setup isScrolling variable
    var isScrolling;

    // Listen for scroll events
    window.addEventListener('scroll', function ( event ) {
      if (!window.isScrolling) {
        // Clear our timeout throughout the scroll
        window.clearTimeout( isScrolling );

        // Set a timeout to run after scrolling ends
        isScrolling = setTimeout(function() {

          scrollTime = 0;
          if (currentStep === 1) {
            scrollTime = 1000;
          } else if (currentStep > 0) {
            scrollTime = 600;
          }
          if (scrollTime) {
            window.isScrolling = true;
            $('body').scrollTo($('.step-bg')[currentStep - 1], scrollTime);
            setTimeout(function() {
              window.isScrolling = false;
            }, scrollTime + 100);
          }

        }, 266);
      }

    }, false);

  }

  // Helper function from: http://stackoverflow.com/a/7557433/274826
  function isElementInViewport(el) {
    // special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
      el = el[0];
    }
    var rect = el.getBoundingClientRect();
    var height = window.innerHeight || document.documentElement.clientHeight;
    return (
      (rect.top <= 0
        && rect.bottom >= 0)
      ||
      (rect.bottom >= (height) &&
        rect.top <= (height))
      ||
      (rect.top >= 0 &&
        rect.bottom <= (height))
    );
  }

});

