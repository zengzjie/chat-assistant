import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

const WelcomeScreen = () => {
  const { navigate } = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    // https://reactnavigation.org/docs/handling-safe-area/
    // 如果 SafeAreaView 包含安全区域的屏幕正在动画，则会导致跳跃行为。因此建议还是使用 useSafeAreaInsets 去获取数据来处理安全区域。
    <SafeAreaView className="flex-1 justify-around bg-white">
      <View className="space-y-2">
        <Text style={{ fontSize: wp(10) }} className="text-center font-bold text-gray-700">
          ChatAssistant
        </Text>
        <Text style={{ fontSize: wp(4) }} className="text-center tracking-wider text-gray-500 font-semibold">
          The Future is here, powered by AI
        </Text>
      </View>
      <View className="justify-center items-center">
        <Image source={require('../../assets/images/bot.jpeg')} style={{ width: wp(75), height: wp(75) }} />
      </View>
      <TouchableOpacity
        style={{ backgroundColor: '#78a0f8' }}
        className="p-4 mx-5 rounded-full"
        onPress={() => navigate('Home')}>
        <Text style={{ fontSize: wp(6) }} className="text-center text-white font-bold text-2xl">
          Get Started
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
