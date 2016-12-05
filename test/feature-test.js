const assert    = require('assert');
const webdriver = require('selenium-webdriver');
const test      = require('selenium-webdriver/testing');

test.describe('adding and removing cards', function() {
  let driver;

  test.beforeEach( () => {
    this.timeout(10000);
    driver = new webdriver.Builder().forBrowser('chrome').build();
    driver.get('http://localhost:8080');
  });

  test.afterEach( () => {
    driver.quit();
  });

  test.it('should allow user to add a card with a title and task', function() {
    const title = driver.findElement({name: 'Title'});
    const task = driver.findElement({name: 'Task'});
    const saveButton = driver.findElement({name: 'save-button'});

    title.sendKeys('this is a title').then( () => {
      return title.getAttribute('value');
    }).then( value => {
      assert.equal(value, 'this is a title');
    });

    task.sendKeys('this is a task body').then( () => {
      return task.getAttribute('value');
    }).then( value => {
      assert.equal(value, 'this is a task body');
    });

    saveButton.click();

    driver.findElement({ tagName: 'article' }).then(card =>
      card.getText()).then((text =>
        assert.equal(text, 'this is a title\nthis is a task body\nImportance: Normal complete')));
  });

  test.it('should allow user to add multiple cards', function() {
    const title = driver.findElement({name: 'Title'});
    const task = driver.findElement({name: 'Task'});
    const saveButton = driver.findElement({name: 'save-button'});

    title.sendKeys('this is a title 1');
    task.sendKeys('this is a task body 1');
    saveButton.click();

    title.sendKeys('this is a title 2');
    task.sendKeys('this is a task body 2');
    saveButton.click();

    driver.findElements({tagName: 'article'}).then((cards) =>{
      assert.equal(cards.length, 2);
    });

  });

  test.it('deleting a card should remove it from the page', function() {
    const title = driver.findElement({name: 'Title'});
    const task = driver.findElement({name: 'Task'});
    const saveButton = driver.findElement({name: 'save-button'});

    title.sendKeys('this is a title 1');
    task.sendKeys('this is a task body 1');
    saveButton.click();

    title.sendKeys('this is a title 2');
    task.sendKeys('this is a task body 2');
    saveButton.click();

    driver.findElements({tagName: 'article'}).then((cards) =>{
      assert.equal(cards.length, 2);
    });

    driver.findElement({className: 'delete'}).click();

    driver.wait(function() {
      return driver.findElements({ tagName: 'article' }).then(function(cards) {
        return cards.length === 1;
      });
    }, 1000);

    driver.findElements({tagName:'article'}).then((cards) => {
      assert.equal(cards.length, 1);
    });
  });
});
