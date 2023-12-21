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

第１引数：ChatGPT サーバーのURL

第２引数：json ファイルの出力先

第３引数：JSX が存在するディレクトリのパス

使用例

```shell
create-global-txt 'http://localhost:5555' '/Users/hamaike/src/v-expo-3d/src/constants/globalTxtBuilder/outputs' '/Users/hamaike/src/v-expo-3d/src'
```

## GlobalText コンポーネントを試す

```shell
node ./dist/reactPackages/index.js
```

# 開発者向け

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
