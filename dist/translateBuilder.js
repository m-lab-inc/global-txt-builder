"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.start = void 0;
const fs = __importStar(require("fs"));
const glob_1 = require("glob");
const parser = __importStar(require("@babel/parser"));
const traverse_1 = __importDefault(require("@babel/traverse"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const start = () => {
    const args = (0, utils_1.checkArgs)();
    console.log(`${args.outputTargetDir}/${constants_1.CACHE_FILENAME}`);
    try {
        // キャッシュの json を取得
        const file = fs.readFileSync(`${args.outputTargetDir}/${constants_1.CACHE_FILENAME}`, 'utf8');
        const jsonObject = JSON.parse(file);
        (0, exports.main)(Object.assign(Object.assign({}, args), { globalTextMapCache: jsonObject }));
    }
    catch (e) {
        // キャッシュがなければ参照しない
        console.info('キャッシュが見つかりませんでした、新しく生成します');
        const jsonObject = JSON.parse('{}');
        (0, exports.main)(Object.assign(Object.assign({}, args), { globalTextMapCache: jsonObject }));
    }
};
exports.start = start;
const main = ({ translatorUrl, outputTargetDir, globalTextMapCache, translateTargetDir }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('args', translatorUrl, outputTargetDir, translateTargetDir);
    const targetTexts = yield getTranslateTargetTxt(translateTargetDir);
    console.log('typeof targetTexts: ', typeof targetTexts);
    if (!targetTexts) {
        throw Error(`JSX の解析に失敗しました。translateTargetDir: ${translateTargetDir}`);
    }
    console.info(`${targetTexts.length} 件のテキストが見つかりました`);
    const needGeneratedTexts = makeNeedGeneratedTexts(targetTexts, globalTextMapCache);
    console.info(`${needGeneratedTexts.length} 件のテキストが未翻訳です`);
    if (needGeneratedTexts.length === 0) {
        console.log('生成が必要なテキストはありません。処理をスキップします');
        return;
    }
    const response = yield requestTranslatedData(needGeneratedTexts, translatorUrl);
    console.log('response status: ', response.status);
    if (!(response.status === 200 && response.json)) {
        throw Error('chat-gpt へのリクエストが失敗しました');
    }
    console.log('トークン使用量：', response.json.usage);
    const output = makeOutputMap(response.json.content, needGeneratedTexts);
    const globalTextMap = Object.assign(Object.assign({}, globalTextMapCache), output);
    writeOutputs(globalTextMap, outputTargetDir);
});
exports.main = main;
const makeNeedGeneratedTexts = (targetTexts, globalTextMapCache) => {
    const hashedTargetTexts = targetTexts.map(text => {
        return (0, utils_1.hashString)(text);
    });
    const needGeneratedTexts = [];
    hashedTargetTexts.forEach((hash, index) => {
        const isExist = Boolean(globalTextMapCache[hash]);
        if (!isExist) {
            needGeneratedTexts.push(targetTexts[index]);
        }
    });
    return needGeneratedTexts;
};
const writeOutputs = (globalTextMap, outputTargetDir) => {
    const globalTextMapCacheOutput = `${JSON.stringify(globalTextMap)}`;
    fs.writeFileSync(`${outputTargetDir}/${constants_1.CACHE_FILENAME}`, globalTextMapCacheOutput, 'utf8');
};
const makeOutputMap = (json, needGeneratedTexts) => {
    const translated = JSON.parse(json);
    const output = {};
    needGeneratedTexts.forEach((text, index) => {
        const hashedText = (0, utils_1.hashString)(text);
        for (const key in translated) {
            const translatedTxt = translated[key][index];
            if (!translatedTxt)
                continue;
            if (output[hashedText]) {
                output[hashedText] = Object.assign(Object.assign({}, output[hashedText]), { [key]: translatedTxt });
            }
            else {
                output[hashedText] = {
                    [key]: translatedTxt
                };
            }
        }
    });
    return output;
};
const getTranslateTargetTxt = (translateTargetDir) => __awaiter(void 0, void 0, void 0, function* () {
    // src ディレクトリ内の全 .tsx/.jsx ファイルを検索
    const paths = yield (0, glob_1.glob)(`${translateTargetDir}/**/*.+(tsx|jsx)`);
    console.info('typeof paths: ', typeof paths);
    if (!Array.isArray(paths))
        return null;
    console.info(`${paths.length} 件の翻訳対象ファイルが見つかりました`);
    const targetTexts = [];
    console.info(`対象ファイル群から、テキストの抜き出しを開始します`);
    paths.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const ast = parser.parse(content, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        (0, traverse_1.default)(ast, {
            JSXElement(path) {
                if ('name' in path.node.openingElement.name &&
                    path.node.openingElement.name.name === 'GlobalText') {
                    path.node.children.forEach(child => {
                        if (child.type === 'JSXText') {
                            const text = (0, utils_1.normalizeString)(child.value);
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
});
const requestTranslatedData = (targetTexts, translatorUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const headers = {
        'Content-Type': 'application/json'
    };
    const body = JSON.stringify({ text: targetTexts });
    console.info('Start ChatGPT request.');
    const response = yield (0, node_fetch_1.default)(translatorUrl, {
        method: 'POST',
        body: body,
        headers: headers
    }).then(response => {
        return response
            .json()
            .catch(error => {
            console.log('error!', error);
            return { status: response.status, json: null };
        })
            .then(json => {
            const res = json;
            return {
                status: response.status,
                json: res
            };
        });
    });
    console.info('End ChatGPT request.');
    return response;
});
