import {Appbar} from 'react-native-paper';

export default function CustomNavigationBar({options}) {
  return (
    <Appbar.Header>
      <Appbar.Content title={options.title} />
    </Appbar.Header>
  );
}
