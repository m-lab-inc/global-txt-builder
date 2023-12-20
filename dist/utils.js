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
exports.checkArgs = exports.normalizeString = exports.hashString = void 0;
const crypto = __importStar(require("crypto"));
const hashString = (str) => {
    return crypto.createHash('sha256').update(str).digest('hex');
};
exports.hashString = hashString;
const normalizeString = (str) => {
    // 連続するスペースを単一のスペースに置換し、前後の空白を削除
    return str.replace(/\s+/g, ' ').trim();
};
exports.normalizeString = normalizeString;
const checkArgs = () => {
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
exports.checkArgs = checkArgs;
