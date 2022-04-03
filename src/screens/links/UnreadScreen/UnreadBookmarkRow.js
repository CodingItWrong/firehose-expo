import * as Linking from 'expo-linking';
import {Platform, Pressable} from 'react-native';
import {Button, Card, List, Menu} from 'react-native-paper';

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
      <Card.Content>
        <Menu
          visible={isMenuShown}
          onDismiss={onHideMenu}
          anchor={
            <Pressable onPress={onShowMenu} accessibilityLabel="Actions">
              <List.Icon icon="dots-vertical" />
            </Pressable>
          }
        >
          <Menu.Item onPress={onDelete} title="Delete" />
        </Menu>
      </Card.Content>
      <Card.Actions>
        <Button onPress={onMarkRead}>Mark Read</Button>
        <Button onPress={onEdit}>Edit</Button>
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
