// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/*
 
Add your SF Symbols to Material Icons mappings here.
see Material Icons in the Icons Directory.
see SF Symbols in the SF Symbols app.
*/
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'clock': 'schedule',
  'clock.fill': 'schedule',
  'person.circle': 'account-circle',
  'person.circle.fill': 'account-circle',
  'person.fill': 'person',
  'person': 'person',
  'person.3': 'group',
  'star.fill': 'star',
  'calendar': 'event',
  'pencil': 'edit',
  'xmark': 'close',
  'scissors': 'content-cut',
  'envelope.fill': 'email',
  'phone.fill': 'phone',
  'globe': 'public',
  'applelogo': 'apple',
  'arrow.right.square': 'arrow-forward',
  'arrow.left': 'arrow-back',
  'arrow.right': 'arrow-forward',
  'plus': 'add',
  'trash': 'delete',
  'checkmark.circle': 'check-circle',
  'checkmark.circle.fill': 'check-circle',
  'play.circle': 'play-circle-filled',
  'dollarsign.circle': 'attach-money',
  'bolt.fill': 'flash-on',
  'location.fill': 'location-on',
  'face.smiling': 'face',
  'crown.fill': 'star',
  'rectangle.and.pencil.and.ellipsis': 'edit',
  'drop.fill': 'water-drop',
  'figure.child': 'child-care',
  'sparkles': 'auto-awesome',
  'calendar.badge.plus': 'event-available',
  'list.bullet': 'list',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'lock.fill': 'lock',
} as IconMapping;

/*
 
An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
This ensures a consistent look across platforms, and optimal resource usage.
Icon names are based on SF Symbols and require manual mapping to Material Icons.*/
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  readonly name: IconSymbolName;
  readonly size?: number;
  readonly color: string | OpaqueColorValue;
  readonly style?: StyleProp<TextStyle>;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}