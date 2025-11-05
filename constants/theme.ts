/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#D4AF37'; // Dorado elegante para barbería
const tintColorDark = '#F5E6A3';

export const Colors = {
  light: {
    text: '#2C1810', // Marrón oscuro elegante
    background: '#FEFEFE',
    tint: tintColorLight,
    icon: '#8B6914', // Dorado más oscuro
    tabIconDefault: '#A0A0A0',
    tabIconSelected: tintColorLight,
    primary: '#D4AF37', // Dorado principal
    secondary: '#8B4513', // Marrón barbería
    accent: '#F4F4F4', // Gris claro
    border: '#E8E8E8',
    card: '#FFFFFF',
  },
  dark: {
    text: '#F5F5DC', // Beige claro
    background: '#1A1A1A',
    tint: tintColorDark,
    icon: '#D4AF37',
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
    primary: '#F5E6A3', // Dorado claro
    secondary: '#CD853F', // Marrón claro
    accent: '#2A2A2A', // Gris oscuro
    border: '#333333',
    card: '#2A2A2A',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
