var titleField = $('.title-field');
var taskField = $('.task-field');
var inputFields = $('.title-field, .task-field, .tag-field');
var toDoList = $('.todo-list');
var saveButton = $('.save-button');
var searchField = $('.search-bar');
var errorMsg = $('.error-msg');
var tagField = $('.tag-field');
var tagBar = $('.tag-bar');
var showAllButton = $('.show-all-button');
var showCompleteButton = $('.show-complete-button');
var sortButton = $('.sort-button');

let count = 0;

if(localStorage.getItem('count') === null) {
   count = 0;
  localStorage.setItem('count', count);
} else {
   count = +localStorage.getItem('count');
}

var importanceArray = ['None', 'Low', 'Normal', 'High', 'Critical'];

showAllButton.hide();
titleField.focus();

saveButton.attr('disabled', true);
sortButton.attr('disabled', true);

getSavedCards();
addTagsToTagBar(getSavedTags());



function processTags(string) {
  console.log(matches)
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
  this.importance = 2;
  this.tags = tags;
  this.complete = false;
  this.time = moment();
}

saveButton.on('click', function () {
  var tagString = tagField.val();
  var title = titleField.val();
  var task = taskField.val();
  var tags = processTags(tagString);

  addTagsToTagBar(tags);
  saveTags(tags);

  count += 1;
  var newCardData = new Card(count, title, task, tags);
  saveCard(newCardData);

  // clearCardList();
  // getSavedCards();
  addCardToList(newCardData);

  titleField.focus();
  clearInput();
  saveButton.attr('disabled', true);
});

