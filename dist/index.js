#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGlobalTxt = exports.normalizeString = exports.getTranslatedTxt = exports.hashString = void 0;
const translateBuilder_1 = require("./translateBuilder");
if (require.main === module) {
    (0, translateBuilder_1.start)();
}
var utils_1 = require("./utils");
Object.defineProperty(exports, "hashString", { enumerable: true, get: function () { return utils_1.hashString; } });
Object.defineProperty(exports, "getTranslatedTxt", { enumerable: true, get: function () { return utils_1.getTranslatedTxt; } });
Object.defineProperty(exports, "normalizeString", { enumerable: true, get: function () { return utils_1.normalizeString; } });
Object.defineProperty(exports, "parseGlobalTxt", { enumerable: true, get: function () { return utils_1.parseGlobalTxt; } });
