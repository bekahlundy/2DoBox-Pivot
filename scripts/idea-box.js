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
  addCardToList(newCardData);
  titleField.focus();
  clearInput();
});

function addCardToList(newCardObject) {
  var qualityString = qualityArray[newCardObject.quality];
  var newCard =
    $(`<article class="card" id="card-${newCardObject.id}">
      <h2 class="card-title" contentEditable="true">${newCardObject.title}</h2>
      <input class="card-button delete" type="button" name="name" value="">
      <p class="card-body" contentEditable="true">${newCardObject.body}</p>
      <input class="card-button upvote" type="button" name="name" value="">
      <input class="card-button downvote" type="button" name="name" value="">
      <div class="card-quality">quality: <span class="quality-value">${qualityString}</span></div>
    </article>`).hide().fadeIn('normal');
  ideaList.prepend(newCard);
  count++;
  localStorage.setItem('count', count);
}

function clearInput() {
  titleField.val('');
  bodyField.val('');
  searchField.val('');
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

searchField.on('keyup blur', function() {
  //clear out list when key is pressed
  clearCardList();
  var searchText = $(this).val();
  if (stringIsEmpty(searchText)) {
    getSavedCards();
  } else {
    getMatchedCards(searchText);
  }
});

function clearCardList() {
  $('.idea-list').children().remove();
}

function getMatchedCards(searchText) {
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.substring(0, 5) == "card-") {
      var savedCardString = localStorage.getItem(key);
      var savedCardObject = JSON.parse(savedCardString);

      var bodyMatch = savedCardObject.body.search(searchText);
      var titleMatch  = savedCardObject.title.search(searchText);

      var savedCardQualityIndex = savedCardObject.quality;
      var savedCardQualityString = qualityArray[savedCardQualityIndex];
      var qualityMatch  = savedCardQualityString.search(searchText);

      if (bodyMatch !== -1 || titleMatch !== -1 || qualityMatch !== -1) {
        addCardToList(savedCardObject);
      }
    }
  }
}

ideaList.on('keypress blur', '.card-title, .card-body', function (event) {
  if (event.which == 13 || event.type === 'focusout') {
    event.preventDefault();
    if ($(this).is('.card-title')) {
      var newTitleText = $(this).text();
      updateCardTitle($(this).parent().attr('id'), newTitleText);
    } else if ($(this).is('.card-body')) {
      var newBodyText = $(this).text();
      updateCardBody($(this).parent().attr('id'), newBodyText);
    }
  }
});

function updateCardTitle(id, newTitleText) {
  var savedCardString = localStorage.getItem(id);
  var cardObject = JSON.parse(savedCardString);
  cardObject.title = newTitleText;
  saveCard(cardObject);
}

function updateCardBody(id, newBodyText) {
  var savedCardString = localStorage.getItem(id);
  var cardObject = JSON.parse(savedCardString);
  cardObject.body = newBodyText;
  saveCard(cardObject);
}

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
      addCardToList(savedCard);
    }
  }
}

$('.fa-sort-desc').on('click', function () {
  clearInput();
  $(this).toggleClass('fa-rotate-180');
  if ($(this).is('.fa-rotate-180')) {
    sortCards('up');
  } else {
    sortCards('down');
  }
});

function sortCards(sortDirection) {
  clearCardList();
  var cards = []
  var sortedCards;
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.substring(0, 5) == "card-") {
      var savedCardString = localStorage.getItem(key);
      var savedCard = JSON.parse(savedCardString);
      cards.push(savedCard);
    }
  }

  if (sortDirection === 'up') {
    sortedCards = cards.sort(compareCardQualityAscending);
  } else if (sortDirection === 'down') {
    sortedCards = cards.sort(compareCardQualityDescending);
  }

  for (var i = 0; i < cards.length; i++) {
    addCardToList(sortedCards[i]);
  }
}

function compareCardQualityDescending(cardObjectA, cardObjectB) {
  if (cardObjectA.quality < cardObjectB.quality) {
    return -1;
  }
  if (cardObjectA.quality > cardObjectB.quality) {
    return 1;
  }
  return 0;
}

function compareCardQualityAscending(cardObjectA, cardObjectB) {
  if (cardObjectA.quality > cardObjectB.quality) {
    return -1;
  }
  if (cardObjectA.quality < cardObjectB.quality) {
    return 1;
  }
  return 0;
}
