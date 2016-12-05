import Card from '../lib/todo-box.js';
const assert = require('chai').assert;

describe('our test bundle', function () {
  it('should work', function () {
    assert(true);
  });
  it('should be a function', function () {
    assert.isFunction(Card);
  });
});
