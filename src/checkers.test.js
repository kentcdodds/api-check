/*jshint expr: true*/
var expect = require('chai').expect;
var _ = require('lodash-node');
function coveredFunction() {
  // this is only run so I can get 100% code coverage. I know right?
}
coveredFunction(); // yeah, code coverage. I'm OCD I guess...

describe('checkers', () => {
  var checkers = require('./checkers');
  describe('typeOfs', () => {
    it('should check string', () => {
      expect(checkers.string('string')).to.be.true;
      expect(checkers.string(3)).to.be.false;
    });
    it('should check bool', () => {
      expect(checkers.bool(true)).to.be.true;
      expect(checkers.bool('whatever')).to.be.false;
    });
    it('should check number', () => {
      expect(checkers.number(234)).to.be.true;
      expect(checkers.number(234.42)).to.be.true;
      expect(checkers.number(false)).to.be.false;
    });
    it('should check object', () => {
      expect(checkers.object({})).to.be.true;
      expect(checkers.object(null)).to.be.false;
      expect(checkers.object([])).to.be.false;
    });
    it('should check object.nullOk', () => {
      expect(checkers.object.nullOk({})).to.be.true;
      expect(checkers.object.nullOk(null)).to.be.true;
      expect(checkers.object.nullOk([])).to.be.false;
    });
    it('should check array', () => {
      expect(checkers.array([])).to.be.true;
      expect(checkers.array({})).to.be.false;
    });
    it('should check function', () => {
      expect(checkers.func(coveredFunction)).to.be.true;
      expect(checkers.func(null)).to.be.false;
    });
  });

  describe('instanceof', () => {
    it('should check the instance of a class', () => {
      expect(checkers.instanceOf(RegExp)(/regex/)).to.be.true;
      expect(checkers.instanceOf(RegExp)({})).to.be.false;
    });
  });

  describe('oneOf', () => {
    it('should pass when the value is one of the enums given', () => {
      expect(checkers.oneOf(['--,--`--,{@', '┐( ˘_˘)┌'])('┐( ˘_˘)┌')).to.be.true;
      expect(checkers.oneOf([5, false])(false)).to.be.true;
    });

    it('should fail when the value is not one of the enums given', () => {
      expect(checkers.oneOf([{}, 3.2])({})).to.be.false;
      expect(checkers.oneOf(['ᕙ(⇀‸↼‶)ᕗ', '┬┴┬┴┤(･_├┬┴┬┴'])('(=^ェ^=)')).to.be.false;
    });

  });

  describe('oneOfType', () => {
    it('should pass when the value type is one of the given types', () => {
      expect(checkers.oneOfType([checkers.bool, checkers.string])('hey')).to.be.true;
      expect(checkers.oneOfType([checkers.bool, checkers.string])(false)).to.be.true;
      expect(checkers.oneOfType([checkers.bool, checkers.instanceOf(RegExp)])(/regex/)).to.be.true;
      expect(checkers.oneOfType([checkers.bool, checkers.oneOf(['sup', 'Hey'])])('Hey')).to.be.true;
    });

    it('should fail when the value type is not one of the given types', () => {
      expect(checkers.oneOfType([checkers.object, checkers.string])(undefined)).to.be.false;
      expect(checkers.oneOfType([checkers.object, checkers.string])(54)).to.be.false;
    });
  });

  describe('arrayOf', () => {
    it('should pass when the array contains only elements of a type of the type given', () => {
      expect(checkers.arrayOf(checkers.bool)([true, false, true])).to.be.true;
      expect(checkers.arrayOf(checkers.arrayOf(checkers.number))([[1, 2, 3], [4, 5, 6]])).to.be.true;
    });
    it('should fail when the value is not an array', () => {
      expect(checkers.arrayOf(checkers.func)(32)).to.be.false;
    });
    it('should fail when one of the values does not match the type', () => {
      expect(checkers.arrayOf(checkers.number)([1, 'string', 3])).to.be.false;
    });
  });

  describe('objectOf', () => {
    it('should pass when the object contains only properties of a type of the type given', () => {
      expect(checkers.objectOf(checkers.bool)({a: true, b: false, c: true})).to.be.true;
      expect(checkers.objectOf(checkers.objectOf(checkers.number))({
        a: {a: 1, b: 2, c: 3},
        b: {a: 4, b: 5, c: 6}
      })).to.be.true;
    });
    it('should fail when the value is not an object', () => {
      expect(checkers.objectOf(checkers.func)(32)).to.be.false;
    });
    it('should fail when one of the properties does not match the type', () => {
      expect(checkers.objectOf(checkers.number)({a: 1, b: 'string', c: 3})).to.be.false;
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
      expect(check(obj)).to.be.true;
    });

    it('should fail when the object is missing any of the properties specified', () => {
      var check = checkers.shape({
        scores: checkers.objectOf(checkers.number)
      });
      expect(check({sports: ['soccer', 'baseball']})).to.be.false;
    });

    it('should have an optional function that does the same thing', () => {
      var check = checkers.shape({
        appliances: checkers.arrayOf(checkers.object)
      }).optional;
      expect(check({appliances: [{name: 'refridgerator'}]})).to.be.true;
    });

    it('should be false when passed a non-object', () => {
      var check = checkers.shape({
        friends: checkers.arrayOf(checkers.object)
      });
      expect(check([3])).to.be.false;
    });

    it('should fail when the given object is missing properties', () => {
      var check = checkers.shape({
        mint: checkers.bool,
        chocolate: checkers.bool
      });
      expect(check({mint: true})).to.be.false;
    });

    it('should pass when the given object is missing properties that are optional', () => {
      var check = checkers.shape({
        mint: checkers.bool,
        chocolate: checkers.bool.optional
      });
      expect(check({mint: true})).to.be.true;
    });

    it('should pass when it is strict and the given object conforms to the shape exactly', () => {
      var check = checkers.shape({
        mint: checkers.bool,
        chocolate: checkers.bool,
        milk: checkers.bool
      });
      check.strict = true;
      expect(check({mint: true, chocolate: true, milk: true})).to.be.true;
    });

    it('should fail when it is strict and the given object has extra properties', () => {
      var check = checkers.shape({
        mint: checkers.bool,
        chocolate: checkers.bool,
        milk: checkers.bool
      });
      check.strict = true;
      expect(check({mint: true, chocolate: true, milk: true, cookies: true})).to.be.false;
    });

    describe('ifNot', () => {

      it('should pass if the specified property exists but the other does not', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot('mint', checkers.bool)
        });
        expect(check({cookies: true})).to.be.true;
      });

      it('should pass if the specified array of properties do not exist', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot(['mint', 'chips'], checkers.bool)
        });
        expect(check({cookies: true})).to.be.true;
      });

      it('should fail if any of the specified array of properties exists', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot(['mint', 'chips'], checkers.bool)
        });
        expect(check({cookies: true, chips: true})).to.be.false;
      });

      it('should fail even if both ifNots are optional', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot('mint', checkers.bool).optional,
          mint: checkers.shape.ifNot('cookies', checkers.bool).optional
        });
        expect(check({cookies: true, mint: true})).to.be.false;
      });

      it('should fail if the specified property exists and the other does too', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot('mint', checkers.bool),
          mint: checkers.shape.ifNot('cookies', checkers.bool)
        });
        expect(check({cookies: true, mint: true})).to.be.false;
      });

      it('should fail if it fails the specified checker', () => {
        var check = checkers.shape({
          cookies: checkers.shape.ifNot('mint', checkers.bool)
        });
        expect(check({cookies: 43})).to.be.false;
      });

    });

    describe('onlyIf', () => {
      it('should pass only if the specified property is also present', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf('mint', checkers.bool)
        });
        expect(check({cookies: true, mint: true})).to.be.true;
      });

      it('should pass only if all specified properties are also present', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf(['mint', 'chip'], checkers.bool)
        });
        expect(check({cookies: true, mint: true, chip: true})).to.be.true;
      });

      it('should fail if the specified property is not present', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf('mint', checkers.bool)
        });
        expect(check({cookies: true})).to.be.false;
      });

      it('should fail if any specified properties are not present', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf(['mint', 'chip'], checkers.bool)
        });
        expect(check({cookies: true, chip: true})).to.be.false;
      });

      it('should fail if all specified properties are not present', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf(['mint', 'chip'], checkers.bool)
        });
        expect(check({cookies: true})).to.be.false;
      });

      it('should fail if it fails the specified checker', () => {
        var check = checkers.shape({
          cookies: checkers.shape.onlyIf(['mint', 'chip'], checkers.bool)
        });
        expect(check({cookies: 42, mint: true, chip: true})).to.be.false;
      });
    });
  });

  describe('any', () => {
    it('should always return true', () => {
      expect(checkers.any()).to.be.true;
      expect(checkers.any(false)).to.be.true;
      expect(checkers.any({})).to.be.true;
      expect(checkers.any(RegExp)).to.be.true;
    });
  });

  describe('optional', () => {
    it('should add the optional function to all of the checkers and it should have isOptional set to true', () => {
      _.each(checkers, checker => {
        var check = checker;
        if (!check.optional) {
          check = check([]);
        }
        expect(check).to.have.property('optional');
        expect(check.optional.isOptional).to.be.true;
      });
    });
  });
});
