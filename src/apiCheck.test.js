/*jshint expr: true*/
var expect = require('chai').expect;
describe('apiCheck', () => {
  var apiCheck = require('./index');

  describe('#', () => {
    it('should handle a single argument type specification', () => {
      (function(a) {
        var result = apiCheck(apiCheck.string, arguments);
        expect(result).to.be.null;
      })('hello');
    });

    it('should handle array with types', () => {
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

    it('should handle when the api is an array and the arguments array is empty', () => {
      (function(a, b) {
        expect(
          () => apiCheck.throw([apiCheck.string, apiCheck.bool], arguments)).to.throw(/you passed.*nothing.*string/i
        );
      })();
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
    it('should do nothing when disabled', () => {
      apiCheck.disable();
      (function(a) {
        expect(apiCheck.throw(apiCheck.number, arguments)).to.not.throw;
      })('a', 3);
      apiCheck.enable();
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
    it('should do nothing when disabled', () => {
      apiCheck.disable();
      (function(a) {
        apiCheck.warn(apiCheck.string, arguments);
      })();
      expect(warnCalls).to.have.length(0);
      apiCheck.enable();
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
          expect(getFailure()).to.not.contain('undefined');
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


  describe('#getErrorMessage', () => {
    it('should say "nothing" when the args is empty', () => {
      expect(apiCheck.getErrorMessage()).to.match(/nothing/i);
    });

    it('should say the types of the values I passed', () => {
      expect(apiCheck.getErrorMessage([], ['string', 3, true])).to.match(/string.*number.*boolean/i);
    });

    it('should show only one api when only no optional arguments are provided', () => {
      expect(apiCheck.getErrorMessage([apiCheck.object])).to.match(/you passed.*should have passed.*object/i);
    });

    it('should show optional arguments', () => {
      expect(apiCheck.getErrorMessage([
        apiCheck.object,
        apiCheck.array.optional,
        apiCheck.string,
        apiCheck.instanceOf(RegExp),
        apiCheck.bool.optional
      ])).to.match(
        /you passed.*nothing.*should have passed.*object, array \(optional\), string, RegExp, boolean \(optional\)/i
      );
    });

    it('should show the user\'s arguments nicely', () => {
      expect(apiCheck.getErrorMessage([
        apiCheck.object,
        apiCheck.array.optional,
        apiCheck.string
      ], [
        {a: 'a', r: new RegExp(), b: undefined},
        [new Date(), 23, false, null]
      ])).to.match(
        /you passed.*a.*string.*r.*regexp.*date.*number.*boolean/i
      );
    });

    it('should show optional types in shapes', () => {
      expect(apiCheck.getErrorMessage(apiCheck.shape({
        name: apiCheck.string,
        cool: apiCheck.bool.optional
      }))).to.match(/you passed.*nothing.*should have passed.*shape.*name.*string.*cool.*boolean.*?optional/i);
    });

    it('should be overrideable', () => {
      var originalGetErrorMessage = apiCheck.getErrorMessage;
      var api = [apiCheck.string, apiCheck.shape({}), apiCheck.array];
      var args = [1,2,3];
      var output = {};
      apiCheck.getErrorMessage = (_api, _args, _output) => {
        expect(_api).to.equal(api);
        expect(_args).to.eql(args); // only eql because the args are cloned
        expect(_output).to.equal(output);
      };
      (function(a) {
        apiCheck(api, args, output);
      })();
      apiCheck.getErrorMessage = originalGetErrorMessage;
    });
  });

  describe('#handleErrorMessage', () => {
    it('should send the message to console.warn when the second argument is falsy', () => {
      var originalWarn = console.warn;
      var warnCalls = [];
      console.warn = function() {
        warnCalls.push([...arguments]);
      };
      apiCheck.handleErrorMessage('message', false);
      expect(warnCalls).to.have.length(1);
      expect(warnCalls[0].join(' ')).to.equal('message');
      console.warn = originalWarn;
    });
    it('should throw the message when the second argument is truthy', () => {
      expect(() => apiCheck.handleErrorMessage('message', true)).to.throw('message');
    });

    it('should be overrideable', () => {
      var originalHandle = apiCheck.handleErrorMessage;
      apiCheck.handleErrorMessage = (message, shouldThrow) => {
        expect(message).to.match(/nothing.*string/i);
        expect(shouldThrow).to.be.true;
      };
      (function(a) {
        apiCheck.throw(apiCheck.string, arguments);
      })();
      apiCheck.handleErrorMessage = originalHandle;
    });
  });

});
