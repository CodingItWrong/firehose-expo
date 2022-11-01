import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';
import {Provider} from 'react-native-paper';
import BookmarkRow from './BookmarkRow';

// https://stackoverflow.com/questions/68271990/how-to-test-rn-component-rendering-inside-modal-portal-in-react-native
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  const MockedModule = {
    ...RealModule,
    Portal: ({children}) => <>{children}</>,
  };
  return MockedModule;
});

describe('BookmarkRow', () => {
  const bookmark = {attributes: {url: 'https://codingitwrong.com'}};

  // TODO: cover other behavior besides mark read and delete

  describe('marking read', () => {
    it('calls the onMarkRead prop', () => {
      const onMarkRead = jest.fn().mockName('onMarkRead');

      render(
        <Provider>
          <BookmarkRow bookmark={bookmark} onMarkRead={onMarkRead} />
        </Provider>,
      );

      fireEvent.press(screen.getByRole('button', {name: 'Mark Read'}));

      expect(onMarkRead).toHaveBeenCalledWith();
    });
  });

  describe('deleting', () => {
    it('calls the onDelete prop', () => {
      const onDelete = jest.fn().mockName('onDelete');

      render(
        <Provider>
          <BookmarkRow bookmark={bookmark} onDelete={onDelete} />
        </Provider>,
      );

      expect(screen.queryByText('Yes, Delete')).toBeNull();

      fireEvent.press(screen.getByText('Delete'));
      fireEvent.press(screen.getByText('Yes, Delete'));

      expect(onDelete).toHaveBeenCalledWith();
    });

    it('allows cancelling the deletion', async () => {
      const onDelete = jest.fn().mockName('onDelete');

      render(<BookmarkRow bookmark={bookmark} onDelete={onDelete} />);

      fireEvent.press(screen.getByText('Delete'));
      fireEvent.press(screen.getByText('Cancel'));

      await waitForElementToBeRemoved(() => screen.getByText('Cancel'));

      expect(onDelete).not.toHaveBeenCalled();
    });
  });
});
