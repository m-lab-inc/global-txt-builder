import {main} from './translateBuilder';
import * as fs from 'fs';

import {CACHE_FILENAME} from './constants';
import {checkArgs} from './utils';

const args = checkArgs();

console.log(`${args.outputTargetDir}/${CACHE_FILENAME}`);

try {
  // キャッシュの json を取得
  const file = fs.readFileSync(
    `${args.outputTargetDir}/${CACHE_FILENAME}`,
    'utf8'
  );
  const jsonObject = JSON.parse(file);
  main({...args, globalTextMapCache: jsonObject});
} catch (e) {
  // キャッシュがなければ参照しない
  console.info('キャッシュが見つかりませんでした、新しく生成します');
  const jsonObject = JSON.parse('{}');
  main({...args, globalTextMapCache: jsonObject});
}
