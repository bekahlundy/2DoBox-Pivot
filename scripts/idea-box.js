if(localStorage.getItem('count') === null) {
  var count = 0;
  localStorage.setItem('count', count);
} else {
  var count = localStorage.getItem('count');
}


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

getSavedCards();

function Card(count, title, body) {
  this.id = count;
  this.title = title;
  this.body = body;
  this.quality = 0;
}

saveButton.on('click', function () {
  var title = titleField.val();
  var body = bodyField.val();
  var newCardData = new Card(count, title, body);
  saveCard(newCardData);
  addCardToList(newCardData.id, newCardData.title, newCardData.body, 0);
  titleField.focus();
  clearInput();
});

function addCardToList(id, title, body, quality) {
  var qualityString = qualityArray[quality];
  var newCard =
    $(`<article class="card" id="card-${id}">
      <h2 class="card-title">${title}</h2>
      <input class="card-button delete" type="button" name="name" value="">
      <p class="card-body">${body}</p>
      <input class="card-button upvote" type="button" name="name" value="">
      <input class="card-button downvote" type="button" name="name" value="">
      <div class="card-quality">quality: <span class="quality-value">${qualityString}</span></div>
    </article>`).hide().fadeIn('normal');
  ideaList.prepend(newCard);
  count++;
  localStorage.setItem('count',count);
}

function clearInput() {
  titleField.val('');
  bodyField.val('');
}

ideaList.on('click', '.delete', function () {
  $(this).parent().fadeOut('normal', function () {
    deleteCardData($(this).attr('id'));
    $(this).remove();
    resetCounter();
  });
});

function resetCounter() {
  if ($('.idea-list').children().length === 0) {
    localStorage.setItem('count', 0);
    count = 0;
  }
}

ideaList.on('click', '.upvote', function () {
  var qualityValue = $(this).parent().find('.quality-value').text();
  var newQualityString= changeQuality(qualityValue, 'up');
  $(this).parent().find('.quality-value').text(newQualityString);
  updateQualityData($(this).parent().attr('id'), newQualityString);

});

ideaList.on('click', '.downvote', function () {
  var qualityValue = $(this).parent().find('.quality-value').text();
  var newQualityString = changeQuality(qualityValue, 'down');
  $(this).parent().find('.quality-value').text(newQualityString);
  updateQualityData($(this).parent().attr('id'), newQualityString);

});

function updateQualityData(id, newQualityString) {
  var savedCardString = localStorage.getItem(id);
  var savedCard = JSON.parse(savedCardString);
  savedCard.quality = qualityArray.indexOf(newQualityString);
  saveCard(savedCard);

}


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
}

function hideError() {
  errorMsg.css('opacity', '0');
  errorMsg.css('transition-duration', '.5s');
}

function saveCard(newCardData) {
  var key = 'card-' + newCardData.id;
  var value = JSON.stringify(newCardData);
  localStorage.setItem(key, value);
}

function deleteCardData(cardID) {
  localStorage.removeItem(cardID);
}

function getSavedCards() {
  for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key.substring(0, 5) == "card-") {
          var savedCardString = localStorage.getItem(key);
          var savedCard = JSON.parse(savedCardString);
          addCardToList(savedCard.id, savedCard.title, savedCard.body, savedCard.quality);
      }
  }
}
