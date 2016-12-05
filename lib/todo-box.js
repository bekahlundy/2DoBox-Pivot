const titleField = $('.title-field');
const taskField = $('.task-field');
const inputFields = $('.title-field, .task-field');
const toDoList = $('.todo-list');
const saveButton = $('.save-button');
const searchField = $('.search-bar');
const errorMsg = $('.error-msg');
const showAllButton = $('.show-all-button');
const showCompleteButton = $('.show-complete-button');
const sortButton = $('.sort-button');
const showMoreButton = $('.show-more-button');
const importanceFilterBar = $('.importance-filter-bar');

let count = 0;
let numDisplayCards = 0;
let numDisplayCardsComplete = 0;
let numDisplayCardsIncomplete = 0;
let totalNumCards = 0;
let totalNumComplete = 0;
let totalNumIncomplete = 0;

for (let i = 0; i < localStorage.length; i += 1) {
  let key = localStorage.key(i);
  if (key.substring(0, 5) === "card-") {
    totalNumCards += 1;
    let cardObj = getOneSavedCard(key);
    if (cardObj.complete) {
      totalNumComplete += 1;
    } else {
      totalNumIncomplete += 1;
    }
  }
}

if(localStorage.getItem('count') === null) {
   count = 0;
  localStorage.setItem('count', count);
} else {
   count = +localStorage.getItem('count');
}

let importanceArray = ['None', 'Low', 'Normal', 'High', 'Critical'];
showAllButton.hide();
titleField.focus();
saveButton.attr('disabled', true);
sortButton.attr('disabled', true);
getSavedCards({ getDone: false, action: 'load' });

function Card(count, title, task) {
  this.id = count;
  this.title = title;
  this.task = task;
  this.importance = 2;
  this.complete = false;
  this.time = moment();
}

saveButton.on('click', function () {
  let title = titleField.val();
  let task = taskField.val();
  count += 1;
  let cardObj = new Card(count, title, task);
  writeCard(cardObj);
  addCardToList({ cardObj: cardObj, position: 'prepend', action: 'saveButton' });
  titleField.focus();
  clearInput();
  saveButton.attr('disabled', true);
});

function addCardToList(options) {
  let complete = options.cardObj.complete ? "complete" : '';
  let importanceString = importanceIndexToString(options.cardObj.importance);
  let card =
    $(`<article class="card ${complete}" id="card-${options.cardObj.id}">
        <h2 class="card-title" contentEditable="true">${options.cardObj.title}
        </h2>
        <input class="card-button delete" type="button" name="name" value="" aria-hidden="true">
        <p class="card-task" contentEditable="true">${options.cardObj.task}
        </p>
        <input class="card-button upvote" type="button" name="name" value="" aria-hidden="true">
        <input class="card-button downvote" type="button" name="name" value="" aria-hidden="true">
        <section class="card-importance" tabindex="0">
          Importance: <span class="importance-value">${importanceString}</span>
        </section>
        <button class='btn complete-button' type='button'>complete</button>
    </article>`).hide().fadeIn('normal');
  updateVoteButtonStatus(options.cardObj.importance, card);

  if (options.position === 'append') {
    toDoList.append(card);
  } else if (options.position === 'prepend') {
    toDoList.prepend(card);
  }
  localStorage.setItem('count', count);
  sortButton.attr('disabled', false);
  numDisplayCards += 1;

  if (options.action === 'saveButton') {
    console.log('hello');
    totalNumCards += 1;
    totalNumIncomplete += 1;
  }
  if (options.cardObj.complete) {
    numDisplayCardsComplete += 1;
  } else {
    numDisplayCardsIncomplete += 1;
  }
}

function clearInput() {
  titleField.val('');
  taskField.val('');
  searchField.val('');
}

toDoList.on('click', '.delete', function () {
  $(this).parent().fadeOut('normal', function () {
    deleteCardData($(this).attr('id'));
    numDisplayCards -= 1;
    totalNumCards -= 1;
    if ($(this).hasClass('complete')) {
      numDisplayCardsComplete -= 1;
      totalNumComplete -= 1;
    } else {
      numDisplayCardsIncomplete -= 1;
      totalNumIncomplete -= 1;
    }
    resetCounter();
    $(this).remove();
  });
});

