/*jshint expr: true*/
var expect = require('chai').expect;
var _ = require('lodash-node');
describe('apiCheck', () => {
  var apiCheck = require('./index');

  describe('#', () => {
    it('should handle a single argument type specification', () => {
      (function(a) {
        var result = apiCheck(apiCheck.string, arguments);
        expectArrayWithLength(result, arguments.length);
        expect(result[0]).to.be.true;
      })('hello');
    });

    it('should handle single dimentional array with types', () => {
      (function(a, b, c) {
        var result = apiCheck([apiCheck.string, apiCheck.number, apiCheck.bool], arguments);
        expectArrayWithLength(result, arguments.length);
        allTrue(result);
      })('a', 1, true);
    });

    it('should handle optional arguments', () => {
      (function(a, b, c) {
        var result = apiCheck([apiCheck.string, apiCheck.number.optional, apiCheck.bool], arguments);
        expectArrayWithLength(result, arguments.length);
        allTrue(result);
      })('a', true);
    });

    it('should accept custom checkers', () => {
      var ipAddressChecker = value => /(\d{1,3}\.){3}\d{1,3}/.test(value);
      (function(a,b) {
        var result = apiCheck([apiCheck.string, ipAddressChecker], arguments);
        expectArrayWithLength(result, arguments.length);
        allTrue(result);
      })('a', '127.0.0.1');


      (function(a,b) {
        var result = apiCheck([apiCheck.string, ipAddressChecker], arguments);
        expectArrayWithLength(result, arguments.length);
        expect(result[0]).to.be.true;
        expect(result[1]).to.be.false;
      })('a', 32);
    });
  });

  describe('#throw', () => {
    it('should not throw an error when the arguments are correct', () => {
      (function(a) {
        expect(apiCheck.throw(apiCheck.string, arguments)).to.not.throw;
      })('a');
    });
    it('should throw an error when the arguments are not correct', () => {
      (function(a) {
        var args = arguments;
        expect(() => apiCheck.throw(apiCheck.number, args)).to.throw(/you passed.*should have passed.*/i);
      })('a', 3);
    });
  });

  describe('#warn', () => {
    var originalWarn;
    var warnCalls;
    beforeEach(() => {
      originalWarn = console.warn;
      warnCalls = [];
      console.warn = function() {
        warnCalls.push([...arguments]);
      };
    });

    it('should not warn when the arguments are correct', () => {
      (function(a) {
        apiCheck.warn(apiCheck.string, arguments);
      })('a');
      expect(warnCalls).to.be.empty;
    });

    it('should warn when the arguments are not correct', () => {
      (function(a) {
        apiCheck.warn(apiCheck.string, arguments);
      })();
      expect(warnCalls).to.have.length(1);
      expect(warnCalls[0].join(' ')).to.match(/failed/i);
    });

    afterEach(() => {
      console.warn = originalWarn;
    });
  });

  describe('#disable/enable', () => {
    it('should disable apiCheck, and results will always be an array of true', () => {
      apiCheck.disable();
      check(true);
      apiCheck.enable();
      check(false);

      function check(disabled) {
        (function(a, b) {
          var results = apiCheck([apiCheck.instanceOf(RegExp), apiCheck.number], arguments);
          if (disabled) {
            expectArrayWithLength(results, arguments.length);
            allTrue(results);
          } else {
            console.log(results);
            expectArrayWithLength(results, 1);
            expect(results[0]).to.be.false;
          }
        })('hey');
      }
    });

    after(function() {
      apiCheck.enable();
    });
  });

  describe('apiCheck api', () => {
    it('should throw an error when no arguments are supplied', () => {
      (function(a) {
        expect(() => apiCheck.throw(apiCheck.string)).to.throw(/must pass arguments/i);
      })('a');
    });
    it('should throw an error when no api is passed', () => {
      (function(a) {
        var args = arguments;
        expect(() => apiCheck(null, args)).to.throw(/must pass.*array or.*function/i);
      })('a');
    });
  });


  function expectArrayWithLength(arry, length) {
    expect(arry).to.be.instanceOf(Array);
    expect(arry).to.have.length(length);
  }

  function allTrue(vals) {
    expect(vals).to.eql(_.times(vals.length, ()=>true));
  }

});
