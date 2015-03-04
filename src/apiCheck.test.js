/*jshint expr: true*/
var expect = require('chai').expect;
const {coveredFunction, anonymousFn} = require('./test.utils');
describe('apiCheck', () => {
  var apiCheck = require('./index')();
  const {getError} = require('./apiCheckUtil');

  describe(`main export`, () => {
    const getApiCheck = require('./index');
    it(`should allow you to create instances of apiCheck that do not conflict`, () => {
      const apiCheck1 = getApiCheck({
        output: {
          prefix: 'apiCheck1'
        }
      });
      const apiCheck2 = getApiCheck({
        output: {
          prefix: 'apiCheck2'
        }
      });
      const args = {length: 1, 0: 23};
      expect(apiCheck1(apiCheck1.string, args).message).to.contain('apiCheck1');
      expect(apiCheck1(apiCheck1.string, args).message).to.not.contain('apiCheck2');

      expect(apiCheck2(apiCheck2.string, args).message).to.contain('apiCheck2');
      expect(apiCheck2(apiCheck2.string, args).message).to.not.contain('apiCheck1');
    });

    it(`should throw an error when the config passed is improperly shaped`, () => {
      expect(() => getApiCheck({prefix: 'apiCheck1'})).to.throw(
        /creating an instance of apiCheck apiCheck failed(.|\n)*?prefix.*?apiCheck1/i
      );
    });

    it(`should throw an error when the checkers passed are improperly shaped`, () => {
      const myImproperChecker = coveredFunction();
      myImproperChecker.type = false; // must be string or object
      expect(() => getApiCheck(null, {myChecker: myImproperChecker})).to.throw(
        /creating an instance of apiCheck apiCheck failed(.|\n)*?myChecker/i
      );
    });

    it(`should allow for specifying only default config`, () => {
      const url = 'http://my.example.com';
      const apiCheck1 = getApiCheck({
        output: {url}
      });
      expect(apiCheck1.config.output.url).to.equal(url);
    });

    it(`should allow for specifying both extra checkers and default config`, () => {
      const url = 'http://my.example.com';
      const apiCheck1 = getApiCheck({
        output: {url}
      }, {
        myChecker: coveredFunction
      });
      expect(apiCheck1.config.output.url).to.equal(url);
      expect(apiCheck1.myChecker).to.equal(coveredFunction);
    });
  });

  describe('#', () => {
    let ipAddressChecker;
    const ipAddressRegex = /(\d{1,3}\.){3}\d{1,3}/;
    beforeEach(() => {
      ipAddressChecker = (val, name, location) => {
        if (!ipAddressRegex.test(val)) {
          return getError(name, location, ipAddressChecker.type);
        }
      };
      ipAddressChecker.type = 'ipAddressString';
      ipAddressChecker.shortType = 'ipAddressString';
    });
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

    it(`should handle an any.optional that's in the middle of the arg list`, () => {
      (function(a, b, c) {
        var message = apiCheck([apiCheck.string, apiCheck.any.optional, apiCheck.bool], arguments).message;
        expect(message).to.be.empty;
      })('a', true);
    });

    it(`should handle the crazy optional specifications`, () => {
      function crazyFunction() {
        var message = apiCheck([
          apiCheck.string.optional, apiCheck.number.optional, apiCheck.bool,
          apiCheck.object.optional, apiCheck.func.optional, apiCheck.array,
          apiCheck.string.optional, apiCheck.func
        ], arguments).message;
        expect(message).to.be.empty;
      }
      crazyFunction('string', true, coveredFunction, [], coveredFunction);
      crazyFunction(32, false, {}, [], 'hey!', coveredFunction);
      crazyFunction(false, {}, [], coveredFunction);
    });

    it(`should handle a final two optional arguments`, () => {
      (function(a, b, c) {
        var message = apiCheck([apiCheck.string, apiCheck.oneOfType([
          apiCheck.arrayOf(apiCheck.string),
          apiCheck.shape({name: apiCheck.string})
        ]).optional, apiCheck.shape({
          prop1: apiCheck.shape.onlyIf('prop2', apiCheck.string).optional,
          prop2: apiCheck.shape.onlyIf('prop1', apiCheck.string).optional
        }).optional], arguments).message;
        expect(message).to.be.empty;
      })('a', ['1', '2', 'hey!']);
    });

    it(`should handle specifying an array instead of arguments`, () => {
      const result = apiCheck([apiCheck.string, apiCheck.bool], ['hi', true]);
      expect(result.passed).to.be.true;
      expect(result.message).to.be.empty;
    });

    describe(`custom checkers`, () => {
      it('should be accepted', () => {
        (function(a, b) {
          var message = apiCheck([apiCheck.string, ipAddressChecker], arguments).message;
          expect(message).to.be.empty;
        })('a', '127.0.0.1');


        (function(a, b) {
          var message = apiCheck([apiCheck.string, ipAddressChecker], arguments).message;
          expect(message).to.match(/argument.*?2.*?must.*?be.*?ipAddressString/i);
        })('a', 32);
      });

      it(`be accepted even if the function has no properties`, () => {
        expect(() => apiCheck([() => ''], {length: 1, 0: ''})).to.not.throw();
      });
    });

    it('should handle when the api is an array and the arguments array is empty', () => {
      const error = /not.*?enough.*?arguments.*?requires.*?2.*?passed.*?0/i;
      (function(a, b) {
        expect(() => apiCheck.throw([apiCheck.string, apiCheck.bool], arguments)).to.throw(error);
      })();
    });

    it(`should return an error even when a checker is optional and the last argument`, () => {
      (function(a, b) {
        const result = apiCheck([apiCheck.string, apiCheck.bool.optional], arguments);
        expect(result.message).to.match(/argument 2.*must be.*boolean/i);
      })('hi', 32);
    });

    it(`should show the user what they provided in a good way`, () => {
      (function(a, b, c) {
        c(); // test coverage...
        const result = apiCheck([apiCheck.string, apiCheck.func], arguments);
        expect(result.message).to.match(
          makeSpacedRegex('you passed coveredFunction false anonymous function types of function boolean function')
        );
      })(coveredFunction, false, function() {});
    });


    describe(`api checking`, () => {
      const args = {length: 1, 0: '127.0.0.1'};
      it(`should throw an error when a checker is specified with an incorrect type property`, () => {
        ipAddressChecker.type = 32;
        expect(() => apiCheck(ipAddressChecker, args)).to.throw();
      });

      it(`should not throw an error when a checker is specified with a string type property`, () => {
        ipAddressChecker.type = 'hey!';
        expect(() => apiCheck(ipAddressChecker, args)).to.not.throw();
      });

      it(`should not throw an error when a checker is specified with the correct shape`, () => {
        ipAddressChecker.type = {
          __apiCheckData: {
            type: 'ipAddress',
            optional: false
          },
          ipAddress: ipAddressRegex.toString()
        };
        expect(() => apiCheck(ipAddressChecker, args)).to.not.throw();
      });

      it(`should throw an error when a checker is specified with the incorrect shape`, () => {
        ipAddressChecker.type = {
          __apiCheckData: {
            type: 'ipAddress',
            optional: false
          }
        };
        expect(() => apiCheck(ipAddressChecker, args)).to.throw();

        ipAddressChecker.type = {
          __apiCheckData: {
            type: 'ipAddress',
            optional: false
          },
          ipAddressChecker: 43
        };
        expect(() => apiCheck(ipAddressChecker, args)).to.throw();

      });

    });

    describe(`helper text of a checker`, () => {
      describe(`as a string`, () => {
        it(`should be printed as is as part of the message`, () => {
          ipAddressChecker.help = 'This needs to be a valid IP address. Like 127.0.0.1';
          (function(a, b) {
            var message = apiCheck([apiCheck.string, ipAddressChecker], arguments).message;
            expect(message).to.contain(ipAddressChecker.help);
          })('a', 32);
        });
      });

      describe(`as a function`, () => {
        it(`should be invoked and the result added as part of the message`, () => {
          const suffix = ' is not a valid IP address. Like 127.0.0.1';
          ipAddressChecker.help = function(val) {
            return val + suffix;
          };
          (function(a, b) {
            var message = apiCheck([apiCheck.string, ipAddressChecker], arguments).message;
            expect(message).to.contain(suffix);
          })('a', 32);
        });
      });
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
        expect(() => apiCheck(null, args)).to.throw(/argument.*1.*must.*be.*typeOrArrayOf.*func\.withProperties/i);
      })('a');
    });
    it(`should throw an error when the wrong types are passed`, () => {
      (function(a) {
        var args = arguments;
        expect(() => apiCheck(true, args)).to.throw(/argument.*1.*must.*be.*typeOrArrayOf.*func\.withProperties/i);
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
        expect(getFailureMessage).to.not.throw();
        apiCheck.config.output = original;
      });

      describe('prefix', () => {
        var gPrefix = 'global prefix';
        beforeEach(() => {
          apiCheck.config.output.prefix = gPrefix;
        });
        it('should prefix the error message', () => {
          expect(getFailureMessage()).to.match(new RegExp(`^${gPrefix}`));
        });

        it('should allow the specification of an additional prefix that comes after the global config prefix', () => {
          var prefix = 'secondary prefix';
          expect(getFailureMessage({prefix})).to.match(new RegExp(`^${gPrefix} ${prefix}`));
        });

        it(`should be overrideable by the specific call`, () => {
          const onlyPrefix = 'overriding prefix';
          const message = getFailureMessage({onlyPrefix});
          expect(message).to.match(new RegExp(`^${onlyPrefix}`));
          expect(message).to.not.contains(gPrefix);
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
          expect(getFailureMessage()).to.contain(`${gSuffix}`);
        });

        it('should allow the specification of an additional suffix that comes after the global config suffix', () => {
          var suffix = 'secondary suffix';
          expect(getFailureMessage({suffix})).to.contain(`${suffix} ${gSuffix}`);
        });

        it(`should be overrideable by the specific call`, () => {
          const onlySuffix = 'overriding suffix';
          const message = getFailureMessage({onlySuffix});
          expect(message).to.contain(onlySuffix);
          expect(message).to.not.contain(gSuffix);
        });

        afterEach(() => {
          apiCheck.config.output.suffix = '';
        });
      });

      describe('url', () => {
        var docsBaseUrl = 'http://www.example.com/errors#';
        beforeEach(() => {
          apiCheck.config.output.docsBaseUrl = docsBaseUrl;
        });
        it('should not be in the message if a url is not specified', () => {
          expect(getFailureMessage()).to.not.contain(docsBaseUrl);
          expect(getFailureMessage()).to.not.contain('undefined');
        });

        it('should be added to the message if a url is specified', () => {
          var urlSuffix = 'some-error-message';
          expect(getFailureMessage({urlSuffix})).to.contain(`${docsBaseUrl}${urlSuffix}`);
        });

        it(`should be overrideable by the specific call`, () => {
          const url = 'http://www.example.com/otherErrors#some-other-url';
          const message = getFailureMessage({url});
          expect(message).to.contain(url);
          expect(message).to.not.contain(docsBaseUrl);
        });

        afterEach(() => {
          apiCheck.config.output.docsBaseUrl = '';
        });
      });

      it(`should throw an error if you include extra properties`, () => {
        expect(() => getFailureMessage({myProp: true})).to.throw(/argument 3.*?cannot have extra properties.*?myProp/i);
      });

      function getFailureMessage(output) {
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

    it(`should return a terse message by default`, () => {
      testApiTypes({
        __apiCheckData: {strict: false, optional: false, type: 'shape'},
        shape: {
          foo: {
            __apiCheckData: {strict: false, optional: false, type: 'shape'},
            shape: {
              foo1: 'String (optional)',
              foo2: 'Number'
            }
          },
          bar: {
            __apiCheckData: {
              strict: false, optional: false, type: 'func.withProperties', missing: 'MISSING THIS FUNC.WITHPROPERTIES'
            },
            'func.withProperties': {
              bar2: 'Boolean <-- YOU ARE MISSING THIS'
            }
          }
        }
      });
    });

    it(`should log verbose information when verbose mode is enabled`, () => {
      apiCheck.config.verbose = true;
      testApiTypes({
        __apiCheckData: {strict: false, optional: false, type: 'shape'},
        shape: {
          foo: {
            __apiCheckData: {strict: false, optional: false, type: 'shape'},
            shape: {
              foo1: 'String (optional)',
              foo2: 'Number'
            }
          },
          bar: {
            __apiCheckData: {
              strict: false, optional: false, type: 'func.withProperties', missing: 'MISSING THIS FUNC.WITHPROPERTIES'
            },
            'func.withProperties': {
              bar1: 'String (optional)',
              bar2: 'Boolean <-- YOU ARE MISSING THIS'
            }
          },
          foobar: {
            __apiCheckData: {
              strict: false, optional: true, type: 'shape'
            },
            shape: {
              foobar1: 'String (optional)',
              foobar2: 'Date'
            }
          }
        }
      });
      apiCheck.config.verbose = false;
    });

    function testApiTypes(resultApiTypes) {
      const optionsCheck = apiCheck.shape({
        foo: apiCheck.shape({
          foo1: apiCheck.string.optional,
          foo2: apiCheck.number
        }),
        bar: apiCheck.func.withProperties({
          bar1: apiCheck.string.optional,
          bar2: apiCheck.bool
        }),
        foobar: apiCheck.shape({
          foobar1: apiCheck.string.optional,
          foobar2: apiCheck.instanceOf(Date)
        }).optional
      });
      const myOptions = {
        foo: {
          foo1: 'specified',
          foo2: 3
        }
      };
      (function(a) {
        const {apiTypes} = apiCheck(optionsCheck, arguments);
        expect(apiTypes).to.eql([resultApiTypes]);
      })(myOptions);
    }
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
