var recurse = require('../');
var test = require('tap').test;
var fs = require('fs');
var testfs = require('testfs');

var files = [
  '/1.txt',
  '/2.tar.gz',
  '/sub/3.txt',
  '/sub2/4.jpg'
]

test('filter write txts', function (t) {
  var d = 'filter-write-txts';
  t.plan(3);

  var fs = testfs(d, files, function (err) {
    var writes = 0;

    var txtfilter = function (relname, stat) {
      return !stat.isDirectory() && relname.match(/\.txt$/);
    };
    var txts = recurse(d, {writefilter: txtfilter});
    txts.on('data', function (data) {
      t.similar(data, /\d\.txt/);
      writes++;
    });
    txts.on('end', function () {
      t.equal(writes, 2);
      fs.rm();
    });
  });
});

test('filter write dirs', function (t) {
  var d = 'filter-write-dirs';
  t.plan(3);

  var fs = testfs(d, files, function (err) {
    var writes = 0;

    var dirfilter = function (relname, stat) {
      return stat.isDirectory();
    };
    var dirs = recurse(d, {writefilter: dirfilter});
    dirs.on('data', function (data) {
      t.similar(data, new RegExp('^' + d + '/sub\\d?$'));
      writes++;
    });
    dirs.on('end', function () {
      t.equal(writes, 2);
      fs.rm();
    });
  });
});

test('filter nonrecursive', function (t) {
  var d = 'filter-nonrecursive';
  t.plan(3);

  var fs = testfs(d, files, function (err) {
    var writes = 0;

    var nonrecursivefilter = function (relname, stat) {
      return false;
    };
    var nonrecursive = recurse(d, {recursefilter: nonrecursivefilter});
    nonrecursive.on('data', function (data) {
      t.similar(data, new RegExp('^' + d + '/[12]\\.(txt|tar\\.gz)$'));
      writes++;
    });
    nonrecursive.on('end', function () {
      t.equal(writes, 2);
      fs.rm();
    });
  });
});

test('filter recurse specific dir', function (t) {
  var d = 'filter-recurse-specific-dir';
  t.plan(4);

  var fs = testfs(d, files, function (err) {
    var writes = 0;

    var nonrecursivefilter = function (relname, stat) {
      return stat.isDirectory() && relname.match(/\/sub2$/);
    };
    var nonrecursive = recurse(d, {recursefilter: nonrecursivefilter});
    nonrecursive.on('data', function (data) {
      t.similar(data, /[124]\.(txt|tar\.gz|jpg)$/);
      writes++;
    });
    nonrecursive.on('end', function () {
      t.equal(writes, 3);
      fs.rm();
    });
  });
});
