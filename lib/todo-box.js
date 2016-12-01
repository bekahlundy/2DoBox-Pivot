


var titleField = $('.title-field');
var taskField = $('.task-field');
var inputFields = $('.title-field, .task-field, .tag-field');
var ideaList = $('.idea-list');
var saveButton = $('.save-button');
var searchField = $('.search-bar');
var errorMsg = $('.error-msg');
var tagField = $('.tag-field');
var tagBar = $('.tag-bar');
var showAllButton = $('.show-all-button');
var sortButton = $('.sort-button');

if(localStorage.getItem('count') === null) {
  var count = 0;
  localStorage.setItem('count', count);
} else {
  var count = +localStorage.getItem('count');
}

var qualityArray = ['swill', 'plausible', 'genius'];

showAllButton.hide();
titleField.focus();

saveButton.attr('disabled', true);
sortButton.attr('disabled', true);

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

function Card(count, title, task, tags) {
  this.id = count;
  this.title = title;
  this.task = task;
  this.quality = 0;
  this.tags = tags;
  this.complete = false;
}

saveButton.on('click', function () {
  var tagString = tagField.val();
  var title = titleField.val();
  var task = taskField.val();
  var tags = processTags(tagString);

  addTagsToTagBar(tags);
  saveTags(tags);

  var newCardData = new Card(count, title, task, tags);
  saveCard(newCardData);

  addCardToList(newCardData);
  count += 1;
  titleField.focus();
  clearInput();
  saveButton.attr('disabled', true);
});

function addCardToList(newCardObject) {
  // allow for existing cards to have no tag attribute
  if (newCardObject.tags === undefined) {
    newCardObject.tags = [];
  }
  var tagsHTMLString = addTagsToCard(newCardObject.tags);
  var qualityString = qualityIndexToString(newCardObject.quality);
  var newCard =
    $(`<article class="card" id="card-${newCardObject.id}">
      <h2 class="card-title" contentEditable="true">${newCardObject.title}</h2>
      <input class="card-button delete" type="button" name="name" value="">
      <p class="card-task" contentEditable="true">${newCardObject.task}</p>
      <input class="card-button upvote" type="button" name="name" value="">
      <input class="card-button downvote" type="button" name="name" value="">
      <div class="card-quality">quality:
        <span class="quality-value">${qualityString}</span>
      </div>
      <section class="card-tag-section">
      <button class='complete-button' type='button'>complete</button>
      <ul class="layout-flex-wrap card-tags">${tagsHTMLString}</ul></section>

    </article>`).hide().fadeIn('normal');
  updateVoteButtonStatus(newCardObject.quality, newCard);
  ideaList.prepend(newCard);

  localStorage.setItem('count', count);
  sortButton.attr('disabled', false);

}

function addTagsToCard(tags) {
  var tagsHTMLString = '';
  for (let j = 0; j < tags.length; j += 1) {
    tagsHTMLString += (`<li><i class="delete-tag fa fa-minus-square" aria-hidden="true" role="button" tabindex="0"></i>${tags[j]}</li>`);
  }
  return tagsHTMLString;
}

