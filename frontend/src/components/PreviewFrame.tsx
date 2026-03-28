import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    async function main() {
      // Listen for server-ready BEFORE spawning dev server so we don't miss the event
      webContainer.on('server-ready', (port, serverUrl) => {
        console.log('Server ready on port', port, serverUrl);
        setUrl(serverUrl);
      });

      const installProcess = await webContainer.spawn('npm', ['install']);
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data);
        }
      }));

      // Wait for install to finish
      const exitCode = await installProcess.exit;
      if (exitCode !== 0) {
        console.error('npm install failed with exit code', exitCode);
        return;
      }

      await webContainer.spawn('npm', ['run', 'dev']);
    }

    main();
  }, [webContainer]);

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && (
        <div className="text-center">
          <p className="mb-2">Loading preview...</p>
        </div>
      )}
      {url && <iframe width="100%" height="100%" src={url} />}
    </div>
  );
}
