import apiCheckUtil from '../api-check-util';
const {checkerHelpers, getError, typeOf} = apiCheckUtil;
const {setupChecker} = checkerHelpers;

export default emptyObjectCheckGetter;

function emptyObjectCheckGetter(disabled) {
  const type = 'empty object';
  return setupChecker(function emptyObjectChecker(val, name, location) {
    if (typeOf(val) !== 'object' || val === null || Object.keys(val).length) {
      return getError(name, location, type);
    }
  }, {type}, disabled);
}
