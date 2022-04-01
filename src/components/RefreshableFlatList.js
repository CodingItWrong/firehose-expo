import {useState} from 'react';
import {FlatList} from 'react-native';

export default function RefreshableFlatList({onRefresh, ...props}) {
  const [refreshing, setRefreshing] = useState(false);

  async function refreshFromList() {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }

  return (
    <FlatList {...props} refreshing={refreshing} onRefresh={refreshFromList} />
  );
}