function addCardToList(newCardObject, position) {
  // allow for existing cards to have no tag attribute
  if (newCardObject.tags === undefined) {
    newCardObject.tags = [];
  }

  let complete = newCardObject.complete ? "complete" : '';

  var tagsHTMLString = addTagsToCard(newCardObject.tags);
  var importanceString = importanceIndexToString(newCardObject.importance);
  var newCard =
    $(`<article class="card ${complete}" id="card-${newCardObject.id}">
        <h2 class="card-title" contentEditable="true">${newCardObject.title}
        </h2>
        <input class="card-button delete" type="button" name="name" value="" aria-hidden="true">
        <p class="card-task" contentEditable="true">${newCardObject.task}
        </p>
        <section class="card-tag-section">
          <ul class="layout-flex-wrap card-tags">${tagsHTMLString}
          </ul>
        </section>
        <input class="card-button upvote" type="button" name="name" value="" aria-hidden="true">
        <input class="card-button downvote" type="button" name="name" value="" aria-hidden="true">
        <section class="card-importance">
          Importance: <span class="importance-value">${importanceString}</span>
        </section>
        <button class='complete-button' type='button'>complete</button>
    </article>`).hide().fadeIn('normal');
  updateVoteButtonStatus(newCardObject.importance, newCard);

  if (position === 'append') {
    toDoList.append(newCard);
  } else {
    toDoList.prepend(newCard);
  }


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

toDoList.on('click', '.delete', function () {
  $(this).parent().fadeOut('normal', function () {
    deleteCardData($(this).attr('id'));
    $(this).remove();
    resetCounter();
  });
});

function resetCounter() {
  if ($('.todo-list').children().length === 0) {
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

toDoList.on('click', '.upvote', function () {
  var importanceValue = $(this).parent().find('.importance-value').text();
  var newImportanceIndex = changeImportance(importanceValue, 'up');

  updateVoteButtonStatus(newImportanceIndex, $(this).parent());

  var newImportanceString = importanceIndexToString(newImportanceIndex);

  $(this).parent().find('.importance-value').text(newImportanceString);
  updateImportanceData($(this).parent().attr('id'), newImportanceString);
});

toDoList.on('click', '.downvote', function () {
  var importanceValue = $(this).parent().find('.importance-value').text();
  var newImportanceIndex = changeImportance(importanceValue, 'down');

  updateVoteButtonStatus(newImportanceIndex, $(this).parent());

  var newImportanceString = importanceIndexToString(newImportanceIndex);
  $(this).parent().find('.importance-value').text(newImportanceString);
  updateImportanceData($(this).parent().attr('id'), newImportanceString);
});

tagBar.on('click keydown', 'li', function (e) {
  if (e.keyCode === 13 || e.type === 'click' ) {
    clearCardList('all');
    getTagMatches($(this).text());
    showAllButton.fadeIn();
  }
});

toDoList.on('click', '.complete-button', function() {
  let card = $(this).parents('article');
  card.toggleClass('complete');
  let cardId = card.attr('id');
  let cardIsComplete = card.hasClass('complete') ? true : false;
  updateCardCompleteStatus(cardId, cardIsComplete);
 });

$('.display-menu').on('click', '.show-all-button', function () {
  $(this).fadeOut('normal', function () {
    clearCardList('all');
    getSavedCards();
  });
});



function clearCardList(filter) {
  if (filter === 'all') {
    $('.todo-list').children().remove();
  } else if (filter === 'complete') {
    // $('.todo-list').children().filter('.complete').remove();
    $('.todo-list').children('.complete').remove();
  } else if (filter === 'incomplete') {
    $('.todo-list').children().remove();
  }

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

      var tagMatch = savedCardObject.tags.includes(searchText);

      var searchQuery = new RegExp(searchText, 'i');
      var taskMatch = savedCardObject.task.search(searchQuery);
      var titleMatch  = savedCardObject.title.search(searchQuery);

      var savedCardImportanceString = importanceIndexToString(savedCardObject.importance);
      var importanceMatch  = savedCardImportanceString.search(searchQuery);

      if (tagMatch || taskMatch !== -1 || titleMatch !== -1 || importanceMatch !== -1) {
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

toDoList.on('keydown blur', '.card-title, .card-task', function (event) {
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

function updateCardCompleteStatus(id, cardIsComplete) {
  var savedCard = getOneSavedCard(id);
  savedCard.complete = cardIsComplete;
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

function updateImportanceData(id, newImportanceString) {
  var savedCard = getOneSavedCard(id);
  savedCard.importance = importanceStringToIndex(newImportanceString);
  saveCard(savedCard);
}

function changeImportance(importanceString, direction) {
  var currentImportanceIndex = importanceStringToIndex(importanceString);
  var newImportanceIndex = currentImportanceIndex;

  if (direction === 'up' && currentImportanceIndex !== 4) {
      newImportanceIndex = currentImportanceIndex + 1;
    } else if (direction === 'down' && currentImportanceIndex !== 0) {
      newImportanceIndex = currentImportanceIndex - 1;
    }
  return newImportanceIndex;
}

function updateVoteButtonStatus(importanceIndex, card) {

  switch (importanceIndex) {
    case 0:
      card.children('.downvote').attr('disabled', true);
      break;
    case 1:
    case 2:
    case 3:
      card.children('.upvote, .downvote').attr('disabled', false);
      break;
    case 4:
      card.children('.upvote').attr('disabled', true);
  }
}

function importanceIndexToString(importanceIndex) {
  return importanceArray[importanceIndex];
}

function importanceStringToIndex(importanceString) {
  return importanceArray.indexOf(importanceString);
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

function getSavedCards(getDone = false) {
  let cardArray = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    let key = localStorage.key(i);
    if (key.substring(0, 5) === "card-") {
      let cardObj = getOneSavedCard(key);
      if (cardObj.complete === false) {
        cardArray.push(cardObj);
      } else if (getDone && cardObj.complete === true) {
        addCardToList(cardObj, 'prepend');
      }
    }
  }

  let sortedCards = cardArray.sort(compareTime);
  let firstTen = sortedCards.slice(0, 10);


  firstTen.forEach( savedCard => {
    if (!getDone && savedCard.complete !== true) {
      addCardToList(savedCard, 'append');
    }
  });

}

function compareTime(a, b) {
  let timeA = a.time.valueOf();
  let timeB = b.time.valueOf();

  if (timeA > timeB) { return -1; }
  if (timeA < timeB) { return 1; }
  return 0;
}

function getOneSavedCard(key) {
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
  clearCardList('all');
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
    sortedCards = cards.sort(compareCardImportanceAscending);
  } else if (sortDirection === 'down') {
    sortedCards = cards.sort(compareCardImportanceDescending);
  }

  for (let i = 0; i < cards.length; i += 1) {
    addCardToList(sortedCards[i]);
  }
}

function compareCardImportanceDescending(cardObjectA, cardObjectB) {
  if (cardObjectA.importance < cardObjectB.importance) {
    return -1;
  }
  if (cardObjectA.importance > cardObjectB.importance) {
    return 1;
  }
  return 0;
}

function compareCardImportanceAscending(cardObjectA, cardObjectB) {
  if (cardObjectA.importance > cardObjectB.importance) {
    return -1;
  }
  if (cardObjectA.importance < cardObjectB.importance) {
    return 1;
  }
  return 0;
}

showCompleteButton.on('click', function() {
  clearCardList('complete');
  getSavedCards(true);
});

export {clearCardList, stringIsEmpty, getSavedCards, getMatchedCards};
