#!/usr/bin/env node
import {start} from './translateBuilder';

if (require.main === module) {
  start();
}

export {hashString, getTranslatedTxt, normalizeString} from './utils';
