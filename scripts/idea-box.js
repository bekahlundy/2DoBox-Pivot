var count = 0;

var qualityArray = ['swill', 'plausible', 'genius'];

var titleField = $('.title-field');
var bodyField = $('.body-field');
var inputFields = $('.title-field, .body-field');
var ideaList = $('.idea-list');
var saveButton = $('.save-button');
var searchField = $('.search-bar');
var errorMsg = $('.error-msg');


titleField.focus();
saveButton.attr('disabled', true);

function Idea() {
  this.id = id;
  this.title = title;
  this.body = body;
  this.quality = quality;
}

saveButton.on('click', function () {
  var title = titleField.val();
  var body = bodyField.val();
  addCardToList(title, body);
  titleField.focus();
  clearInput();
});

function addCardToList(title, body) {
  var quality = qualityArray[0];
  var newCard =
    $(`<article class="card" id="card-${count}">
      <h2 class="card-title">${title}</h2>
      <input class="card-button delete" type="button" name="name" value="">
      <p class="card-body">${body}</p>
      <input class="card-button upvote" type="button" name="name" value="">
      <input class="card-button downvote" type="button" name="name" value="">
      <div class="card-quality">quality: <span class="quality-value">${quality}</span></div>
    </article>`).hide().fadeIn('normal');
  ideaList.prepend(newCard);
  count++;
}

function clearInput() {
  titleField.val('');
  bodyField.val('');
}

ideaList.on('click', '.delete', function () {
  $(this).parent().fadeOut('normal', function () {
    $(this).remove();
  });
});

ideaList.on('click', '.upvote', function () {
  var qualityValue = $(this).parent().find('.quality-value').text();
  var newQualityString= changeQuality(qualityValue, 'up');
  $(this).parent().find('.quality-value').text(newQualityString);

});

ideaList.on('click', '.downvote', function () {
  var qualityValue = $(this).parent().find('.quality-value').text();
  var newQualityString = changeQuality(qualityValue, 'down');
  $(this).parent().find('.quality-value').text(newQualityString);

});

function changeQuality(qualityString, direction) {
  var qualityIndex = qualityArray.indexOf(qualityString);
  var newQualityIndex = qualityIndex;

  if (direction === 'up') {
    if (qualityIndex !== 2) {
      newQualityIndex = qualityIndex + 1;
    }
  } else {
    if (qualityIndex !== 0) {
      newQualityIndex = qualityIndex - 1;
    }
  }

  return qualityArray[newQualityIndex];
}

inputFields.on('blur keypress', function () {

  var titleString = $('.title-field').val();
  var bodyString = $('.body-field').val();
  updateSaveButtonStatus(titleString, bodyString);

});

function stringIsEmpty(string) {
  return string.length === 0 || (/^(\s)*$/g).test(string);
}

// click the create-button when user hits enter key
inputFields.keypress(function(event){
  if (event.which == 13) {
    if (saveButton.attr('disabled')) {
      displayError();
    } else {
      saveButton.click();
    }
  }
});


function updateSaveButtonStatus(titleString, bodyString) {
  var titleEmpty = stringIsEmpty(titleString);
  var bodyEmpty = stringIsEmpty(bodyString);

  if (bodyEmpty || titleEmpty) {
    saveButton.attr('disabled', true);
  } else if (!bodyEmpty && !titleEmpty) {
    hideError();
    saveButton.attr('disabled', false);
  }
}

function displayError() {
  errorMsg.css('opacity', '.75');
  errorMsg.css('transition-duration', '.5s');
};

function hideError() {
  errorMsg.css('opacity', '0');
  errorMsg.css('transition-duration', '.5s');
};
