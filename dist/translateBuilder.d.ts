import { Output, UserDict } from './models';
export declare const start: () => void;
export declare const main: ({ translatorUrl, outputTargetDir, globalTextMapCache, translateTargetDir, userDict }: {
    translatorUrl: string;
    outputTargetDir: string;
    globalTextMapCache: Output;
    translateTargetDir: string;
    userDict: UserDict;
}) => Promise<void>;
