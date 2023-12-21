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
create-global-txt 'http://localhost:5555' '/Users/hamaike/src/v-expo-3d/src/constants/globalTxtBuilder/outputs' '/Users/hamaike/src/v-expo-3d/src'
```

## React で使用する

冒頭でインストールした、@m-lab-inc/global-txt-builder から インポートして下さい。

上述の create-global-txt コマンドで生成した json を、getTranslatedTxt に渡す事で翻訳済みテキストが取得可能です。

コンポーネントの命名は、必ず "GlobalText" として下さい

```tsx
import React, {FC, useMemo} from 'react';
import {getTranslatedTxt} from '@m-lab-inc/global-txt-builder';
import globalTextMap from '../../../constants/globalTxtBuilder/outputs/globalTextMapCache.json';

// mui
import {Typography} from '@mui/material';
import {TypographyProps} from '@mui/material/Typography/Typography';
import {getLangCode} from '../../../utils/queryParamsHandler';

interface Props {
  typographyProps?: TypographyProps;
}

const GlobalText: FC<Props> = React.memo(({children, typographyProps = {}}) => {
  const getLang = () => {
    if (process.env.BUILD_LANG) {
      return process.env.BUILD_LANG;
    } else if (typeof window !== 'undefined') {
      return getLangCode();
    }
    return null;
  };

  const translatedTxt = getTranslatedTxt({
    lang: getLang(),
    reactNode: children,
    globalTextMap
  });

  return <Typography {...typographyProps}>{translatedTxt}</Typography>;
});

export default GlobalText;

```

このように使用する事で、「快適にご利用いただくために」は翻訳されます

```tsx
const Test = () => {
  return <GlobalText>快適にご利用いただくために</GlobalText>
}
```

# コントリビューター向け

## 多言語マップ生成をビルド

```shell
yarn build
```

## 多言語マップ生成を実行

```shell
node ./dist/index.js 'http://localhost:5555' '/Users/hamaike/src/global-txt-builder/outputs' '/Users/hamaike/src/v-expo-3d/src'
```

## React コンポーネントの開発

```shell
next dev
```

## デプロイ

## 諸注意

main ブランチでの rebase は実行しないでください

もししてしまった場合、このライブラリを依存関係に追加したプロジェクトでは下記を実行して下さい

```shell
yarn remove @m-lab-inc/global-txt-builder
yarn cache clean
yarn add git+https://github.com/m-lab-inc/global-txt-builder.git
```
