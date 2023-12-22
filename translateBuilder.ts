import * as fs from 'fs';
import {glob, Glob} from 'glob';
import * as parser from '@babel/parser';
import traverse, {NodePath} from '@babel/traverse';
import fetch from 'node-fetch';

// components
import {GptResponse, Output} from './models';
import {checkArgs, hashString, normalizeString} from './utils';
import {CACHE_FILENAME} from './constants';

export const start = () => {
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
};

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
  console.log('args', translatorUrl, outputTargetDir, translateTargetDir);
  const targetTexts = await getTranslateTargetTxt(translateTargetDir);
  console.log('typeof targetTexts: ', typeof targetTexts);
  // if (!targetTexts) {
  //   throw Error(
  //     `JSX の解析に失敗しました。translateTargetDir: ${translateTargetDir}`
  //   );
  // }
  // console.info(`${targetTexts.length} 件のテキストが見つかりました`);
  //
  // const needGeneratedTexts = makeNeedGeneratedTexts(
  //   targetTexts,
  //   globalTextMapCache
  // );
  //
  // console.info(`${needGeneratedTexts.length} 件のテキストが未翻訳です`);
  //
  // if (needGeneratedTexts.length === 0) {
  //   console.log('生成が必要なテキストはありません。処理をスキップします');
  //   return;
  // }
  //
  // const response = await requestTranslatedData(
  //   needGeneratedTexts,
  //   translatorUrl
  // );
  //
  // console.log('response status: ', response.status);
  //
  // if (!(response.status === 200 && response.json)) {
  //   throw Error('chat-gpt へのリクエストが失敗しました');
  // }
  //
  // console.log('トークン使用量：', response.json.usage);
  //
  // const output = makeOutputMap(response.json.content, needGeneratedTexts);
  //
  // const globalTextMap = {
  //   ...globalTextMapCache,
  //   ...output
  // };
  //
  // writeOutputs(globalTextMap, outputTargetDir);
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

  console.info('typeof paths: ', typeof paths);

  if (!Array.isArray(paths)) return null;

  console.info(`${paths.length} 件の翻訳対象ファイルが見つかりました`);

  const targetTexts: string[] = [];

  console.info(`対象ファイル群から、テキストの抜き出しを開始します`);

  paths.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    traverse(ast, {
      JSXElement(path) {
        if (
          'name' in path.node.openingElement.name &&
          path.node.openingElement.name.name === 'GlobalText'
        ) {
          path.node.children.forEach(child => {
            if (child.type === 'JSXText') {
              const text = normalizeString(child.value);
              targetTexts.push(text);
              console.info('found text: ', text, text.length);
            }
          });
        }
      }
    });

    // 正規表現を使用して文字列リテラル内の GlobalText タグを検出する
    // シングルクォート、ダブルクォート、バッククォートを考慮
    const regex = /['"`]<GlobalText>(.*?)<\/GlobalText>['"`]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const text = match[1];
      targetTexts.push(text);
      console.log('found text in string literal:', text);
    }
  });

  console.info(`対象ファイル群から、テキストの抜き出しが完了しました`);
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
