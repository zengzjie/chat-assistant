export interface ChatCompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  system_fingerprint: string;
  choices: Choice[];
  usage: Usage;
}

export interface Choice {
  index: number;
  message: Message;
  logprobs: null | any; // 'any' 可以被更具体的类型替代，取决于 'logprobs' 的预期结构
  finish_reason: string;
}

export interface Message {
  role: string;
  content: string;
}

export interface DalleCompletion {
  created: number;
  data: DalleData[];
}

interface DalleData {
  url: string;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
