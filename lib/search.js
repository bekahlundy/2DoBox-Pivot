import {clearCardList, stringIsInvalid, getSavedCards, getMatchedCards} from './todo-box';

var searchField = $('.search-bar');


searchField.on('keyup blur', function() {
  //clear out list when key is pressed
  clearCardList('all');
  var searchText = $(this).val();
  if (stringIsInvalid(searchText)) {
    getSavedCards( { getDone: false, action: 'showCompleteButton' });
  } else {
    getMatchedCards(searchText);
  }
});
