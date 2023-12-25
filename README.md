# 使用者向け

## インストール

```shell
yarn add git+https://github.com/m-lab-inc/global-txt-builder.git
```

シンボリックリンクがはられているか下記のコマンドで確認可能

"create-global-txt" があればOK

```shell
ls node_modules/.bin
```

## 多言語マップを生成する

上記でインストールした create-global-txt コマンドを使用する

```shell
create-global-txt <ChatGPT サーバーのURL> <json ファイルの出力先パス> <JSX が存在するディレクトリのパス>
```

使用例

```shell
create-global-txt 'http://localhost:5555' '.src/constants/globalTxtBuilder/outputs' './src/v-expo-3d/src'
```

## React で使用する

本モジュールは、React コンポーネントそのものを提供するものではありません。

冒頭でインストールした、@m-lab-inc/global-txt-builder から getTranslatedTxt をインポートして下さい。

上述の create-global-txt コマンドで生成した json を、getTranslatedTxt に渡す事で翻訳済みテキストが取得可能です。

コンポーネントの命名は、必ず "GlobalText" として下さい

```tsx
import React, {FC, useMemo} from 'react';
import {getTranslatedTxt} from '@m-lab-inc/global-txt-builder/dist/utils.js';
import {parseRfc5646LanguageTagFromUrl} from '../../../utils/langUtils';
// core
import globalTextMap from '../../../constants/globalTxtBuilder/outputs/globalTextMapCache.json';
// mui
import {Typography} from '@mui/material';
import {TypographyProps} from '@mui/material/Typography/Typography';

const GlobalText: FC<TypographyProps> = React.memo(({children, ...rest}) => {
  const getLang = () => {
    if (process.env.NEXT_PUBLIC_BUILD_LANG) {
      return process.env.NEXT_PUBLIC_BUILD_LANG;
    } else if (typeof window !== 'undefined') {
      return parseRfc5646LanguageTagFromUrl(window.location.href);
    }
    return null;
  };

  const lang = getLang();

  console.info('lang', lang);

  const translatedTxt = getTranslatedTxt({
    lang: lang,
    reactNode: children,
    globalTextMap
  });

  return <Typography {...rest}>{translatedTxt}</Typography>;
});

export default GlobalText;
```

下記の様に使用する事で、「快適にご利用いただくために」は翻訳されます

```tsx
const Test = () => {
  return <GlobalText>快適にご利用いただくために</GlobalText>
}
```

## 文字列リテラルに使用

また、文字列リテラルに記述することでも翻訳対象にすることが可能です

ただし、改行などには未対応です。

```tsx
const str = `<GlobalText>コメントを入力して下さい</GlobalText>`
```

文字列リテラルの場合は、parseGlobalTxt をインポートし、getTranslatedTxt と組み合わせた
関数を作成することで、下記の様な使い方が可能です。
parseGlobalTxt は、GlobalText タグ内に記述されている文字列を取り出す関数です。

```tsx
export const translateGlobalTxt = (stringLiteral: string): string => {
  const text = parseGlobalTxt(stringLiteral);
  if (text) {
    const lang = getLang();
    return getTranslatedTxt({
      lang: lang,
      reactNode: text,
      globalTextMap
    });
  } else {
    console.error(
      `
      テキストを抽出することができませんでした、文字列は１行のみ対応しています。
      GlobalText タグにタイポなどがないか確認して下さい。
      `
    );
    return stringLiteral;
  }
};

const SampleInputComponent = () => {
  return (
    <OutlinedInput
      placeholder={translateGlobalTxt(
        `<GlobalText>コメントを入力して下さい</GlobalText>`
      )}
      multiline
    />
  )
}
```

## ユーザー辞書

ユーザー辞書が存在する場合、ビルドフローの最後にユーザー辞書で上書きします。

globalTextMapCache.json と同一フォルダ内に、userDict.json を作成し、下記の形式で
ユーザー辞書を定義することが可能です。

```json
{
  "dict": [
    {
      "key": "ライブ配信",
      "value": {
        "en": "live"
      }
    }
  ]
}
```

## npm-scripts

npm-scripts に、下記の様に記述すれば、CI/CD に組み込むこともできるでしょう。

```json
{
  "scripts": {
    "gtb": "create-global-txt 'https://global-txt-server-hrqpvmnz3q-an.a.run.app' './src/constants/globalTxtBuilder/outputs' './src'",
    "build:gtb": "npm run gtb && NEXT_PUBLIC_ENV=prd NEXT_PUBLIC_BUILD_LANG=en next build"
  }
}
```

# コントリビューター向け

## 多言語マップjsonをビルド

```shell
yarn build
```

## 多言語マップ生成を実行

```shell
node ./dist/index.js <ChatGPT サーバーのURL> <json ファイルの出力先パス> <JSX が存在するディレクトリのパス>
```

## デプロイ

ビルド後に、メインブランチに push するだけです

## ChatGPT サーバー

cloudrun にデプロイ済み

リポジトリ

https://github.com/m-lab-inc/global-txt-server

## 諸注意

main ブランチでの rebase は実行しないでください

もししてしまった場合、このライブラリを依存関係に追加したプロジェクトでは下記を実行して下さい

```shell
yarn remove @m-lab-inc/global-txt-builder
yarn cache clean
yarn add git+https://github.com/m-lab-inc/global-txt-builder.git
```
