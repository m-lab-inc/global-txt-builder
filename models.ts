export interface Output {
  [hash: string]: {[lang: string]: string};
}

export interface UserDict {
  dict: UserDictContent[];
}

export interface UserDictContent {
  key: string;
  value: {
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
