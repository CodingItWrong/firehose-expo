import {Chip} from 'react-native-paper';

export default function Tag({name, ...props}) {
  return <Chip {...props}>{name}</Chip>;
}
