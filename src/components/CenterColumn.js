import {StyleSheet, View} from 'react-native';

export default function CenterColumn({columnStyle, children}) {
  return (
    <View style={styles.columnWrapper}>
      <View style={[styles.column, columnStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  column: {
    flex: 1,
    maxWidth: 640, // fits sub-12.9 ipad portrait and half high-res 13" screen
  },
});
