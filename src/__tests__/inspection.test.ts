import * as inspection from '../inspection';

it('reports no errors on correct multi-line message.', () => {
  const message =
    'Change SomeClass to OtherClass\n' +
    '\n' +
    'This replaces the SomeClass with OtherClass in all of the module \n' +
    'since Some class was deprecated.';

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([]);
});

it('reports no errors on OK multi-line message with allowed one-liners.', () => {
  const message =
    'Change SomeClass to OtherClass\n' +
    '\n' +
    'This replaces the SomeClass with OtherClass in all of the module \n' +
    'since Some class was deprecated.';

  const errors = inspection.check(message, new Set<string>(), true);
  expect(errors).toEqual([]);
});

it('reports no errors on OK single-line message with allowed one-liners.', () => {
  const message = 'Change SomeClass to OtherClass';

  const errors = inspection.check(message, new Set<string>(), true);
  expect(errors).toEqual([]);
});

it('tolerates hash code in the subject.', () => {
  const message =
    'Unify all license files to LICENSE.txt naming (#43)\n' +
    '\n' +
    'The license files naming was inconsistent (`LICENSE.TXT` and \n' +
    '`LICENSE.txt`). This makes them all uniform (`LICENSE.txt`).';

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([]);
});

it('reports too few lines with disallowed one-liners.', () => {
  const message = 'Change SomeClass to OtherClass';
  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([
    'Expected at least three lines (subject, empty, body), but got: 1'
  ]);
});

it('reports missing body with disallowed one-liners.', () => {
  const message = 'Change SomeClass to OtherClass\n\n';
  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual(['Unexpected empty body']);
});

it('reports missing body with allowed one-liners.', () => {
  const message = 'Change SomeClass to OtherClass\n';
  const errors = inspection.check(message, new Set<string>(), true);
  expect(errors).toEqual([
    'Expected at least three lines (subject, empty, body) ' +
      'in a multi-line message, but got: 2'
  ]);
});

it('reports on missing empty line between subject and body.', () => {
  const message =
    'Change SomeClass to OtherClass\n' +
    '---\n' +
    'This replaces the SomeClass with OtherClass in all of the module \n' +
    'since Some class was deprecated.';

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([
    'Expected an empty line between the subject and the body, ' +
      'but got a second line of length: 3'
  ]);
});

it('reports the subject starting with a non-capitalized word.', () => {
  const message =
    'SomeClass to OtherClass\n' +
    '\n' +
    'This replaces the SomeClass with OtherClass in all of the module \n' +
    'since Some class was deprecated.';

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([
    'The subject must start with a capitalized verb (e.g., "Change").'
  ]);
});

it(
  'reports the subject starting with a non-verb ' +
    'with no additional verbs given.',
  () => {
    const message =
      'Replaced SomeClass to OtherClass\n' +
      '\n' +
      'This replaces the SomeClass with OtherClass in all of the module \n' +
      'since Some class was deprecated.';

    const errors = inspection.check(message, new Set<string>(), false);
    expect(errors.length).toBe(1);
    expect(errors[0].startsWith('The subject must start in imperative mood'));
  }
);

it(
  'reports the subject starting with a non-verb ' +
    'with additional verbs given.',
  () => {
    const message =
      'Replaced SomeClass to OtherClass\n' +
      '\n' +
      'This replaces the SomeClass with OtherClass in all of the module \n' +
      'since Some class was deprecated.';

    const errors = inspection.check(
      message,
      new Set<string>(['table']),
      false
    );
    expect(errors.length).toBe(1);
    expect(errors[0].startsWith('The subject must start in imperative mood'));
  }
);

it('accepts the subject starting with an additional verb.', () => {
  const message = 'Table that for me\n\nThis is a dummy commit.';
  const errors = inspection.check(
    message,
    new Set<string>(['table']),
    false
  );
  expect(errors).toEqual([]);
});

it('reports the subject ending in a dot.', () => {
  const message =
    'Change SomeClass to OtherClass.\n' +
    '\n' +
    'This replaces the SomeClass with OtherClass in all of the module \n' +
    'since Some class was deprecated.';

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual(["The subject must not end with a dot ('.')."]);
});

