import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArchiveBoxXMarkIcon, StopCircleIcon } from 'react-native-heroicons/outline';
import Features from '../components/Features';
import Voice, {
  SpeechEndEvent,
  SpeechErrorEvent,
  SpeechResultsEvent,
  SpeechStartEvent,
} from '@react-native-voice/voice';
import { apiCall } from '../api/openApi';
import { Message } from '../api/types';
import Tts from 'react-native-tts';

const HomeScreen = () => {
  // 聊天记录
  const [messages, setMessages] = useState<Message[]>([]);
  // 控制录音按钮的状态
  const [recording, setRecording] = useState(false);
  // 控制话筒按钮的状态
  const [speaking, setSpeaking] = useState(false);
  // 语音结果
  const [speechResult, setSpeechResult] = useState('');
  // GPT响应 loading
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleClear = () => {
    Tts.stop();
    setSpeaking(false);
    setLoading(false);
    setMessages([]);
  };

  const startRecording = async () => {
    setRecording(true);
    Tts.stop();
    try {
      await Voice.start('zh-CN');
      // await Voice.start('en-GB'); // en-US
    } catch (error) {
      console.log(error, 'startRecording-error');
    }
  };

  const stopRecording = async () => {
    console.log(speechResult, 'speechResult');
    try {
      await Voice.stop();
      setRecording(false);
      fetchSpeechToGPT();
    } catch (error) {
      console.log(error, 'stopRecording-error');
    }
  };

  const stopSpeaking = () => {
    Tts.stop();
    setSpeaking(false);
  };

  const startTextToSpeech = (message: any) => {
    console.log(message.content.includes('https'), 'startTextToSpeech');

    if (!message.content.includes('https')) {
      setSpeaking(true);
      // 播放带有语音id和语速的响应
      Tts.speak(message.content, {
        iosVoiceId: 'com.apple.voice.compact.zh-CN.Tingting',
        rate: 0.5,
      } as any);
      // Tts.speak(message.content);
    }
  };

  /**
   * @description: 每次发送消息后，滚动到底部
   * @param {*}
   * @return {*}
   */
  const updateScrollView = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, []);

  const fetchSpeechToGPT = async () => {
    if (speechResult.trim().length > 0) {
      setLoading(true);
      const _messages = [...messages];
      _messages.push({
        role: 'user',
        content: speechResult.trim(),
      });
      setMessages(_messages);
      updateScrollView();

      const resp = await apiCall(speechResult.trim(), _messages);
      setLoading(false);
      if (resp.success) {
        setMessages([...resp.data]);
        setSpeechResult('');
        // 播放最后一条消息
        startTextToSpeech(resp.data[resp.data.length - 1]);
      } else {
        // Alert.alert('Error', resp.msg);
        setMessages(prev => [...prev, { role: 'assistant', content: resp.msg }]);
      }
      updateScrollView();
    }
  };

  const onSpeechStartHandler = (e: SpeechStartEvent) => {
    console.log(e, 'onSpeechStartHandler');
  };

  const onSpeechEndHandler = (e: SpeechEndEvent) => {
    console.log(e, 'onSpeechEndHandler');
  };

  const onSpeechResultsHandler = (e: SpeechResultsEvent) => {
    const result = e.value?.[0];
    setSpeechResult(result || '');
  };

  const onSpeechErrorHandler = (e: SpeechErrorEvent) => {
    console.log(e, 'onSpeechErrorHandler');
  };

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStartHandler;
    Voice.onSpeechEnd = onSpeechEndHandler;
    Voice.onSpeechResults = onSpeechResultsHandler;
    Voice.onSpeechError = onSpeechErrorHandler;

    Tts.setDefaultLanguage('zh-CN');
    // 获取所有可用的语音
    // Tts.voices().then(voices => console.log(voices, 'voices'));
    Tts.addEventListener('tts-start', event => console.log('start', event));
    Tts.addEventListener('tts-finish', event => {
      console.log('finish', event);
      setSpeaking(false);
    });
    Tts.addEventListener('tts-cancel', event => console.log('cancel', event));

    // 组件销毁时摧毁 Voice 并且移除所有监听
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // console.log('speechResult', speechResult);

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1 mx-5 justify-around">
        {/* bot icon */}
        <View className="flex-row justify-center">
          <Image source={require('../../assets/images/bot.jpeg')} style={{ width: hp(15), height: hp(15) }} />
        </View>

        {/* features || messages */}
        {messages.length > 0 ? (
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text style={{ fontSize: wp(5) }} className="text-gray-700 font-semibold">
                Assistant
              </Text>
            </View>
            <View style={{ height: hp(58) }} className="bg-neutral-200 rounded-3xl p-4">
              <ScrollView
                ref={scrollViewRef}
                bounces={false}
                className="space-y-4"
                showsVerticalScrollIndicator={false}>
                {messages.map((message, index) => {
                  if (message.role === 'assistant') {
                    if (message.content.includes('https')) {
                      // its an ai image
                      return (
                        <View key={index} className="flex-row justify-start">
                          <View style={{ width: wp(40) }} className="bg-white rounded-xl">
                            <Image
                              source={{ uri: message.content }}
                              style={{ width: wp(40), height: wp(40) }}
                              className="rounded-xl"
                            />
                          </View>
                        </View>
                      );
                    } else {
                      // text response
                      return (
                        <View key={index} className="flex-row justify-start">
                          <View style={{ maxWidth: wp(70) }} className="bg-emerald-200 rounded-xl p-2 rounded-tl-none">
                            <Text>{message.content}</Text>
                          </View>
                        </View>
                      );
                    }
                  } else {
                    // user message
                    return (
                      <View key={index} className="flex-row justify-end">
                        <View style={{ maxWidth: wp(70) }} className="bg-white rounded-xl p-2 rounded-tr-none">
                          <Text className="text-right">{message.content}</Text>
                        </View>
                      </View>
                    );
                  }
                })}
              </ScrollView>
            </View>
          </View>
        ) : (
          <Features />
        )}

        {/* recording, stop buttons */}
        <View className="justify-center items-center">
          {loading ? (
            <Image source={require('../../assets/images/loading.gif')} style={{ width: hp(10), height: hp(10) }} />
          ) : recording ? (
            // stopRecording buttons
            <TouchableOpacity onPress={stopRecording}>
              <Image
                className="rounded-full"
                source={require('../../assets/images/voiceLoading.gif')}
                style={{ width: hp(10), height: hp(10) }}
              />
            </TouchableOpacity>
          ) : (
            // startRecording buttons
            <TouchableOpacity onPress={startRecording}>
              <Image
                className="rounded-full"
                source={require('../../assets/images/recordingIcon.png')}
                style={{ width: hp(10), height: hp(10) }}
              />
            </TouchableOpacity>
          )}

          {/* clear buttons */}
          {messages.length > 0 && (
            <TouchableOpacity onPress={handleClear} className="absolute right-3 p-2 px-3 bg-gray-300 rounded-3xl">
              <View className="flex-row items-center space-x-2">
                <ArchiveBoxXMarkIcon strokeWidth={2} size={wp(6)} color="#fff" />
                <Text style={{ fontSize: wp(4) }} className="font-semibold text-white">
                  Clear
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* microphone button */}
          {speaking && (
            <TouchableOpacity onPress={stopSpeaking} className="absolute left-4 p-2 px-3 bg-red-400 rounded-3xl">
              <View className="flex-row items-center space-x-2">
                <StopCircleIcon strokeWidth={2} size={wp(6)} color="#fff" />
                <Text style={{ fontSize: wp(4) }} className="font-semibold text-white">
                  Stop
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;
