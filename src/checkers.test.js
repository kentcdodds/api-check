/*jshint expr: true*/
var expect = require('chai').expect;
var _ = require('lodash-node');
const {coveredFunction} = require('./test.utils');

describe('checkers', () => {
  var checkers = require('./checkers');
  describe('typeOfs', () => {
    it('should check string', () => {
      expect(checkers.string('string')).to.be.undefined;
      expect(checkers.string(3)).to.be.an.instanceOf(Error);
    });
    it('should check bool', () => {
      expect(checkers.bool(true)).to.be.undefined;
      expect(checkers.bool('whatever')).to.be.an.instanceOf(Error);
    });
    it('should check number', () => {
      expect(checkers.number(234)).to.be.undefined;
      expect(checkers.number(234.42)).to.be.undefined;
      expect(checkers.number(false)).to.be.an.instanceOf(Error);
    });
    it('should check object', () => {
      expect(checkers.object({})).to.be.undefined;
      expect(checkers.object(null)).to.be.an.instanceOf(Error);
      expect(checkers.object([])).to.be.an.instanceOf(Error);
    });
    it('should check object.nullOk', () => {
      expect(checkers.object.nullOk({})).to.be.undefined;
      expect(checkers.object.nullOk(null)).to.be.undefined;
      expect(checkers.object.nullOk([])).to.be.an.instanceOf(Error);
    });
    it('should check array', () => {
      expect(checkers.array([])).to.be.undefined;
      expect(checkers.array({})).to.be.an.instanceOf(Error);
    });

    describe(`function`, () => {
      it('should check function', () => {
        expect(checkers.func(coveredFunction)).to.be.undefined;
        expect(checkers.func(null)).to.be.an.instanceOf(Error);
      });

      describe(`.withProperties`, () => {
        it(`should check for properties on a function`, () => {
          const myFuncWithProps = coveredFunction();

          const anotherFunctionWithProps = coveredFunction();
          anotherFunctionWithProps.aNumber = 32;

          myFuncWithProps.someProp = 'As a string';
          myFuncWithProps.anotherProp = {
            anotherFunction: anotherFunctionWithProps
          };

          const checker = checkers.func.withProperties({
            someProp: checkers.string,
            anotherProp: checkers.shape({
              anotherFunction: checkers.func.withProperties({
                aNumber: checkers.number
              })
            })
          });
          expect(checker(myFuncWithProps)).to.be.undefined;

          expect(checker(coveredFunction)).to.be.an.instanceOf(Error);
        });

        it(`should throw an error when the specified properties is not an object of functions`, () => {
          expect(() => {
            checkers.func.withProperties({
              thing1: checkers.bool,
              thing2: true
            });
          }).to.throw();
        });

      });
    });
  });

  describe('instanceof', () => {
    it('should check the instance of a class', () => {
      expect(checkers.instanceOf(RegExp)(/regex/)).to.be.undefined;
      expect(checkers.instanceOf(RegExp)({})).to.be.an.instanceOf(Error);
    });
  });

  describe('oneOf', () => {
    it('should pass when the value is one of the enums given', () => {
      expect(checkers.oneOf(['--,--`--,{@', '┐( ˘_˘)┌'])('┐( ˘_˘)┌')).to.be.undefined;
      expect(checkers.oneOf([null])(null)).to.be.undefined;
      expect(checkers.oneOf([5, false])(false)).to.be.undefined;
    });

    it('should fail when the value is not one of the enums given', () => {
      expect(checkers.oneOf([{}, 3.2])({})).to.be.an.instanceOf(Error);
      expect(checkers.oneOf(['ᕙ(⇀‸↼‶)ᕗ', '┬┴┬┴┤(･_├┬┴┬┴'])('(=^ェ^=)')).to.be.an.instanceOf(Error);
    });

    it(`should work with typeOrArrayOf and null`, () => {
      expect((checkers.oneOfType([
        checkers.oneOf([null, 'ehy', {a: 'b'}, undefined]), checkers.typeOrArrayOf(checkers.string)
      ]))(null)).to.be.undefined;
    });

  });

  describe('oneOfType', () => {
    it('should pass when the value type is one of the given types', () => {
      expect(checkers.oneOfType([checkers.bool, checkers.string])('hey')).to.be.undefined;
      expect(checkers.oneOfType([checkers.bool, checkers.string])(false)).to.be.undefined;
      expect(checkers.oneOfType([checkers.bool, checkers.instanceOf(RegExp)])(/regex/)).to.be.undefined;
      expect(checkers.oneOfType([checkers.bool, checkers.oneOf(['sup', 'Hey'])])('Hey')).to.be.undefined;
    });

    it('should fail when the value type is not one of the given types', () => {
      expect(checkers.oneOfType([checkers.object, checkers.string])(undefined)).to.be.an.instanceOf(Error);
      expect(checkers.oneOfType([checkers.object, checkers.string])(54)).to.be.an.instanceOf(Error);
    });

    it(`should have the full checker type of its children`, () => {
      const checker = checkers.oneOfType([
        checkers.shape({
          name: checkers.string,
          value: checkers.oneOfType([
            checkers.string, checkers.arrayOf(checkers.number).optional
          ]).optional
        }),
        checkers.func
      ]);
      expect(checker.type).to.eql({
        __apiCheckData: {optional: false, type: 'oneOfType'},
        oneOfType: [
          {
            __apiCheckData: {optional: false, type: 'shape', strict: false},
            shape: {
              name: 'String',
              value: {
                __apiCheckData: {
                  optional: true,
                  type: 'oneOfType'
                },
                oneOfType: [
                  'String',
                  {
                    __apiCheckData: {
                      optional: true,
                      type: 'arrayOf'
                    },
                    arrayOf: 'Number'
                  }
                ]
              }
            }
          },
          'Function'
        ]
      });
    });
  });

  describe('arrayOf', () => {
    it('should pass when the array contains only elements of a type of the type given', () => {
      expect(checkers.arrayOf(checkers.bool)([true, false, true])).to.be.undefined;
      expect(checkers.arrayOf(checkers.arrayOf(checkers.number))([[1, 2, 3], [4, 5, 6]])).to.be.undefined;
    });
    it('should fail when the value is not an array', () => {
      expect(checkers.arrayOf(checkers.func)(32)).to.be.an.instanceOf(Error);
    });
    it('should fail when one of the values does not match the type', () => {
      expect(checkers.arrayOf(checkers.number)([1, 'string', 3])).to.be.an.instanceOf(Error);
    });
  });

  describe(`typeOrArrayOf`, () => {
    it(`should allow passing a single type`, () => {
      expect(checkers.typeOrArrayOf(checkers.bool)(false)).to.be.undefined;
      expect(checkers.typeOrArrayOf(checkers.number)(3)).to.be.undefined;
    });
    it(`should allow passing an array of types`, () => {
      expect(checkers.typeOrArrayOf(checkers.number)([3, 4])).to.be.undefined;
      expect(checkers.typeOrArrayOf(checkers.string)(['hi', 'there'])).to.be.undefined;
    });
    it(`should fail if an item in the array is wrong type`, () => {
      expect(checkers.typeOrArrayOf(checkers.string)(['hi', new Date()])).to.be.an.instanceOf(Error);
    });
    it(`should fail if the single item is the wrong type`, () => {
      expect(checkers.typeOrArrayOf(checkers.object)(true)).to.be.an.instanceOf(Error);
      expect(checkers.typeOrArrayOf(checkers.array)('not array')).to.be.an.instanceOf(Error);
    });
  });

  describe('objectOf', () => {
    it('should pass when the object contains only properties of a type of the type given', () => {
      expect(checkers.objectOf(checkers.bool)({a: true, b: false, c: true})).to.be.undefined;
      expect(checkers.objectOf(checkers.objectOf(checkers.number))({
        a: {a: 1, b: 2, c: 3},
        b: {a: 4, b: 5, c: 6}
      })).to.be.undefined;
    });
    it('should fail when the value is not an object', () => {
      expect(checkers.objectOf(checkers.func)(32)).to.be.an.instanceOf(Error);
    });
    it('should fail when one of the properties does not match the type', () => {
      expect(checkers.objectOf(checkers.number)({a: 1, b: 'string', c: 3})).to.be.an.instanceOf(Error);
    });
  });

  describe('shape', () => {
    it('should pass when the object contains at least the properties of the types specified', () => {
      var check = checkers.shape({
        name: checkers.shape({
          first: checkers.string,
          last: checkers.string
        }),
        age: checkers.number,
        isOld: checkers.bool,
        walk: checkers.func,
        childrenNames: checkers.arrayOf(checkers.string)
      });
      var obj = {
        name: {
          first: 'Matt',
          last: 'Meese'
        },
        age: 27,
        isOld: false,
        walk: coveredFunction,
        childrenNames: []
      };
      expect(check(obj)).to.be.undefined;
    });

    it('should fail when the object is missing any of the properties specified', () => {
      var check = checkers.shape({
        scores: checkers.objectOf(checkers.number)
      });
      expect(check({sports: ['soccer', 'baseball']})).to.be.an.instanceOf(Error);
    });

    it('should have an optional function that does the same thing', () => {
      var check = checkers.shape({
        appliances: checkers.arrayOf(checkers.object)
      }).optional;
      expect(check({appliances: [{name: 'refridgerator'}]})).to.be.undefined;
    });

    it('should be false when passed a non-object', () => {
      var check = checkers.shape({
        friends: checkers.arrayOf(checkers.object)
      });
      expect(check([3])).to.be.an.instanceOf(Error);
    });

    it('should fail when the given object is missing properties', () => {
      var check = checkers.shape({
        mint: checkers.bool,
        chocolate: checkers.bool
      });
      expect(check({mint: true})).to.be.an.instanceOf(Error);
    });

    it('should pass when the given object is missing properties that are optional', () => {
      var check = checkers.shape({
        mint: checkers.bool,
        chocolate: checkers.bool.optional
      });
      expect(check({mint: true})).to.be.undefined;
    });

    it('should pass when it is strict and the given object conforms to the shape exactly', () => {
      var check = checkers.shape({
        mint: checkers.bool,
        chocolate: checkers.bool,
        milk: checkers.bool
      }).strict;
      expect(check({mint: true, chocolate: true, milk: true})).to.be.undefined;
    });

    it('should fail when it is strict and the given object has extra properties', () => {
      var check = checkers.shape({
        mint: checkers.bool,
        chocolate: checkers.bool,
        milk: checkers.bool
      }).strict;
      expect(check({mint: true, chocolate: true, milk: true, cookies: true})).to.be.an.instanceOf(Error);
    });

    it(`should fail when it is strict and it is an invalid shape`, () => {
      var check = checkers.shape({
        mint: checkers.bool,
        chocolate: checkers.bool,
        milk: checkers.bool
      }).strict;
      expect(check({mint: true, chocolate: true, milk: 42})).to.be.an.instanceOf(Error);
    });

    it(`should display the location of sub-children well`, () => {
      var obj = {
        person: {
          home: {
            location: {
              street: 324
            }
          }
        }
      };
      const check = checkers.shape({
        person: checkers.shape({
          home: checkers.shape({
            location: checkers.shape({
              street: checkers.string
            })
          })
        })
      });
      expect(check(obj).message).to.match(/street.*?at.*?person\/home\/location.*?must be.*?string/i);
    });

    it(`should add a helper when getting the type with addHelpers`, () => {
      const check = checkers.shape({
        mint: checkers.bool.optional,
        chocolate: checkers.bool,
        candy: checkers.shape({
          good: checkers.bool,
          bad: checkers.bool.optional
        })
      });
      const obj = {
        mint: false,
        candy: {}
      };
      const typeTypes = check.type({terse: true, obj, addHelpers: true});
      expect(typeTypes).to.eql({
        chocolate: 'Boolean <-- YOU ARE MISSING THIS',
        mint: 'Boolean (optional)',
        candy: {
          __apiCheckData: {
            strict: false, optional: false, type: 'shape',
            error: 'THIS IS THE PROBLEM: Required `good` not specified in `candy`. Must be `Boolean`'
          },
          shape: {
            good: 'Boolean <-- YOU ARE MISSING THIS'
          }
        }
      });
    });

    it(`should handle a checker with no type and still look ok`, () => {
      const check = checkers.shape({
        voyager: checkers.shape({
          seasons: coveredFunction
        })
      });
      const obj = {
        voyager: {
          seasons: 7
        }
      };
      const typeTypes = check.type({terse: true, obj, addHelpers: true});
      expect(typeTypes).to.eql({
        voyager: {
          __apiCheckData: {type: 'shape', strict: false, optional: false},
          shape: {
            seasons: 'coveredFunction'
          }
        }
      });
    });

    it(`should handle a checker with no type and not break when there's a failure`, () => {
      const check = checkers.shape({
        voyager: checkers.shape({
          seasons: coveredFunction
        })
      });
      const obj = {
        voyager: 'failure!?'
      };
      const typeTypes = check.type({terse: true, obj, addHelpers: true});
      expect(typeTypes).to.eql({
        voyager: {
          __apiCheckData: {type: 'shape', strict: false, optional: false, error: 'THIS IS THE PROBLEM: `voyager` must be `Object`'},
          shape: {
            seasons: 'coveredFunction <-- YOU ARE MISSING THIS'
          }
        }
      });
    });

    describe('ifNot', () => {

      it('should pass if the specified property exists but the other does not', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot('mint', checkers.bool),
          mint: checkers.shape.ifNot('cookies', checkers.bool)
        });
        expect(check({cookies: true})).to.be.undefined;
      });

      it('should fail if neither of the ifNot properties exists', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot('mint', checkers.bool),
          mint: checkers.shape.ifNot('cookies', checkers.bool)
        });
        expect(check({foo: true})).to.be.an.instanceOf(Error);
      });

      it('should pass if the specified array of properties do not exist', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot(['mint', 'chips'], checkers.bool)
        });
        expect(check({cookies: true})).to.be.undefined;
      });

      it('should fail if any of the specified array of properties exists', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot(['mint', 'chips'], checkers.bool)
        });
        expect(check({cookies: true, chips: true})).to.be.an.instanceOf(Error);
      });

      it('should fail even if both ifNots are optional', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot('mint', checkers.bool).optional,
          mint: checkers.shape.ifNot('cookies', checkers.bool).optional
        });
        expect(check({cookies: true, mint: true})).to.be.an.instanceOf(Error);
      });

      it('should fail if the specified property exists and the other does too', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot('mint', checkers.bool),
          mint: checkers.shape.ifNot('cookies', checkers.bool)
        });
        expect(check({cookies: true, mint: true})).to.be.an.instanceOf(Error);
      });

      it('should fail if it fails the specified checker', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot('mint', checkers.bool)
        });
        expect(check({cookies: 43})).to.be.an.instanceOf(Error);
      });

      it(`should have a legible type`, () => {
        var check = checkers.shape({
          name: checkers.shape({
            first: checkers.string,
            last: checkers.string
          }).strict,
          age: checkers.number,
          isOld: checkers.bool,
          walk: checkers.func,
          familyNames: checkers.objectOf(checkers.string),
          childrenNames: checkers.arrayOf(checkers.string),
          optionalStrictObject: checkers.shape({
            somethingElse: checkers.objectOf(checkers.shape({
              prop: checkers.func
            }).optional)
          }).strict.optional
        });
        expect(check.type.__apiCheckData).to.eql({
          strict: false, optional: false, type: 'shape'
        });
        expect(check.type()).to.eql({
          name: {
            __apiCheckData: {strict: true, optional: false, type: 'shape'},
            shape: {
              first: 'String',
              last: 'String'
            }
          },
          age: 'Number',
          isOld: 'Boolean',
          walk: 'Function',
          childrenNames: {
            __apiCheckData: {optional: false, type: 'arrayOf'},
            arrayOf: 'String'
          },
          familyNames: {
            __apiCheckData: {optional: false, type: 'objectOf'},
            objectOf: 'String'
          },
          optionalStrictObject: {
            __apiCheckData: {strict: true, optional: true, type: 'shape'},
            shape: {
              somethingElse: {
                __apiCheckData: {optional: false, type: 'objectOf'},
                objectOf: {
                  __apiCheckData: {optional: true, strict: false, type: 'shape'},
                  shape: {prop: 'Function'}
                }
              }
            }
          }
        });
      });

    });

    describe('onlyIf', () => {
      it('should pass only if the specified property is also present', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf('mint', checkers.bool)
        });
        expect(check({cookies: true, mint: true})).to.be.undefined;
      });

      it('should pass only if all specified properties are also present', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf(['mint', 'chip'], checkers.bool)
        });
        expect(check({cookies: true, mint: true, chip: true})).to.be.undefined;
      });

      it('should fail if the specified property is not present', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf('mint', checkers.bool)
        });
        expect(check({cookies: true})).to.be.an.instanceOf(Error);
      });

      it('should fail if any specified properties are not present', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf(['mint', 'chip'], checkers.bool)
        });
        expect(check({cookies: true, chip: true})).to.be.an.instanceOf(Error);
      });

      it('should fail if all specified properties are not present', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf(['mint', 'chip'], checkers.bool)
        });
        expect(check({cookies: true})).to.be.an.instanceOf(Error);
      });

      it('should fail if it fails the specified checker', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf(['mint', 'chip'], checkers.bool)
        });
        expect(check({cookies: 42, mint: true, chip: true})).to.be.an.instanceOf(Error);
      });

      it(`should not throw an error if you specify onlyIf with a checker`, () => {
        const __apiCheckDataChecker = checkers.shape({
          type: checkers.oneOf(['shape']),
          strict: checkers.oneOf([false])
        });
        const shapeChecker = checkers.func.withProperties({
          type: checkers.oneOfType([
            checkers.func.withProperties({
              __apiCheckData: __apiCheckDataChecker
            }),
            checkers.shape({
              __apiCheckData: __apiCheckDataChecker
            })
          ])
        });
        const check = checkers.shape({
          oneChecker: checkers.shape.onlyIf('otherChecker', shapeChecker).optional,
          otherChecker: shapeChecker.optional
        });
        const invalidValue = {
          oneChecker: checkers.shape({})
        };
        expect(() => {
          const result = check(invalidValue);
          expect(result).to.be.an.instanceOf(Error);
          check.type({addHelpers: true, obj: invalidValue}); // this throws the error. Bug. reproduced. ᕙ(⇀‸↼‶)ᕗ
        }).to.not.throw();
      });
    });
  });

  describe(`arguments`, () => {
    it(`should pass when passing arguments or an arguments-like object`, () => {
      function foo() {
        expect(checkers.args(arguments)).to.be.undefined;
      }

      foo('hi');
      expect(checkers.args({length: 0})).to.be.undefined;
    });
    it(`should fail when passing anything else`, () => {
      expect(checkers.args('hey')).to.be.an.instanceOf(Error);
      expect(checkers.args([])).to.be.an.instanceOf(Error);
      expect(checkers.args({})).to.be.an.instanceOf(Error);
      expect(checkers.args(true)).to.be.an.instanceOf(Error);
      expect(checkers.args(null)).to.be.an.instanceOf(Error);
      expect(checkers.args({length: 'not number'})).to.be.an.instanceOf(Error);
    });
  });

  describe('any', () => {
    it('should (almost) always pass', () => {
      expect(checkers.any(false)).to.be.undefined;
      expect(checkers.any({})).to.be.undefined;
      expect(checkers.any(RegExp)).to.be.undefined;
    });

    it(`should fail when passed undefined and it's not optional`, () => {
      expect(checkers.any()).to.be.an.instanceOf(Error);
    });

    it(`should pass when passed undefined and it's optional`, () => {
      expect(checkers.any.optional()).to.be.undefined;
    });
  });

  describe('optional', () => {
    it('all built in checkers should be optional', () => {
      _.each(checkers, checker => {
        expect(checker).to.have.property('optional');
        expect(checker.optional.isOptional).to.be.true;
      });
    });
  });
});
