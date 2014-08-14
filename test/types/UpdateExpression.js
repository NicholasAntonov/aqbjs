/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  UpdateExpression = types.UpdateExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('UpdateExpression', function () {
  it('returns a statement', function () {
    var expr = new UpdateExpression(null, 'x', 'y', 'z');
    expect(expr).to.be.a(types._Statement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates an UPDATE statement', function () {
    expect(new UpdateExpression(null, 'x', 'y', 'z').toAQL()).to.equal('UPDATE x WITH y IN z');
  });
  it('auto-casts expressions', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    for (var i = 0; i < arr.length; i++) {
      expect(new UpdateExpression(null, arr[i], 'y', 'z').expr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new UpdateExpression(null, op, 'y', 'z').toAQL()).to.equal('UPDATE (x) WITH y IN z');
  });
  it('wraps Statement expressions in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new UpdateExpression(null, st, 'y', 'z').toAQL()).to.equal('UPDATE (x) WITH y IN z');
  });
  it('wraps PartialStatement expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new UpdateExpression(null, ps, 'y', 'z').toAQL()).to.equal('UPDATE (x) WITH y IN z');
  });
  it('auto-casts with-expressions', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    for (var i = 0; i < arr.length; i++) {
      expect(new UpdateExpression(null, 'x', arr[i], 'z').withExpr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation with-expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'y';};
    expect(new UpdateExpression(null, 'x', op, 'z').toAQL()).to.equal('UPDATE x WITH (y) IN z');
  });
  it('wraps Statement with-expressions in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'y';};
    expect(new UpdateExpression(null, 'x', st, 'z').toAQL()).to.equal('UPDATE x WITH (y) IN z');
  });
  it('wraps PartialStatement with-expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'y';};
    expect(new UpdateExpression(null, 'x', ps, 'z').toAQL()).to.equal('UPDATE x WITH (y) IN z');
  });
  it('wraps well-formed strings as collection names', function () {
    var values = [
      '_',
      '_x',
      'all_lower_case',
      'snakeCaseAlso',
      'CamelCaseHere',
      'ALL_UPPER_CASE',
      '__cRaZy__'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new UpdateExpression(null, 'x', 'y', values[i]).collection.toAQL()).to.equal(values[i]);
    }
  });
  it('does not accept malformed strings as collection names', function () {
    var values = [
      '',
      '-x',
      'in-valid',
      'also bad',
      'überbad',
      'spaß'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new UpdateExpression(null, 'x', 'y', values[i]);}).to.throwException(isAqlError);
    }
  });
  it('does not accept any other values as collection names', function () {
    var values = [
      new types.StringLiteral('for'),
      new types.RawExpression('for'),
      new types.SimpleReference('for'),
      new types.Keyword('for'),
      new types.NullLiteral(null),
      42,
      true,
      function () {},
      {},
      []
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new UpdateExpression(null, 'x', 'y', values[i]);}).to.throwException(isAqlError);
    }
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new UpdateExpression(ps, 'x', 'y', 'z').toAQL()).to.equal('$ UPDATE x WITH y IN z');
  });
  describe('options', function () {
    var expr = new UpdateExpression(null, 'x', 'y', 'z');
    it('returns an UpdateExpressionWithOptions', function () {
      var optExpr = expr.options({});
      expect(optExpr).to.be.a(types._UpdateExpressionWithOptions);
      expect(optExpr.toAQL).to.be.a('function');
    });
    it('wraps objects', function () {
      var obj = {a: 1, b: 2, c: 3};
      var optExpr = expr.options(obj);
      expect(optExpr.opts.value).to.be.an(Object);
      expect(Object.keys(optExpr.opts.value)).to.eql(Object.keys(obj));
    });
    it('clones ObjectLiteral instances', function () {
      var src = new types.ObjectLiteral({a: 1, b: 2, c: 3}),
        copy = expr.options(src).opts;
      expect(src.toAQL()).to.equal(copy.toAQL());
      expect(src).not.to.equal(copy);
    });
  });
});
