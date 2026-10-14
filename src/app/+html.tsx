import { Asset } from 'expo-asset';
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const splashIcon = Asset.fromModule(require('../../assets/images/splash-icon.png'));

export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <link rel="preload" as="image" href={splashIcon.uri} />
      </head>
      <body style={{ backgroundColor: '#25292e' }}>
        {children}
        <div
          id="web-splash"
          role="status"
          aria-label="Loading app"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#25292e',
          }}
        >
          <img
            src={splashIcon.uri}
            alt=""
            width={200}
            height={200}
            style={{ objectFit: 'contain' }}
          />
        </div>
      </body>
    </html>
  );
}
