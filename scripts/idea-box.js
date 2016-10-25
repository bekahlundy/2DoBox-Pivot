var count = 0;

var qualityArray = ['swill', 'plausible', 'genius'];

var titleField = $('.title-field');
var bodyField = $('.body-field');
var inputFields = $('.title-field, .body-field');
var ideaList = $('.idea-list');
var saveButton = $('.save-button');
var searchField = $('.search-bar');

titleField.focus();

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
    `<article class="card" id="card-${count}">
      <h2 class="card-title">${title}</h2>
      <input class="card-button delete" type="button" name="name" value="">
      <p class="card-body">${body}</p>
      <input class="card-button upvote" type="button" name="name" value="">
      <input class="card-button downvote" type="button" name="name" value="">
      <div class="card-quality">quality: <span class="quality-value">${quality}</span></div>
    </article>`;
  ideaList.prepend(newCard);
  count++;
}

function clearInput() {
  titleField.val('');
  bodyField.val('');
}

ideaList.on('click', '.delete', function () {
  $(this).parent().remove();
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
