import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CenterColumn from '../../../components/CenterColumn';
import ScreenBackground from '../../../components/ScreenBackground';
import {useBookmarks} from '../../../data/bookmarks';
import sharedStyles from '../../../sharedStyles';
import BookmarkDetailForm from './BookmarkDetailForm';

export default function BookmarkDetailScreen({route}) {
  const navigation = useNavigation();
  const {id} = route.params;
  const bookmarkClient = useBookmarks();

  const [bookmark, setBookmark] = useState(null);

  useEffect(() => {
    bookmarkClient
      .find({id})
      .then(response => {
        setBookmark(response.data);
      })
      .catch(console.error);
  }, [bookmarkClient, id]);

  async function handleSave(attributes) {
    try {
      await bookmarkClient.update({id, attributes});
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  }

  function handleCancel() {
    navigation.goBack();
  }

  function contents() {
    if (!bookmark) {
      return null; // TODO: loading state
    } else {
      return (
        <BookmarkDetailForm
          attributes={bookmark.attributes}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      );
    }
  }

  return (
    <ScreenBackground>
      <KeyboardAwareScrollView>
        <CenterColumn columnStyle={sharedStyles.bodyPadding}>
          {contents()}
        </CenterColumn>
      </KeyboardAwareScrollView>
    </ScreenBackground>
  );
}
