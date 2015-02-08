/*jshint expr: true*/
var expect = require('chai').expect;
var _ = require('lodash-node');
describe('apiCheck', () => {
  var apiCheck = require('./index');

  describe('#', () => {
    it('should handle a single argument type specification', () => {
      (function(a) {
        var result = apiCheck(apiCheck.string, arguments);
        expect(result).to.be.null;
      })('hello');
    });

    it('should handle single dimentional array with types', () => {
      (function(a, b, c) {
        var result = apiCheck([apiCheck.string, apiCheck.number, apiCheck.bool], arguments);
        expect(result).to.be.null;
      })('a', 1, true);
    });

    it('should handle optional arguments', () => {
      (function(a, b, c) {
        var result = apiCheck([apiCheck.string, apiCheck.number.optional, apiCheck.bool], arguments);
        expect(result).to.be.null;
      })('a', true);
    });

    it('should accept custom checkers', () => {
      var ipAddressChecker = value => /(\d{1,3}\.){3}\d{1,3}/.test(value);
      ipAddressChecker.type = 'ipAddressString';
      (function(a, b) {
        var result = apiCheck([apiCheck.string, ipAddressChecker], arguments);
        expect(result).to.be.null;
      })('a', '127.0.0.1');


      (function(a, b) {
        var result = apiCheck([apiCheck.string, ipAddressChecker], arguments);
        expect(result).to.match(/string.*number.*string.*ipAddressString/i);
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
    it('should disable apiCheck, and results will always be null', () => {
      apiCheck.disable();
      check(true);
      apiCheck.enable();
      check(false);

      function check(disabled) {
        (function(a, b) {
          var results = apiCheck([apiCheck.instanceOf(RegExp), apiCheck.number], arguments);
          if (disabled) {
            expect(results).to.be.null;
          } else {
            expect(results).to.match(/string.*RegExp.*number/i);
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

  describe('apiCheck config', () => {
    describe('output', () => {

      it('should fallback to an empty object is output is removed', () => {
        var original = apiCheck.config.output;
        apiCheck.config.output = null;
        expect(getFailure).to.not.throw();
        apiCheck.config.output = original;
      });

      describe('prefix', () => {
        var gPrefix = 'global prefix';
        beforeEach(() => {
          apiCheck.config.output.prefix = gPrefix;
        });
        it('should prefix the error message', () => {
          expect(getFailure()).to.match(new RegExp(`^${gPrefix}`));
        });

        it('should allow the specification of an additional prefix that comes after the global config prefix', () => {
          var prefix = 'secondary prefix';
          expect(getFailure({prefix})).to.match(new RegExp(`^${gPrefix} ${prefix}`));
        });

        afterEach(() => {
          apiCheck.config.output.prefix = '';
        });
      });

      describe('suffix', () => {
        var gSuffix = 'global suffix';
        beforeEach(() => {
          apiCheck.config.output.suffix = gSuffix;
        });
        it('should suffix the error message', () => {
          expect(getFailure()).to.match(new RegExp(`${gSuffix}$`));
        });

        it('should allow the specification of an additional suffix that comes after the global config suffix', () => {
          var suffix = 'secondary suffix';
          expect(getFailure({suffix})).to.match(new RegExp(`${suffix} ${gSuffix}$`));
        });

        afterEach(() => {
          apiCheck.config.output.suffix = '';
        });
      });

      describe('url', () => {
        var urlBase = 'http://www.example.com/errors#';
        beforeEach(() => {
          apiCheck.config.output.docsBaseUrl = urlBase;
        });
        it('should not be in the message if a url is not specified', () => {
          expect(getFailure()).to.not.contain(urlBase);
        });

        it('should be added to the message if a url is specified', () => {
          var url = 'some-error-message';
          expect(getFailure({url})).to.contain(`${urlBase}${url}`);
        });

        afterEach(() => {
          apiCheck.config.output.docsBaseUrl = '';
        });
      });

      function getFailure(output) {
        var result;
        (function(a) {
          result = apiCheck(apiCheck.string, arguments, output);
        })();
        return result;
      }
    });
  });

});
