import axios from 'axios';
import { apiKey } from '../constants';
import { ChatCompletion, DalleCompletion, Message } from './types';

const ajax = axios.create({
  headers: {
    Authorization: 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
  },
});

// const chatgptUrl = 'https://api.openai.com/v1/chat/completions';
// const dalleUrl = 'https://api.openai.com/v1/images/generations';
// 代理地址
const chatgptUrl = 'https://hk.xty.app/v1/chat/completions';
const dalleUrl = 'https://hk.xty.app/v1/images/generations';

export const apiCall = async (prompt: string, messages: Message[]) => {
  // Logic 1 : 如果用户想要创建图像，这将检查chatgpt的提示
  try {
    const resp = await ajax.post<ChatCompletion>(chatgptUrl, {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Does this message want to generate an AI picture, image, art or anything similar? ${prompt} . Simply answer with a yes or no.`,
        },
      ],
    });
    let isArt = resp.data.choices[0].message.content;
    console.log(isArt.trim().toLocaleLowerCase(), 'isArt');
    isArt = isArt.trim();
    if (isArt.toLocaleLowerCase().includes('yes')) {
      // 调用的是图像生成的api
      return dallEApiCall(prompt, messages);
    } else {
      // 调用的是文本的api
      return chatGptApiCall(prompt, messages);
    }
  } catch (error: any) {
    console.log(error, 'apiCall-error');
    return Promise.resolve({ success: false, data: [], msg: error.message });
  }
};

export const chatGptApiCall = async (prompt: string, messages: Message[]) => {
  try {
    const resp = await ajax.post<ChatCompletion>(chatgptUrl, {
      model: 'gpt-3.5-turbo',
      messages,
    });
    const answer = resp.data?.choices[0]?.message?.content;
    console.log('\n 🎯-> checked chatGptApiCall checked answer: 📮 --- 📮', answer);
    messages.push({
      role: 'assistant',
      content: answer,
    });
    return Promise.resolve({ success: true, data: messages, msg: '' });
  } catch (error: any) {
    console.log(error, 'chatGptApiCall-error');
    return Promise.resolve({ success: false, data: [], msg: error.message });
  }
};

// 创建图像
export const dallEApiCall = async (prompt: string, messages: Message[]) => {
  try {
    const resp = await ajax.post<DalleCompletion>(dalleUrl, {
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '512x512',
    });
    const url = resp?.data?.data[0]?.url;
    console.log('\n 🎯-> checked dallEApiCall checked url: 📮 --- 📮', url);
    messages.push({
      role: 'assistant',
      content: url,
    });
    return Promise.resolve({ success: true, data: messages, msg: '' });
  } catch (error: any) {
    console.log(error, 'dallEApiCall-error');
    return Promise.resolve({ success: false, data: [], msg: error.message });
  }
};