function resetCounter() {
  if (toDoList.children().length === 0) {
    localStorage.setItem('count', 0);
    sortButton.attr('disabled', true);
    count = 0;
  }
}

toDoList.on('click', '.upvote', function () {
  let importanceValue = $(this).parent().find('.importance-value').text();
  let newImportanceIndex = changeImportance(importanceValue, 'up');
  updateVoteButtonStatus(newImportanceIndex, $(this).parent());
  let newImportanceString = importanceIndexToString(newImportanceIndex);
  $(this).parent().find('.importance-value').text(newImportanceString);
  updateImportanceData($(this).parent().attr('id'), newImportanceString);
});

toDoList.on('click', '.downvote', function () {
  let importanceValue = $(this).parent().find('.importance-value').text();
  let newImportanceIndex = changeImportance(importanceValue, 'down');
  updateVoteButtonStatus(newImportanceIndex, $(this).parent());
  let newImportanceString = importanceIndexToString(newImportanceIndex);
  $(this).parent().find('.importance-value').text(newImportanceString);
  updateImportanceData($(this).parent().attr('id'), newImportanceString);
});

 importanceFilterBar.on('click keydown', '.btn', function(e) {
  if (e.keyCode === 13 || e.type === 'click' ) {
    clearInput();
    clearCardList('all');
    getMatchedCards($(this).text());
    showAllButton.fadeIn();
  }
});

toDoList.on('click', '.complete-button', function() {
  let card = $(this).parents('article');
  card.toggleClass('complete');
  let cardId = card.attr('id');
  let cardIsComplete = card.hasClass('complete') ? true : false;
  updateCardCompleteStatus(cardId, cardIsComplete);

  if (cardIsComplete) {
    numDisplayCardsComplete += 1;
    numDisplayCardsIncomplete -= 1;
    totalNumComplete += 1;
    totalNumIncomplete -= 1;
  } else {
    numDisplayCardsComplete -= 1;
    numDisplayCardsIncomplete += 1;
    totalNumComplete -= 1;
    totalNumIncomplete += 1;
  }
});


$('.display-menu').on('click', '.show-all-button', function () {
  $(this).fadeOut('normal', function () {
    clearCardList('all');
    getSavedCards({ getDone: false, action: 'show-all-button' });
  });
});

function clearCardList(filter) {
  if (filter === 'all') {
    numDisplayCards = 0;
    numDisplayCardsComplete = 0;
    numDisplayCardsIncomplete = 0;
    $('.todo-list').children().remove();
  } else if (filter === 'complete') {
    numDisplayCards -= numDisplayCardsComplete;
    numDisplayCardsComplete = 0;
    $('.todo-list').children('.complete').remove();
  } else if (filter === 'incomplete') {
    numDisplayCards -= numDisplayCardsIncomplete;
    numDisplayCardsIncomplete = 0;
    $('.todo-list').children().remove();
  }
}

function getMatchedCards(searchText) {
  for (let i = 0; i < localStorage.length; i += 1) {
    let key = localStorage.key(i);
    if (key.substring(0, 5) === "card-") {
      let cardObj = getOneSavedCard(key);
      let searchQuery = new RegExp(searchText, 'i');
      let taskMatch = cardObj.task.search(searchQuery);
      let titleMatch  = cardObj.title.search(searchQuery);
      let savedCardImportanceString = importanceIndexToString(cardObj.importance);
      let importanceMatch  = savedCardImportanceString.search(searchQuery);
      if (taskMatch !== -1 || titleMatch !== -1 || importanceMatch !== -1) {
        addCardToList({ cardObj: cardObj, position: 'prepend', action: `getMatchedCards` });
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
      let newTitleText = $(this).text();
      updateCardTitle($(this).parent().attr('id'), newTitleText);
    } else if ($(this).is('.card-task')) {
      let newTaskText = $(this).text();
      updateCardTask($(this).parent().attr('id'), newTaskText);
    }
  }
});

function updateCardCompleteStatus(id, cardIsComplete) {
  let savedCard = getOneSavedCard(id);
  savedCard.complete = cardIsComplete;
  writeCard(savedCard);
}

