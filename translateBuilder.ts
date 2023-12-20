import * as fs from 'fs';
import {glob} from 'glob';
import * as parser from '@babel/parser';
import traverse, {NodePath} from '@babel/traverse';
import fetch from 'node-fetch';

// components
import {GptResponse, Output} from './models';
import {hashString, normalizeString} from './utils';
import {CACHE_FILENAME} from './constants';

export const main = async ({
  translatorUrl,
  outputTargetDir,
  globalTextMapCache,
  translateTargetDir
}: {
  translatorUrl: string;
  outputTargetDir: string;
  globalTextMapCache: object;
  translateTargetDir: string;
}) => {
  const targetTexts = await getTranslateTargetTxt(translateTargetDir);
  if (!targetTexts) {
    throw Error('JSX の解析に失敗しました');
  }
  console.log('globalTextMapCache!!', globalTextMapCache);
  const needGeneratedTexts = makeNeedGeneratedTexts(
    targetTexts,
    globalTextMapCache
  );

  // console.log('needGeneratedTexts', needGeneratedTexts);

  if (needGeneratedTexts.length === 0) {
    console.log('生成が必要なテキストはありません。処理をスキップします');
    return;
  }

  const response = await requestTranslatedData(
    needGeneratedTexts,
    translatorUrl
  );

  console.log('response', response);

  if (!(response.status === 200 && response.json)) {
    throw Error('chat-gpt へのリクエストが失敗しました');
  }

  console.log('トークン使用量：', response.json.usage);

  const output = makeOutputMap(response.json.content, needGeneratedTexts);

  const globalTextMap = {
    ...globalTextMapCache,
    ...output
  };

  writeOutputs(globalTextMap, outputTargetDir);
};

const makeNeedGeneratedTexts = (
  targetTexts: string[],
  globalTextMapCache: any
) => {
  const hashedTargetTexts = targetTexts.map(text => {
    return hashString(text);
  });
  const needGeneratedTexts: string[] = [];
  hashedTargetTexts.forEach((hash, index) => {
    const isExist = Boolean(globalTextMapCache[hash]);
    if (!isExist) {
      needGeneratedTexts.push(targetTexts[index]);
    }
  });
  console.log('hashedTargetTexts', hashedTargetTexts, hashedTargetTexts.length);
  return needGeneratedTexts;
};

const writeOutputs = (globalTextMap: Output, outputTargetDir: string) => {
  const globalTextMapCacheOutput = `${JSON.stringify(globalTextMap)}`;

  fs.writeFileSync(
    `${outputTargetDir}/${CACHE_FILENAME}`,
    globalTextMapCacheOutput,
    'utf8'
  );
};

const makeOutputMap = (json: string, needGeneratedTexts: string[]) => {
  const translated: {[lang: string]: string[]} = JSON.parse(json);
  console.log('translated', translated);
  const output: Output = {};
  needGeneratedTexts.forEach((text, index) => {
    const hashedText = hashString(text);
    for (const key in translated) {
      const translatedTxt = translated[key][index];

      if (!translatedTxt) continue;

      if (output[hashedText]) {
        output[hashedText] = {
          ...output[hashedText],
          [key]: translatedTxt
        };
      } else {
        output[hashedText] = {
          [key]: translatedTxt
        };
      }
    }
  });
  return output;
};

const getTranslateTargetTxt = async (translateTargetDir: string) => {
  // src ディレクトリ内の全 .tsx/.jsx ファイルを検索
  const paths = await glob(`${translateTargetDir}/**/*.+(tsx|jsx)`);

  if (!Array.isArray(paths)) return null;

  const targetTexts: string[] = [];

  paths.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    traverse(ast, {
      JSXElement(path) {
        // const openingElementName = path.node.openingElement.name;

        // if (path.node.openingElement.name.name === 'GlobalText') {
        if (
          'name' in path.node.openingElement.name &&
          path.node.openingElement.name.name === 'GlobalText'
        ) {
          path.node.children.forEach(child => {
            if (child.type === 'JSXText') {
              const text = normalizeString(child.value);
              console.log('found text!!', text, text.length);
              targetTexts.push(text);
            }
          });
        }
      }
    });
  });
  return targetTexts;
};

const requestTranslatedData = async (
  targetTexts: string[],
  translatorUrl: string
): Promise<{status: number; json: GptResponse | null}> => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const body = JSON.stringify({text: targetTexts});
  console.info('Start ChatGPT request.');
  const response = await fetch(translatorUrl, {
    method: 'POST',
    body: body,
    headers: headers
  }).then(response => {
    return response
      .json()
      .catch(error => {
        console.log('error!', error);
        return {status: response.status, json: null};
      })
      .then(json => {
        const res = json as GptResponse;
        return {
          status: response.status,
          json: res
        };
      });
  });
  console.info('End ChatGPT request.');
  return response;
};
