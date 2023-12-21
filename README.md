## 導入

```shell
npm i typescript -g
yarn add git+https://github.com/m-lab-inc/global-txt-builder.git
```

## 多言語マップを生成する

第１引数：ChatGPT サーバーのURL

第２引数：json ファイルの出力先

第３引数：JSX が存在するディレクトリのパス

使用例

```shell
node ./dist/index.js 'http://localhost:5555' '/Users/hamaike/src/global-txt-builder/outputs' '/Users/hamaike/src/v-expo-3d/src'
```

## GlobalText コンポーネントを試す

```shell
node ./dist/reactPackages/index.js
```