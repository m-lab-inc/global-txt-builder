import * as crypto from 'crypto';
import {Output} from './models';

export const hashString = (str: string) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

export const normalizeString = (str: string) => {
  // 連続するスペースを単一のスペースに置換し、前後の空白を削除
  return str.replace(/\s+/g, ' ').trim();
};

export const checkArgs = () => {
  console.log('process.argv', process.argv);
  if (process.argv.length !== 5) {
    throw Error('引数が不正です');
  }
  return {
    translatorUrl: process.argv[2],
    outputTargetDir: process.argv[3],
    translateTargetDir: process.argv[4]
  };
};

export const getTranslatedTxt = ({
  lang,
  reactNode,
  globalTextMap
}: {
  lang: string;
  reactNode: any;
  globalTextMap: Output;
}) => {
  if (typeof reactNode === 'string') {
    if (!lang) return reactNode;
    const normalizedTxt = normalizeString(reactNode);
    console.info('length', normalizedTxt.length);
    const hashedStr = hashString(normalizedTxt);
    const globalTextMapItem = globalTextMap[hashedStr];
    if (globalTextMapItem) {
      return globalTextMapItem[lang];
    } else {
      console.info('マップがありません', reactNode, hashedStr);
    }
    return reactNode;
  } else {
    throw Error('reactNode は、string である必要があります');
  }
};
