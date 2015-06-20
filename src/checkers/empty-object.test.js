import emptyObject from './empty-object';

describe(`emptyObject`, () => {
  let checker;
  beforeEach(() => {
    checker = emptyObject(false);
  });
  it(`should pass when given an empty object`, () => {
    expect(checker({})).to.be.undefined;
  });

  it(`should fail when given anything but an empty object`, () => {
    expect(checker({foo: 'bar'})).to.be.an.instanceOf(Error);
    expect(checker(null)).to.be.an.instanceOf(Error);
    expect(checker([])).to.be.an.instanceOf(Error);
    expect(checker(() => {})).to.be.an.instanceOf(Error);
  });
});
