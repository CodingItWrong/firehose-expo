# firehose-expo

Client for the [Firehose link-saving app](https://github.com/CodingItWrong/firehose-api). Implemented with Expo. Runs on Android, iOS, and web.

## Requirements

- [Yarn](https://yarnpkg.com/en/docs/install)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/build/setup/#1-install-the-latest-eas-cli)
- [Cocoapods](https://guides.cocoapods.org/using/getting-started.html#installation)
- [Fastlane](https://docs.fastlane.tools/getting-started/ios/setup/)

## Installation

```bash
$ yarn install
```

## Running

```bash
$ yarn start
```

Then click "Run on Android device/emulator", "Run on iOS simulator", or "Run in web browser"

## Testing

### Linting

```bash
$ yarn lint
```

### Unit Tests

```bash
$ yarn test
```

## Release

### iOS

- Increment the `ios.buildNumber` in `app.json`
- Run `yarn build:ios`
- Once the build completes, upload the `.ipa` file it created to TestFlight using the Apple [Transporter](https://apps.apple.com/us/app/transporter/id1450874784?mt=12) app.

### Web

```bash
$ yarn deploy:web
```

Deploys to configured Netlify site.
