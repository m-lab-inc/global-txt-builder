import React, {FC, useMemo} from 'react';
import {hashString, normalizeString} from '../utils';
import {Output} from '../models';

interface Props {
  children: React.ReactNode;
  WrapperComponent: React.ComponentType<{children: React.ReactNode}>;
  globalTextMap: Output;
  lang?: string;
}

export const GlobalText = React.memo(
  ({children, lang, WrapperComponent, globalTextMap}: Props) => {
    const getTranslatedTxt = (): string => {
      if (typeof children === 'string') {
        if (!lang) return children;
        const normalizedTxt = normalizeString(children);
        console.log('length', normalizedTxt.length);
        const hashedStr = hashString(normalizedTxt);
        const globalTextMapItem = globalTextMap[hashedStr];
        if (globalTextMapItem) {
          return globalTextMapItem[lang];
        } else {
          console.log('マップがありません', children, hashedStr);
        }
        return children;
      } else {
        throw Error('GlobalText の children は、string である必要があります');
      }
    };

    const translatedTxt = getTranslatedTxt();

    return <WrapperComponent>{translatedTxt}</WrapperComponent>;
  }
);
