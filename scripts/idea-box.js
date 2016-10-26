var titleField = $('.title-field');
var bodyField = $('.body-field');
var inputFields = $('.title-field, .body-field, .tag-field');
var ideaList = $('.idea-list');
var saveButton = $('.save-button');
var searchField = $('.search-bar');
var errorMsg = $('.error-msg');
var tagField = $('.tag-field');
var tagBar = $('.tag-bar');
var showAllButton = $('.show-all-button');

if(localStorage.getItem('count') === null) {
  var count = 0;
  localStorage.setItem('count', count);
} else {
  var count = localStorage.getItem('count');
}

var qualityArray = ['swill', 'plausible', 'genius'];

showAllButton.hide();
titleField.focus();
saveButton.attr('disabled', true);

getAllSavedCards();
addTagsToTagBar(getSavedTags());

function processTags(string) {
   var matches = string.match(/\w+/g);
   if (matches == null) {
     return [];
   } else {
     return matches;
   }
}

function Card(count, title, body, tags) {
  this.id = count;
  this.title = title;
  this.body = body;
  this.quality = 0;
  this.tags = tags;
}

saveButton.on('click', function () {
  var tagString = tagField.val();
  var title = titleField.val();
  var body = bodyField.val();
  var tags = processTags(tagString);

  addTagsToTagBar(tags);
  saveTags(tags);

  var newCardData = new Card(count, title, body, tags);
  saveCard(newCardData);

  addCardToList(newCardData);
  titleField.focus();
  clearInput();
});

function addCardToList(newCardObject) {
  // allow for existing cards to have no tag attribute
  if (newCardObject.tags === undefined) {
    newCardObject.tags = [];
  }
  var tagsHTMLString = addTagsToCard(newCardObject.tags);
  var qualityString = qualityArray[newCardObject.quality];
  var newCard =
    $(`<article class="card" id="card-${newCardObject.id}">
      <h2 class="card-title" contentEditable="true">${newCardObject.title}</h2>
      <input class="card-button delete" type="button" name="name" value="">
      <p class="card-body" contentEditable="true">${newCardObject.body}</p>
      <input class="card-button upvote" type="button" name="name" value="">
      <input class="card-button downvote" type="button" name="name" value="">
      <div class="card-quality">quality: <span class="quality-value">${qualityString}</span></div>
      <ul class="card-tags">${tagsHTMLString}</ul>
    </article>`).hide().fadeIn('normal');
  ideaList.prepend(newCard);
  count++;
  localStorage.setItem('count', count);
}

function addTagsToCard(tags) {
  var tagsHTMLString = '';
  for (var j = 0; j < tags.length; j++) {
    tagsHTMLString += (`<li>${tags[j]}</li>`)
  }
  return tagsHTMLString;
}

function addTagsToTagBar(tags) {
  if (tags !== null && tags !== '') {
    for (var j = 0; j < tags.length; j++) {
      if (tagBar.text().search(tags[j]) === -1) {
        tagBar.append($(`<li>${tags[j]}</li>`).hide().fadeIn('normal'));
      }
    }
  }
}

function saveTags(tags) {
  var savedTagsString = localStorage.getItem('tags');
  var savedTagsArray = [];

  if (savedTagsString === null) {
    localStorage.setItem('tags', JSON.stringify(tags));
  } else {
      if (savedTagsString !== '') {
        savedTagsArray = JSON.parse(savedTagsString);
      }
      for (var j = 0; j < tags.length; j++) {
        if (!savedTagsArray.includes(tags[j])) {
          savedTagsArray.push(tags[j]);
        }
      }
    localStorage.setItem('tags', JSON.stringify(savedTagsArray));
  }
}

function getSavedTags() {
  var savedTagsString = localStorage.getItem('tags');
  if (savedTagsString !== null && savedTagsString !== '') {
    return JSON.parse(savedTagsString);
  } else {
    return [];
  }
}

function clearInput() {
  titleField.val('');
  bodyField.val('');
  searchField.val('');
  tagField.val('');
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
    // reset counter to zero after deletin last card
    localStorage.setItem('count', 0);
    //clear all tags after deleting last card
    localStorage.setItem('tags', []);
    // remove tags from tag-bar
    clearTagBar();

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
    getAllSavedCards();
  } else {
    getMatchedCards(searchText);
  }
});

tagBar.on('click', 'li', function (event) {
  clearCardList();
  getTagMatches($(this).text());
  showAllButton.fadeIn();
})

$('.search-sort-tags').on('click', '.show-all-button', function () {
  $(this).fadeOut('normal', function () {
    clearCardList();
    getAllSavedCards();
  });
})

function clearCardList() {
  $('.idea-list').children().remove();
}

function clearTagBar() {
  $('.tag-bar').children().fadeOut('normal', function () {
    $('.tag-bar').children().remove();
  });
}

function getMatchedCards(searchText) {
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.substring(0, 5) == "card-") {
      var savedCardObject = getOneSavedCard(key);

      var searchQuery = new RegExp(searchText, 'i')

      var bodyMatch = savedCardObject.body.search(searchQuery);
      var titleMatch  = savedCardObject.title.search(searchQuery);

      var savedCardQualityIndex = savedCardObject.quality;
      var savedCardQualityString = qualityArray[savedCardQualityIndex];
      var qualityMatch  = savedCardQualityString.search(searchQuery);

      if (bodyMatch !== -1 || titleMatch !== -1 || qualityMatch !== -1) {
        addCardToList(savedCardObject);
      }
    }
  }
}

function getTagMatches(tag) {

  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.substring(0, 5) == "card-") {
      var savedCardObject = getOneSavedCard(key);

      if (savedCardObject.tags !== undefined) {
        if (savedCardObject.tags.includes(tag)) {
          addCardToList(savedCardObject);
        }
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
  var cardObject = getOneSavedCard(id);
  cardObject.title = newTitleText;
  saveCard(cardObject);
}

function updateCardBody(id, newBodyText) {
  var cardObject = getOneSavedCard(id);
  cardObject.body = newBodyText;
  saveCard(cardObject);
}

function updateQualityData(id, newQualityString) {
  var savedCard = getOneSavedCard(id);
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

function getAllSavedCards() {
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.substring(0, 5) == "card-") {
      var savedCard = getOneSavedCard(key);
      addCardToList(savedCard);
      }
  }
}

function getOneSavedCard (key) {
  var savedCardString = localStorage.getItem(key);
  return JSON.parse(savedCardString);
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
      var savedCard = getOneSavedCard(key);
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
