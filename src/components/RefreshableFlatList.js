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

  function refreshFromList() {
    setInternalLoadingIndicator(LOADING_INDICATOR.FLATLIST);
    return onRefresh().finally(() => setInternalLoadingIndicator(null));
  }

  function refreshFromButton() {
    setInternalLoadingIndicator(LOADING_INDICATOR.STANDALONE);
    return onRefresh().finally(() => setInternalLoadingIndicator(null));
  }

  const showReloadButton =
    Platform.OS === 'web' || process.env.NODE_ENV === 'test';

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
      {loadingIndicatorToShow === LOADING_INDICATOR.STANDALONE && (
        <LoadingIndicator />
      )}
      <FlatList
        {...props}
        ref={listRef}
        refreshing={loadingIndicatorToShow === LOADING_INDICATOR.FLATLIST}
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
