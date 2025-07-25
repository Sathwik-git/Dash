import { WebContainer } from "@webcontainer/api";
import React, { useEffect, useState } from "react";

interface PreviewFrameProps {
  webContainer: WebContainer;
}

export function PreviewApp({ webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");

  async function main() {
    const installProcess = await webContainer.spawn("npm", ["install"]);

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      })
    );

    await webContainer.spawn("npm", ["run", "dev"]);

    webContainer.on("server-ready", (port, url) => {
      console.log(url);
      console.log(port);
      setUrl(url);
    });
  }

  useEffect(() => {
    main();
  }, []);
  return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 bg-black">
      {!url ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-sm">Loading...</p>
        </div>
      ) : (
        <iframe
          src={url}
          width="100%"
          height="100%"
          className="border-none"
        />
      )}
    </div>
  );
}
