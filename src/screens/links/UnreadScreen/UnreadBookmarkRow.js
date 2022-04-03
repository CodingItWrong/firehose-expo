import * as Linking from 'expo-linking';
import {Platform, StyleSheet} from 'react-native';
import {Button, Card} from 'react-native-paper';

export default function UnreadBookmarkRow({
  bookmark,
  onEdit,
  onMarkRead,
  onDelete,
}) {
  return (
    <Card
      style={styles.card}
      onPress={() => openBookmark(bookmark.attributes.url)}
    >
      <Card.Title
        title={bookmark.attributes.title}
        titleNumberOfLines={3}
        subtitle={bookmark.attributes.url}
        subtitleNumberOfLines={1}
      />
      <Card.Actions>
        <Button style={styles.button} mode="outlined" onPress={onMarkRead}>
          Mark Read
        </Button>
        <Button style={styles.button} mode="outlined" onPress={onEdit}>
          Edit
        </Button>
        <Button style={styles.button} mode="contained" onPress={onDelete}>
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );
}

function openBookmark(url) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url);
  }
}

const styles = StyleSheet.create({
  card: {
    margin: 15,
    marginBottom: 0,
  },
  button: {
    marginRight: 8,
  },
});
