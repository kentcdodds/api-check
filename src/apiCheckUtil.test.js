/*jshint expr: true*/
var expect = require('chai').expect;
describe('apiCheckUtil', () => {
  var {each} = require('./apiCheckUtil');
  var checkers = require('./checkers');

  describe('each', () => {
    it('should iterate over objects', () => {
      var called = [];
      each({a: 'a', b: 'b'}, (val, prop) => {
        called.push({val, prop});
      });
      expect(called).to.eql([{val: 'a', prop: 'a'}, {val: 'b', prop: 'b'}]);
    });

    it('should exit objects early if false is explicitly returned', () => {
      var called = [];
      var ret = each({a: 'a', b: 'b', c: 'c', d: 'd'}, (val, prop) => {
        if (prop === 'c') {
          return false;
        }
        called.push({val, prop});
      });
      expect(called).to.eql([{val: 'a', prop: 'a'}, {val: 'b', prop: 'b'}]);
      expect(ret).to.be.false;
    });

    it('should not iterate over properties that are not the object\'s own', () => {
      var called = [];
      var Daddy = function() {
        this.a = 'a';
        this.b = 'b';
      };
      Daddy.prototype.x = 'x';
      var man = new Daddy();
      each(man, (val, prop) => {
        called.push({val, prop});
      });
      expect(called).to.eql([{val: 'a', prop: 'a'}, {val: 'b', prop: 'b'}]);
    });

    it('should iterate over arrays', () => {
      var called = [];
      each([1, 2], (val, index) => {
        called.push({val, index});
      });
      expect(called).to.eql([{val: 1, index: 0}, {val: 2, index: 1}]);
    });

    it('should exit arrays early if false is explicitly returned', () => {
      var called = [];
      var ret = each([1, 2, 3, 4], (val, index) => {
        if (index > 1) {
          return false;
        }
        called.push({val, index});
      });
      expect(called).to.eql([{val: 1, index: 0}, {val: 2, index: 1}]);
      expect(ret).to.be.false;
    });
  });


});
