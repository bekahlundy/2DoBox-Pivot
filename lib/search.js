import {clearCardList, stringIsEmpty, getSavedCards, getMatchedCards} from './todo-box';

var searchField = $('.search-bar');


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
