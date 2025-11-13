import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import AppGradient from './AppGratient';

const LoadingScreen = ({ black = false }: { black?: boolean }) => {
  
  const gradientColors = black ? ['rgba(0,0,0,1)', 'rgba(0,0,0,1)'] : ['rgba(0,0,0,.4)', 'rgba(0,0,0,.8)'];
  
  return (
    <AppGradient colors={gradientColors} bg='https://m.media-amazon.com/images/M/MV5BNWU1OTgxYTMtZTViMy00MmU0LTg2ZGMtZDVkYTNlYzI4NWRjXkEyXkFqcGc@.jpg'>
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="orange" />
      </View>
    </AppGradient>
  );
};

export default LoadingScreen;
