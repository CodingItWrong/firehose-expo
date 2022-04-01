import {useState} from 'react';
import {FlatList, Platform, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';

export default function RefreshableFlatList({onRefresh, ...props}) {
  const [refreshing, setRefreshing] = useState(false);

  async function refreshFromList() {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  async function refreshFromButton() {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  const showReloadButton = Platform.OS === 'web';

  return (
    <>
      {showReloadButton && (
        <Button
          mode="outlined"
          style={styles.refreshButton}
          onPress={refreshFromButton}
        >
          Reload
        </Button>
      )}
      <FlatList
        {...props}
        refreshing={refreshing}
        onRefresh={refreshFromList}
      />
    </>
  );
}

const styles = StyleSheet.create({
  refreshButton: {
    margin: 15,
  },
});
