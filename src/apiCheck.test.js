/*jshint expr: true*/
var expect = require('chai').expect;
const {coveredFunction} = require('./test.utils');
describe('apiCheck', () => {
  var apiCheck = require('./index');
  const {getError} = require('./apiCheckUtil');

  describe('#', () => {
    it('should handle a single argument type specification', () => {
      (function(a) {
        const message = apiCheck(apiCheck.string, arguments).message;
        expect(message).to.be.empty;
      })('hello');
    });

    it('should handle array with types', () => {
      (function(a, b, c) {
        var message = apiCheck([apiCheck.string, apiCheck.number, apiCheck.bool], arguments).message;
        expect(message).to.be.empty;
      })('a', 1, true);
    });

    it('should handle optional arguments', () => {
      (function(a, b, c) {
        var message = apiCheck([apiCheck.string, apiCheck.number.optional, apiCheck.bool], arguments).message;
        expect(message).to.be.empty;
      })('a', true);
    });

    it('should accept custom checkers', () => {
      var ipAddressChecker = (val, name, location) => {
        if (!/(\d{1,3}\.){3}\d{1,3}/.test(val)) {
          return getError(name, location, ipAddressChecker.type);
        }
      };
      ipAddressChecker.type = 'ipAddressString';
      (function(a, b) {
        var message = apiCheck([apiCheck.string, ipAddressChecker], arguments).message;
        expect(message).to.be.empty;
      })('a', '127.0.0.1');


      (function(a, b) {
        var message = apiCheck([apiCheck.string, ipAddressChecker], arguments).message;
        expect(message).to.match(/argument.*?2.*?must.*?be.*?ipAddressString/i);
      })('a', 32);
    });

    it('should handle when the api is an array and the arguments array is empty', () => {
      const error = /not.*?enough.*?arguments.*?requires.*?2.*?passed.*?0/i;
      (function(a, b) {
        expect(
          () => apiCheck.throw([apiCheck.string, apiCheck.bool], arguments)).to.throw(error);
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
        expect(() => apiCheck.throw(apiCheck.number, args)).to.throw(/argument.*?1.*?must.*?be.*?number/i);
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
      expect(warnCalls).to.have.length(0);
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

    it(`should return the results`, () => {
      (function(a) {
        const args = arguments;
        let message = apiCheck.warn(apiCheck.number, args).message;
        expect(message).to.match(makeSpacedRegex('you passed a 3 the api calls for number'));
      })('a', 3);
    });

    afterEach(() => {
      console.warn = originalWarn;
    });
  });

  describe('#disable/enable', () => {
    it('should disable apiCheck, and results will always be null', () => {
      const error = /not.*?enough.*?arguments.*?requires.*?2.*?passed.*?1/i;
      apiCheck.disable();
      check(true);
      apiCheck.enable();
      check(false);

      function check(disabled) {
        (function(a, b) {
          var message = apiCheck([apiCheck.instanceOf(RegExp), apiCheck.number], arguments).message;
          if (disabled) {
            expect(message).to.be.empty;
          } else {
            expect(message).to.match(error);
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
        expect(() => apiCheck.throw(apiCheck.string)).to.throw(/argument.*2.*must.*be.*function.*arguments/i);
      })('a');
    });
    it('should throw an error when no api is passed', () => {
      (function(a) {
        var args = arguments;
        expect(() => apiCheck(null, args)).to.throw(/argument.*1.*must.*be.*typeOrArrayOf.*function/i);
      })('a');
    });
    it(`should throw an error when the wrong types are passed`, () => {
      (function(a) {
        var args = arguments;
        expect(() => apiCheck(true, args)).to.throw(/argument.*1.*must.*be.*typeOrArrayOf.*function/i);
      })('a');
    });
    it(`should throw an error when there are not enough arguments passed`, () => {
      expect(() => apiCheck(coveredFunction)).to.throw(/not enough arguments specified.*?requires.*?2.*?passed.*?1/i);
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
          expect(getFailure()).to.match(new RegExp(`${gSuffix}`));
        });

        it('should allow the specification of an additional suffix that comes after the global config suffix', () => {
          var suffix = 'secondary suffix';
          expect(getFailure({suffix})).to.match(new RegExp(`${suffix} ${gSuffix}`));
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
        var message;
        (function(a) {
          message = apiCheck(apiCheck.string, arguments, output).message;
        })();
        return message;
      }
    });
  });


  describe('#getErrorMessage', () => {
    it('should say "nothing" when the args is empty', () => {
      expect(apiCheck.getErrorMessage()).to.match(/nothing/i);
    });

    it('should say the values and types I passed', () => {
      const regex = makeSpacedRegex('hey! 3 true string number boolean');
      expect(apiCheck.getErrorMessage([], ['Hey!', 3, true])).to.match(regex);
    });

    it('should show only one api when only no optional arguments are provided', () => {
      const result = apiCheck.getErrorMessage([apiCheck.object]);
      expect(result).to.match(/you passed(.|\n)*?the api calls for(.|\n)*?object/i);
    });

    it(`should show the user's arguments and types nicely`, () => {
      const result = apiCheck.getErrorMessage([
        apiCheck.object,
        apiCheck.array.optional,
        apiCheck.string
      ], [
        {a: 'a', r: new RegExp(), b: undefined},
        [23, false, null]
      ]);
      /* jshint -W101 */
      const regex = makeSpacedRegex(
        'you passed a a r 23 false null with the types of a string r regexp b undefined number boolean null ' +
        'the api calls for object array \\(optional\\) string'
      );
      expect(result).to.match(regex);
    });

    it('should be overrideable', () => {
      let originalGetErrorMessage = apiCheck.getErrorMessage;
      let api = [apiCheck.string, apiCheck.shape({}), apiCheck.array];
      let args;
      let output = {};
      apiCheck.getErrorMessage = (_api, _args, _message, _output) => {
        expect(_api).to.equal(api);
        expect(_args).to.eql(Array.prototype.slice.call(args)); // only eql because the args are cloned
        expect(_message).to.have.length(3);
        expect(_output).to.equal(output);
      };
      (function(a, b, c) {
        args = arguments;
        apiCheck(api, arguments, output);
      })(1, 2, 3);
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
        expect(message).to.match(/nothing(.|\n)*?string/i);
        expect(shouldThrow).to.be.true;
      };
      (function(a) {
        apiCheck.throw(apiCheck.string, arguments);
      })();
      apiCheck.handleErrorMessage = originalHandle;
    });
  });

  function makeSpacedRegex(string) {
    return new RegExp(string.replace(/ /g, '(.|\\n)*?'), 'i');
  }
});
