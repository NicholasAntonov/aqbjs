/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  ListLiteral = types.ListLiteral,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('ListLiteral', function () {
  it('returns an expression', function () {
    var expr = new ListLiteral([]);
    expect(expr).to.be.an(types._Expression);
    expect(expr.toAQL).to.be.a('function');
  });
  it('clones ListLiteral instances', function () {
    var src = new ListLiteral([1, 2, 3]),
      copy = new ListLiteral(src);
    expect(src.toAQL()).to.equal(copy.toAQL());
    expect(src).not.to.equal(copy);
  });
  it('wraps arrays', function () {
    var arr = [1, 2, 3, 4];
    var expr = new ListLiteral(arr);
    expect(expr.value).to.be.an(Array);
    expect(expr.value.length).to.equal(arr.length);
  });
  it('auto-casts array values', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    var expr = new ListLiteral(arr);
    for (var i = 0; i < arr.length; i++) {
      expect(expr.value[i].constructor).to.equal(ctors[i]);
    }
  });
  it('does not accept non-array values', function () {
    var values = [
      (function () {return arguments;}()),
      {0: 'a', 1: 'b', 2: 'c'},
      new types.StringLiteral('abc'),
      42,
      false,
      'hello',
      /absurd/,
      function () {},
      {}
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new ListLiteral(values[i]);}).to.throwException(isAqlError);
    }
  });
});