it('reports an incorrect one-line message with allowed one-liners.', () => {
  const message = 'Change SomeClass to OtherClass.';

  const errors = inspection.check(message, new Set<string>(), true);
  expect(errors).toEqual(["The subject must not end with a dot ('.')."]);
});

it('reports too long a body line.', () => {
  const message =
    'Change SomeClass to OtherClass\n' +
    '\n' +
    'This replaces the SomeClass with OtherClass in all of the module ' +
    'since Some class was deprecated.';

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([
    'The line 3 of the message (line 1 of the body) exceeds the limit of ' +
      '72 characters. The line contains 97 characters: ' +
      '"This replaces the SomeClass with OtherClass in all of the module since ' +
      'Some class was deprecated.".'
  ]);
});

it('accepts a body line of exactly 72 characters.', () => {
  const message =
    'Do something\n' +
    '\n' +
    'This patch fixes a typo in the readme file where this project was called\n' +
    'dead-csharp instead of doctest-csharp.\n' +
    '1234567890' +
    '1234567890' +
    '1234567890' +
    '1234567890' +
    '1234567890' +
    '1234567890' +
    '1234567890' +
    '12';

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([]);
});

it('ignores the carriage return.', () => {
  const message =
    'Do something\n' +
    '\n' +
    'This patch fixes a typo in the readme file where this project was called\r\n' +
    'dead-csharp instead of doctest-csharp.\r\n' +
    '1234567890' +
    '1234567890' +
    '1234567890' +
    '1234567890' +
    '1234567890' +
    '1234567890' +
    '1234567890' +
    '12';

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([]);
});

it('accepts body that does not start with a word.', () => {
  const message = 'Change SomeClass to OtherClass\n\n* Do something';

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([]);
});

it('reports duplicate starting word in subject and body.', () => {
  const message =
    'Change SomeClass to OtherClass\n' +
    '\n' +
    'Change SomeClass so that OtherClass does not conflict..';

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([
    'The first word of the subject ("Change") must not match ' +
      'the first word of the body.'
  ]);
});

it('ignores merge messages.', () => {
  const message = "Merge branch 'V20DataModel' into miho/Conform-to-spec";

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([]);
});

it('ignores URL on a separate line.', () => {
  const url =
    'http://mristin@some-domain.com/some/very/very/very/very/' +
    'very/very/very/long/path/index.html';

  const message = `Do something

This patch does something with the URL:
${url}
The next line conforms to the line length.`;

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([]);
});

it('ignores URL on a separate line, but reports non-conform lines.', () => {
  const long = 'long, long, long, long, long, long, long, long, long';
  const url =
    'http://mristin@some-domain.com/some/very/very/very/very/' +
    'very/very/very/long/path/index.html';

  const message = `Do something

This ${long} patch does something with the URL.
${url}`;

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([
    'The line 3 of the message (line 1 of the body) exceeds ' +
      'the limit of 72 characters. The line contains 92 characters: ' +
      `"This ${long} patch does something with the URL.".`
  ]);
});

it('ignores link definitions.', () => {
  const url =
    'http://mristin@some-domain.com/some/very/very/very/very/' +
    'very/very/very/long/path/index.html';

  const message = `Do something

This patch does something with the URL: [1]

[1]: ${url}

The next line conforms to the line length.`;

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([]);
});

it('ignores link definitions, but reports non-conform lines.', () => {
  const url =
    'http://mristin@some-domain.com/some/very/very/very/very/' +
    'very/very/very/long/path/index.html';
  const long = 'long, long, long, long, long, long, long, long, long';

  const message = `Do something

This patch does something with the URL: [1]

[1]: ${url}

The ${long} line is too long.`;

  const errors = inspection.check(message, new Set<string>(), false);
  expect(errors).toEqual([
    'The line 7 of the message (line 5 of the body) exceeds ' +
      'the limit of 72 characters. The line contains 74 characters: ' +
      `"The ${long} line is too long.".`
  ]);
});
