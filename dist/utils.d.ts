import { Output } from './models';
export declare const hashString: (str: string) => string;
export declare const normalizeString: (str: string) => string;
export declare const checkArgs: () => {
    translatorUrl: string;
    outputTargetDir: string;
    translateTargetDir: string;
};
export declare const getTranslatedTxt: ({ lang, reactNode, globalTextMap }: {
    lang: string | null | undefined;
    reactNode: any;
    globalTextMap: Output;
}) => string;
export declare const parseGlobalTxt: (input: string) => string | null;
