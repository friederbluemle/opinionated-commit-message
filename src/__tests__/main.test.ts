import fs from 'fs';

import * as core from '@actions/core';

import * as mainImpl from '../mainImpl';
import * as commitMessages from '../commitMessages';

jest.mock('fs');
jest.mock('@actions/core');
jest.mock('../commitMessages');

/* eslint eqeqeq: "off", curly: "error" */

it('considers additional verbs.', () => {
  (commitMessages.retrieve as any).mockImplementation(() => [
    'Table SomeClass\n\nThis is a dummy commit.'
  ]);

  const mockSetFailed = jest.fn();
  (core as any).setFailed = mockSetFailed;

  (core as any).getInput = (name: string) =>
    name === 'additional-verbs' ? 'rewrap,table' : null;

  mainImpl.run();

  expect(mockSetFailed.mock.calls).toEqual([]);
});

it('considers additional verbs from path.', () => {
  (commitMessages.retrieve as any).mockImplementation(() => [
    'Table SomeClass\n\nThis is a dummy commit.'
  ]);

  const mockSetFailed = jest.fn();
  (core as any).setFailed = mockSetFailed;

  const pathToVerbs = 'src/verbs.txt';

  (core as any).getInput = (name: string) =>
    name === 'path-to-additional-verbs' ? pathToVerbs : null;

  (fs as any).existsSync = (path: string) => path === pathToVerbs;

  (fs as any).readFileSync = (path: string) => {
    if (path === pathToVerbs) {
      return 'rewrap\ntable';
    }

    throw new Error(`Unexpected readFileSync in the unit test from: ${path}`);
  };

  mainImpl.run();

  expect(mockSetFailed.mock.calls).toEqual([]);
});

it('considers allow-one-liners.', () => {
  (commitMessages.retrieve as any).mockImplementation(() => ['Do something']);

  const mockSetFailed = jest.fn();
  (core as any).setFailed = mockSetFailed;

  (core as any).getInput = (name: string) =>
    name === 'allow-one-liners' ? 'true' : null;

  mainImpl.run();

  expect(mockSetFailed.mock.calls).toEqual([]);
});

it('formats properly no error message.', () => {
  (commitMessages.retrieve as any).mockImplementation(() => [
    'Change SomeClass to OtherClass\n' +
      '\n' +
      'This replaces the SomeClass with OtherClass in all of the module \n' +
      'since Some class was deprecated.'
  ]);

  const mockSetFailed = jest.fn();
  (core as any).setFailed = mockSetFailed;

  mainImpl.run();

  expect(mockSetFailed.mock.calls).toEqual([]);
});

it('formats properly errors on a single message.', () => {
  (commitMessages.retrieve as any).mockImplementation(() => [
    'SomeClass to OtherClass\n\nSomeClass with OtherClass'
  ]);

  const mockSetFailed = jest.fn();
  (core as any).setFailed = mockSetFailed;

  mainImpl.run();
  expect(mockSetFailed.mock.calls).toEqual([
    [
      'The message 1 is invalid:\n' +
        '* The subject must start with a capitalized verb (e.g., "Change").\n' +
        'The original message was:\n' +
        'SomeClass to OtherClass\n' +
        '\n' +
        'SomeClass with OtherClass\n'
    ]
  ]);
});

it('formats properly errors on two messages.', () => {
  (commitMessages.retrieve as any).mockImplementation(() => [
    `SomeClass to OtherClass\n\n${'A'.repeat(73)}`,
    'Change other subject\n\nChange body'
  ]);

  const mockSetFailed = jest.fn();
  (core as any).setFailed = mockSetFailed;

  mainImpl.run();

  expect(mockSetFailed.mock.calls).toEqual([
    [
      `${'The message 1 is invalid:\n' +
        '* The subject must start with a capitalized verb (e.g., "Change").\n' +
        '* The line 3 of the message (line 1 of the body) exceeds ' +
        'the limit of 72 characters. The line contains 73 characters: "'}${'A'.repeat(
        73
      )}".\n` +
        `The original message was:\n` +
        `SomeClass to OtherClass\n` +
        `\n${'A'.repeat(73)}\n` +
        `\n` +
        `The message 2 is invalid:\n` +
        `* The first word of the subject ("Change") must not match ` +
        `the first word of the body.\n` +
        `The original message was:\n` +
        `Change other subject\n` +
        `\n` +
        `Change body\n`
    ]
  ]);
});