function updateCardTitle(id, newTitleText) {
  let cardObject = getOneSavedCard(id);
  cardObject.title = newTitleText;
  writeCard(cardObject);
}

function updateCardTask(id, newTaskText) {
  let cardObject = getOneSavedCard(id);
  cardObject.task = newTaskText;
  writeCard(cardObject);
}

function updateImportanceData(id, newImportanceString) {
  let cardObj = getOneSavedCard(id);
  cardObj.importance = importanceStringToIndex(newImportanceString);
  writeCard(cardObj);
}

function changeImportance(importanceString, direction) {
  let currentImportanceIndex = importanceStringToIndex(importanceString);
  let newImportanceIndex = currentImportanceIndex;
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

inputFields.on('blur keyup', function () {
  let titleString = titleField.val();
  let taskString = taskField.val();
  setCharacterCount(titleString, '.title-char-counter');
  setCharacterCount(taskString, '.task-char-counter');
  updateSaveButtonStatus(titleString, taskString);
});

function stringIsInvalid(string) {
  return string.length === 0 || (/^(\s)*$/g).test(string) || string.length > 120;
}


function setCharacterCount(string, selector) {
  let charCount = string.length;
  $(selector).text(charCount);
}
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
  let titleInvalid = stringIsInvalid(titleString);
  let taskInvalid = stringIsInvalid(taskString);

  if (taskInvalid || titleInvalid) {
    saveButton.attr('disabled', true);
  } else if (!taskInvalid && !titleInvalid) {
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

function writeCard(cardObj) {
  let key = 'card-' + cardObj.id;
  let value = JSON.stringify(cardObj);
  localStorage.setItem(key, value);
}

function deleteCardData(cardID) {
  localStorage.removeItem(cardID);
}

function getSavedCards(options) {
  let cardArray = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    let key = localStorage.key(i);
    if (key.substring(0, 5) === "card-") {
      let cardObj = getOneSavedCard(key);
      if (cardObj.complete === false) {
        cardArray.push(cardObj);
      } else if (options.getDone && cardObj.complete === true) {
        addCardToList({ cardObj: cardObj, position: 'prepend', action: `getSavedCards from ${options.action}`});
      }
    }
  }
  let sortedCards = cardArray.sort(compareTime);
  let selection = sortedCards.slice(numDisplayCardsIncomplete, numDisplayCardsIncomplete + 10);
  selection.forEach( savedCard => {
    if (!options.getDone && savedCard.complete !== true) {
      addCardToList({ cardObj: savedCard, position: 'append', action: `getSavedCards from ${options.action}`});
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
  let savedCardString = localStorage.getItem(key);
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
  let cards = [];
  let sortedCards;
  for (let i = 0; i < localStorage.length; i += 1) {
    let key = localStorage.key(i);
    if (key.substring(0, 5) === "card-") {
      let savedCard = getOneSavedCard(key);
      cards.push(savedCard);
    }
  }

  if (sortDirection === 'up') {
    sortedCards = cards.sort(compareCardImportanceAscending);
  } else if (sortDirection === 'down') {
    sortedCards = cards.sort(compareCardImportanceDescending);
  }

  for (let i = 0; i < cards.length; i += 1) {
    addCardToList({cardObj: sortedCards[i], position:'prepend', action: 'sortCards'});
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
  getSavedCards({getDone: true, action: 'showCompleteButton'});
});

showMoreButton.on('click', function() {
  getSavedCards({getDone: false, action: 'showMoreButton'});
});

// function printStats(display) {
//   if (display) {
//     console.log('count: ', count);
//     console.log('numDisplayCards: ', numDisplayCards);
//     console.log('numDisplayCardsIncomplete: ', numDisplayCardsIncomplete);
//     console.log('numDisplayCardsComplete: ', numDisplayCardsComplete);
//     console.log('totalNumCards: ', totalNumCards);
//     console.log('totalNumComplete: ', totalNumComplete);
//     console.log('totalNumIncomplete: ', totalNumIncomplete);
//   }
// }


export {Card, clearCardList, stringIsInvalid, getSavedCards, getMatchedCards};
