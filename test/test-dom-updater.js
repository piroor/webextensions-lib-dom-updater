/*
 license: The MIT License, Copyright (c) 2020 YUKI "Piro" Hiroshi
*/
'use strict';

import jsdom from 'jsdom';
import { DOMUpdater } from '../index.js';

import { assert } from 'tiny-esm-test-runner';
const { is } = assert;

const { JSDOM } = jsdom;
const dom = new JSDOM();
const document = dom.window.document;

function createNode(source) {
  const node = document.createElement('div');
  node.appendChild(createFragment(source));
  return node;
}

function createFragment(source) {
  const range = document.createRange();
  range.setStart(document.body, 0);
  const contents = range.createContextualFragment(source.trim());
  range.detach();
  return contents;
}

function assertUpdated(from, to, steps) {
  const fromNode = createNode(from);
  const actualSteps = DOMUpdater.update(fromNode, createFragment(to));
  is(createNode(to).innerHTML, fromNode.innerHTML);
  if (typeof steps == 'number')
    is(steps, actualSteps);
}

export function testUpdateAttributes() {
  assertUpdated(
    `<span class="class1 class2"
           data-updated="true"
           data-removed="true">contents</span>`,
    `<span class="class1 class2 class3"
           data-updated="false"
           data-added="true">contents</span>`,
    4
  );
}

export function testUpdateNodes() {
  assertUpdated(
    `<span id="item1">contents</span>
     <span id="item2">contents</span>
     <span id="item3">contents</span>
     <span id="item4">contents</span>
     <span id="item5">contents</span>
     <span id="item6">contents</span>`,
    `<span id="item3">contents</span>
     <span id="item4">contents</span>
     <span id="item5">contents</span>
     <span id="item6">contents</span>
     <span id="item7">contents</span>
     <span id="item8">contents</span>`,
    1 /* deletion */ + 1 /* insertion */
  );
}

export function testUpdateReplacedNodes() {
  assertUpdated(
    `<span id="item1">contents</span>
     <span id="item2">contents</span>
     <span id="item3">contents</span>
     <span id="item4">contents</span>
     <span id="item5">contents</span>
     <span id="item6">contents</span>`,
    `<span id="item1">contents</span>
     <span id="item2">contents</span>
     <span id="item7">contents</span>
     <span id="item8">contents</span>
     <span id="item5">contents</span>
     <span id="item6">contents</span>`,
    2 /* deletion */ + 2 /* insertion */
  );
}

export function testUpdateNodesAndAttributes() {
  assertUpdated(
    `<span id="item1">contents</span>
     <span id="item2">contents</span>
     <span id="item3" part="active">contents, active</span>
     <span id="item4">contents</span>
     <span id="item5">contents</span>
     <span id="item6">contents</span>`,
    `<span id="item3">contents, old active</span>
     <span id="item4">contents</span>
     <span id="item5">contents</span>
     <span id="item6" part="active">contents, new active</span>
     <span id="item7">contents</span>
     <span id="item8">contents</span>`,
    1 /* item deletion */ + 1 /* iteminsertion */ +
      1 /* remove attr */ + 1 /* replace text */ +
      1 /* remove attr */ + 1 /* replace text */
  );
}

export function testUpdateWithNoHint() {
  assertUpdated(
    `<span>contents 1</span>
     <span>contents 2</span>
     <span part="active">contents 3, active</span>
     <span>contents 4</span>
     <span>contents 5</span>
     <span>contents 6</span>`,
    `<span>contents 3, old active</span>
     <span>contents 4</span>
     <span>contents 5</span>
     <span part="active">contents 6, new active</span>
     <span>contents 7</span>
     <span>contents 8</span>`
  );
}
