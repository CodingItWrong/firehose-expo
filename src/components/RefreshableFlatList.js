import {useState} from 'react';
import {FlatList, Platform, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import LoadingIndicator from './LoadingIndicator';

const LOADING_INDICATOR = {
  FLATLIST: 'FLATLIST', // intuitive on mobile
  STANDALONE: 'STANDALONE', // for initial loading and loading via button on web
};

export default function RefreshableFlatList({
  listRef,
  showLoadingIndicator,
  onRefresh,
  ...props
}) {
  const [internalLoadingIndicator, setInternalLoadingIndicator] =
    useState(null);

  const loadingIndicatorToShow = showLoadingIndicator
    ? LOADING_INDICATOR.STANDALONE
    : internalLoadingIndicator;

  async function refreshFromList() {
    setInternalLoadingIndicator(LOADING_INDICATOR.FLATLIST);
    await onRefresh();
    setInternalLoadingIndicator(null);
  }

  async function refreshFromButton() {
    setInternalLoadingIndicator(LOADING_INDICATOR.STANDALONE);
    await onRefresh();
    setInternalLoadingIndicator(null);
  }

  return (
    <>
      {Platform.OS === 'web' && (
        <Button
          mode="outlined"
          style={styles.refreshButton}
          onPress={refreshFromButton}
        >
          Reload
        </Button>
      )}
      {loadingIndicatorToShow === LOADING_INDICATOR.STANDALONE && (
        <LoadingIndicator />
      )}
      <FlatList
        ref={listRef}
        refreshing={loadingIndicatorToShow === LOADING_INDICATOR.FLATLIST}
        onRefresh={refreshFromList}
        {...props}
      />
    </>
  );
}

const styles = StyleSheet.create({
  refreshButton: {
    margin: 15,
  },
});
