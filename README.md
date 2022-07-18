# BetterChannelPoints


An Electron application meant to serve as a UI utility for linking Twitch Channel Point Redemptions to various effects via the their <a href="https://dev.twitch.tv/docs/pubsub">PubSub system.</a>

Presently only supports the execution of audio files; however, the backend implementation of
an HTTP wrapper exists in
[<b><i>src/renderer/api/getUserId.tsx</i></b>](https://github.com/RichardMcCarty1/BetterChannelPoints/blob/9dc01a1ec6de10eee2e0a8060b28c9bedb07378f/src/renderer/api/getUserId.tsx#L16)
and [<b><i>src/main/main.ts</i></b>](https://github.com/RichardMcCarty1/BetterChannelPoints/blob/9dc01a1ec6de10eee2e0a8060b28c9bedb07378f/src/main/main.ts#L152)
which would enable support for any external web service.

# Development


## Install

Clone the repo and install dependencies:

```bash
git clone --depth 1 --branch main https://github.com/RichardMcCarty1/BetterChannelPoints.git your-project-name
cd your-project-name
npm install
```

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

## Electron React Boilerplate

Built off of <a href="https://electron-react-boilerplate.js.org/">Electron React Boilerplate</a>

<img src=".erb/img/erb-banner.svg" width="100%" />

## License

MIT
