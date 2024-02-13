const util = require('../distribution').util;

test('(0 pts) sample test', () => {
  const emptyObj = {};
  const serialized = util.serialize(emptyObj);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toEqual(emptyObj);
});


test('(0 pts) sample test', () => {
  const emptyList = [];
  const serialized = util.serialize(emptyList);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toEqual(emptyList);
});

test('(0 pts) sample test', () => {
  const boolean = true;
  const serialized = util.serialize(boolean);
  const deserialized = util.deserialize(serialized);
  expect(deserialized).toBe(boolean);
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

