import { useMutation, useOthers, useStorage } from "liveblocks.config";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function CollaborativeEditor() {
  const others = useOthers();

  const html = useStorage((root) => root.content.html);

  const [localHtml, setLocalHtml] = useState("");

  const update = useMutation(({ storage }, newHtml: string) => {
    storage.get("content").set("html", newHtml);
  }, []);

  useEffect(() => {
    if (html == null) {
      return;
    }
    setLocalHtml(html);
  }, [html]);

  const userCount = others.length;
  const lines = localHtml.split("</p>");

  return (
    <div>
      <div>There are {userCount} other user(s) online</div>
      <div>Number of lines: {lines.length}</div>
      <ReactQuill
        theme="snow"
        value={localHtml}
        onChange={(value, delta, source, editor) => {
          setLocalHtml(value);
          update(value);
        }}
        preserveWhitespace={true}
      />
    </div>
  );
}
