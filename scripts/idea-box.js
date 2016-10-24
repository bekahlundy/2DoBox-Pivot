var count = 0;

var titleField = $('.title-field');
var bodyField = $('.body-field');
var inputFields = $('.title-field, .body-field');
var list = $('.idea-list');
var saveButton = $('.save-button');
var searchField = $('.search-bar')

titleField.focus();

function Idea() {
  this.id = id;
  this.title = title;
  this.body = body;
  this.quality = quality;
}

