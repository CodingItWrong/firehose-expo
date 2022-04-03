import * as Linking from 'expo-linking';
import {Platform} from 'react-native';
import {Button, Card} from 'react-native-paper';

export default function UnreadBookmarkRow({
  bookmark,
  isMenuShown,
  onShowMenu,
  onHideMenu,
  onEdit,
  onMarkRead,
  onDelete,
}) {
  return (
    <Card onPress={() => openBookmark(bookmark.attributes.url)}>
      <Card.Title
        title={bookmark.attributes.title}
        titleNumberOfLines={3}
        subtitle={bookmark.attributes.url}
        subtitleNumberOfLines={1}
      />
      <Card.Actions>
        <Button onPress={onMarkRead}>Mark Read</Button>
        <Button onPress={onEdit}>Edit</Button>
        <Button onPress={onDelete}>Delete</Button>
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
