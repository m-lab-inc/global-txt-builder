export interface Output {
    [hash: string]: {
        [lang: string]: string;
    };
}
export interface GptResponse {
    content: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
