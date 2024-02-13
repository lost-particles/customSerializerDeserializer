const util = require('../distribution').util;

test('(0 pts) sample test', () => {
  const emptyObj = {};
  const serialized = util.serialize(emptyObj);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toBe(emptyObj);
});


test('(0 pts) sample test', () => {
  const number = 42;
  const serialized = util.serialize(number);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toBe(number);
});

test('(0 pts) sample test', () => {
  const number = 42;
  const serialized = util.serialize(number);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toBe(number);
});

test('(0 pts) sample test', () => {
  const number = 42;
  const serialized = util.serialize(number);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toBe(number);
});

test('(0 pts) sample test', () => {
  const number = 42;
  const serialized = util.serialize(number);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toBe(number);
});

