/*jshint expr: true*/
var expect = require('chai').expect;
var _ = require('lodash-node');
describe('apiCheckUtil', () => {
  var {getErrorMessage} = require('./apiCheckUtil');
  var checkers = require('./checkers');

  describe('getErrorMessage', () => {
    it('should say "nothing" when the args is empty', () => {
      expect(getErrorMessage()).to.match(/nothing/i);
    });

    it('should say the types of the values I passed', () => {
      expect(getErrorMessage([], ['string', 3, true])).to.match(/string.*number.*boolean/i);
    });

    it('should show only one api when only no optional arguments are provided', () => {
      expect(getErrorMessage([checkers.object])).to.match(/you passed.*should have passed.*object/i);
    });

    it('should show optional arguments', () => {
      expect(getErrorMessage([
        checkers.object,
        checkers.array.optional,
        checkers.string,
        checkers.bool.optional
      ])).to.match(
        /you passed.*nothing.*should have passed.*object, array \(optional\), string, boolean \(optional\)/i
      );
    });
  });


});