function addTagsToTagBar(tags) {
  if (tags !== null && tags !== '') {
    for (let j = 0; j < tags.length; j += 1) {
      if (tagBar.text().search(tags[j]) === -1) {
        tagBar.append($(`<li role="button" tabindex="0">${tags[j]}</li>`).hide().fadeIn('normal'));
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
      for (let j = 0; j < tags.length; j += 1) {
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
  taskField.val('');
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
    sortButton.attr('disabled', true);

    count = 0;
  }
}

ideaList.on('click', '.upvote', function () {
  var qualityValue = $(this).parent().find('.quality-value').text();
  var newQualityIndex = changeQuality(qualityValue, 'up');

  updateVoteButtonStatus(newQualityIndex, $(this).parent());

  var newQualityString = qualityIndexToString(newQualityIndex);

  $(this).parent().find('.quality-value').text(newQualityString);
  updateQualityData($(this).parent().attr('id'), newQualityString);
});

ideaList.on('click', '.downvote', function () {
  var qualityValue = $(this).parent().find('.quality-value').text();
  var newQualityIndex = changeQuality(qualityValue, 'down');

  updateVoteButtonStatus(newQualityIndex, $(this).parent());

  var newQualityString = qualityIndexToString(newQualityIndex);
  $(this).parent().find('.quality-value').text(newQualityString);
  updateQualityData($(this).parent().attr('id'), newQualityString);
});

tagBar.on('click keydown', 'li', function (e) {
  if (e.keyCode === 13 || e.type === 'click' ) {
    clearCardList();
    getTagMatches($(this).text());
    showAllButton.fadeIn();
  }
});

ideaList.on('click', '.complete-button', function() {
   $(this).parents('article').toggleClass('complete');
   let cardId = $(this).parents('article').attr('id');
  //  console.log($(this).parents('article').)
  //  updateCardCompleteStatus(cardId, complete);
 });

$('.search-sort-tags').on('click', '.show-all-button', function () {
  $(this).fadeOut('normal', function () {
    clearCardList();
    getAllSavedCards();
  });
});

function clearCardList() {
  $('.idea-list').children().remove();
}

function clearTagBar() {
  $('.tag-bar').children().fadeOut('normal', function () {
    $('.tag-bar').children().remove();
  });
}

function getMatchedCards(searchText) {
  for (let i = 0; i < localStorage.length; i += 1) {
    var key = localStorage.key(i);
    if (key.substring(0, 5) === "card-") {
      var savedCardObject = getOneSavedCard(key);

      var searchQuery = new RegExp(searchText, 'i');

      var taskMatch = savedCardObject.task.search(searchQuery);
      var titleMatch  = savedCardObject.title.search(searchQuery);

      var savedCardQualityString = qualityIndexToString(savedCardObject.quality);
      var qualityMatch  = savedCardQualityString.search(searchQuery);

      if (taskMatch !== -1 || titleMatch !== -1 || qualityMatch !== -1) {
        addCardToList(savedCardObject);
      }
    }
  }
}

function getTagMatches(tag) {

  for (let i = 0; i < localStorage.length; i += 1) {
    var key = localStorage.key(i);
    if (key.substring(0, 5) === "card-") {
      var savedCardObject = getOneSavedCard(key);

      if (savedCardObject.tags !== undefined) {
        if (savedCardObject.tags.includes(tag)) {
          addCardToList(savedCardObject);
        }
      }
    }
  }
}

ideaList.on('keydown blur', '.card-title, .card-task', function (event) {
  if (event.keyCode === 13 || event.type === 'focusout') {
    if (event.keyCode === 13) {
      $(this).blur();
      event.preventDefault();
    }

    if ($(this).is('.card-title')) {
      var newTitleText = $(this).text();
      updateCardTitle($(this).parent().attr('id'), newTitleText);
    } else if ($(this).is('.card-task')) {
      var newTaskText = $(this).text();
      updateCardTask($(this).parent().attr('id'), newTaskText);
    }
  }
});

function updateCardCompleteStatus(id, complete) {
  var savedCard = getOneSavedCard(id);
  savedCard.complete = complete;
  saveCard(savedCard);
}

function updateCardTitle(id, newTitleText) {
  var cardObject = getOneSavedCard(id);
  cardObject.title = newTitleText;
  saveCard(cardObject);
}

function updateCardTask(id, newTaskText) {
  var cardObject = getOneSavedCard(id);
  cardObject.task = newTaskText;
  saveCard(cardObject);
}

function updateQualityData(id, newQualityString) {
  var savedCard = getOneSavedCard(id);
  savedCard.quality = qualityStringToIndex(newQualityString);
  saveCard(savedCard);
}

function changeQuality(qualityString, direction) {
  var currentQualityIndex = qualityStringToIndex(qualityString);
  var newQualityIndex = currentQualityIndex;

  if (direction === 'up' && currentQualityIndex !== 2) {
      newQualityIndex = currentQualityIndex + 1;
    } else if (direction === 'down' && currentQualityIndex !== 0) {
      newQualityIndex = currentQualityIndex - 1;
    }
  return newQualityIndex;
}

function updateVoteButtonStatus(qualityIndex, card) {

  switch (qualityIndex) {
    case 0:
      card.children('.downvote').attr('disabled', true);
      break;
    case 1:
      card.children('.upvote, .downvote').attr('disabled', false);
      break;
    case 2:
      card.children('.upvote').attr('disabled', true);
  }
}

function qualityIndexToString(qualityIndex) {
  return qualityArray[qualityIndex];
}

function qualityStringToIndex(qualityString) {
  return qualityArray.indexOf(qualityString);
}

inputFields.on('blur keypress', function () {
  var titleString = $('.title-field').val();
  var taskString = $('.task-field').val();

  updateSaveButtonStatus(titleString, taskString);
});

function stringIsEmpty(string) {
  return string.length === 0 || (/^(\s)*$/g).test(string);
}

// click the create-button when user hits enter key
inputFields.keypress(function(event){
  if (event.which === 13) {
    if (saveButton.attr('disabled')) {
      displayError();
    } else {
      saveButton.click();
    }
  }
});

function updateSaveButtonStatus(titleString, taskString) {
  var titleEmpty = stringIsEmpty(titleString);
  var taskEmpty = stringIsEmpty(taskString);

  if (taskEmpty || titleEmpty) {
    saveButton.attr('disabled', true);
  } else if (!taskEmpty && !titleEmpty) {
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
  for (let i = 0; i < localStorage.length; i += 1) {
    var key = localStorage.key(i);
    if (key.substring(0, 5) === "card-") {
      var savedCard = getOneSavedCard(key);
      addCardToList(savedCard);
      }
  }
}

function getOneSavedCard (key) {
  var savedCardString = localStorage.getItem(key);
  return JSON.parse(savedCardString);
}

sortButton.on('click keydown', function(e) {
  if (e.keyCode === 13 || e.type === 'click') {
    clearInput();
    $(this).toggleClass('fa-rotate-180');
    if ($(this).is('.fa-rotate-180')) {
      sortCards('up');
    } else {
      sortCards('down');
    }
  }
});

function sortCards(sortDirection) {
  clearCardList();
  var cards = [];
  var sortedCards;
  for (let i = 0; i < localStorage.length; i += 1) {
    var key = localStorage.key(i);
    if (key.substring(0, 5) === "card-") {
      var savedCard = getOneSavedCard(key);
      cards.push(savedCard);
    }
  }

  if (sortDirection === 'up') {
    sortedCards = cards.sort(compareCardQualityAscending);
  } else if (sortDirection === 'down') {
    sortedCards = cards.sort(compareCardQualityDescending);
  }

  for (let i = 0; i < cards.length; i += 1) {
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

export {clearCardList, stringIsEmpty, getAllSavedCards, getMatchedCards};
