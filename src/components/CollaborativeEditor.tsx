import { useMutation, useOthers, useStorage } from "liveblocks.config";
import { type DeltaStatic, type Sources } from "quill";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";
import type * as ReactQuillType from "react-quill";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function CollaborativeEditor() {
  const others = useOthers();

  const html = useStorage((root) => root.content.html);
  const remoteVersion = useStorage((root) => root.content.version);

  const [localHtml, setLocalHtml] = useState("");
  const [version, setVersion] = useState(() => remoteVersion ?? 0);
  const [conflictingChanges, setConflictingChanges] = useState("");
  const [changesMade, setChangesMade] = useState(false);

  const update = useMutation(({ storage }, newHtml: string) => {
    const newVersion = version + 1;
    setVersion(newVersion);
    storage.get("content").set("html", newHtml);
    storage.get("content").set("version", newVersion);
  }, []);

  useEffect(() => {
    if (html == null) {
      return;
    }
    setLocalHtml(html);
  }, [html]);

  useEffect(() => {
    if (remoteVersion == null || changesMade) {
      return;
    }
    setVersion(remoteVersion);
  }, [changesMade, remoteVersion]);

  const handleQuillChange = (
    value: string,
    delta: DeltaStatic,
    source: Sources,
    editor: ReactQuillType.UnprivilegedEditor,
  ) => {
    setChangesMade(true);
    if (remoteVersion && remoteVersion !== version) {
      setConflictingChanges(editor.getText());
      setLocalHtml(value);
    } else {
      setConflictingChanges("");
      setLocalHtml(value);
      update(value);
      setChangesMade(false);
    }
  };

  const userCount = others.length;

  return (
    <div>
      <h2>Type Together</h2>
      <div>There are {userCount} other user(s) online</div>
      {conflictingChanges && (
        <div>
          <h3>Conflicting Changes</h3>
          <pre>{JSON.stringify(conflictingChanges, null, 2)}</pre>
          <p>Please save your changes on your end, reload, and try again.</p>
        </div>
      )}
      {html == null || remoteVersion == null ? (
        <div>Loading...</div>
      ) : (
        <ReactQuill theme="snow" value={localHtml} onChange={handleQuillChange} preserveWhitespace={true} />
      )}
    </div>
  );
}
