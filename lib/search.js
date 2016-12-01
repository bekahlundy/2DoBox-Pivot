import {clearCardList, stringIsEmpty  ,getAllSavedCards, getMatchedCards} from './todo-box';

var searchField = $('.search-bar');


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
