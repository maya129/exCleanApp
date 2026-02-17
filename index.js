import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';

// Toggle STORYBOOK_ENABLED to true to load Storybook instead of the app.
// In CI/production builds this should always be false.
const STORYBOOK_ENABLED = false;

let RootComponent = App;

if (__DEV__ && STORYBOOK_ENABLED) {
  const { default: StorybookUI } = require('./.storybook');
  RootComponent = StorybookUI;
}

AppRegistry.registerComponent(appName, () => RootComponent);
