import {StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';

export default function PaginationControls({
  pageNumber,
  maxPageNumber,
  onIncrement,
  onDecrement,
}) {
  const pageNumberAtMin = pageNumber <= 1;
  const pageNumberAtMax = pageNumber >= maxPageNumber;

  return (
    <View style={styles.paginationControls}>
      <IconButton
        testID="previous-page-button"
        icon="arrow-left-bold"
        disabled={pageNumberAtMin}
        onPress={onDecrement}
        accessibilityLabel="Go to previous page"
      />
      <Text>
        Page {pageNumber} of {maxPageNumber}
      </Text>
      <IconButton
        testID="next-page-button"
        icon="arrow-right-bold"
        disabled={pageNumberAtMax}
        onPress={onIncrement}
        accessibilityLabel="Go to next page"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
