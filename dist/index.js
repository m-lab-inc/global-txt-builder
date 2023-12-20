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
Object.defineProperty(exports, "__esModule", { value: true });
const translateBuilder_1 = require("./translateBuilder");
const fs = __importStar(require("fs"));
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const args = (0, utils_1.checkArgs)();
console.log(`${args.outputTargetDir}/${constants_1.CACHE_FILENAME}`);
try {
    // キャッシュの json を取得
    const file = fs.readFileSync(`${args.outputTargetDir}/${constants_1.CACHE_FILENAME}`, 'utf8');
    const jsonObject = JSON.parse(file);
    (0, translateBuilder_1.main)(Object.assign(Object.assign({}, args), { globalTextMapCache: jsonObject }));
}
catch (e) {
    // キャッシュがなければ参照しない
    console.info('キャッシュが見つかりませんでした、新しく生成します');
    const jsonObject = JSON.parse('{}');
    (0, translateBuilder_1.main)(Object.assign(Object.assign({}, args), { globalTextMapCache: jsonObject }));
}
