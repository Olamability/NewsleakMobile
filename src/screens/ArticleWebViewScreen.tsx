import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { COLORS } from '../constants/theme';

interface ArticleWebViewScreenProps {
  route: any;
  navigation: any;
}

export const ArticleWebViewScreen: React.FC<ArticleWebViewScreenProps> = ({
  route,
  navigation,
}) => {
  const { url, title } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: title || 'Article',
    });
  }, [navigation, title]);

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: url }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        style={styles.webview}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
