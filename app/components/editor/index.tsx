import dynamic from "next/dynamic";
import * as React from "react";
import { FC, useRef, useState } from "react";
import { ReactQuillProps } from "react-quill";
import { BackendContext, useBackend } from "../../lib/shared/backend";
import { useSnackbar } from "material-ui-snackbar-provider";

const QuillNoSSRWrapper = dynamic(import("react-quill"), {
  ssr: false,
});

export function selectLocalImage(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute(
      "accept",
      "image/png, image/gif, image/jpeg, image/bmp, image/x-icon"
    );
    input.click();

    // Listen upload local image and save to server
    input.onchange = () => {
      if (input.files.length > 0) {
        const file = input.files[0];
        if (/^image\//.test(file.type)) {
          resolve(file);
        } else {
          reject("You could only upload images.");
        }
        reject("nothing selected");
      }
    };
  });
}

export async function uploadImage(backend: BackendContext, file: File) {
  const { prefix } = backend;
  const form = new FormData();
  form.set("file", file);
  const resp = await fetch(`${prefix}upload`, {
    method: "POST",
    body: form,
  });

  if (!resp.ok) {
    const errMsg = `${resp.status}:${resp.statusText}`;
    throw errMsg;
  }
  const data = await resp.json();
  return data;
}

async function imageHandler(backend: BackendContext) {
  const imageFile = await selectLocalImage();
  const data = await uploadImage(backend, imageFile);
  const url = `/static/${data.data.fileName}`;
  const editor = this.quill;
  const range = editor.getSelection();
  editor.insertEmbed(range.index, "image", url);
}

/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
];

const Index: FC<ReactQuillProps> = React.memo(
  React.forwardRef((props, ref) => {
    const snackbar = useSnackbar();
    const backend = useBackend();
    const [value, setValue] = useState(props.value);
    React.useImperativeHandle(ref, () => ({
      setValue: (value) => setValue(value),
    }));

    const modules = {
      toolbar: {
        container: [
          [{ header: "1" }, { header: "2" }, { font: [] }],
          [{ size: [] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: function () {
            try {
              imageHandler.call(this, backend.context);
            } catch (e) {
              snackbar.showMessage(e);
            }
          },
        },
      },
      clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
      },
    };
    return (
      <QuillNoSSRWrapper
        {...props}
        modules={{ ...modules, ...props.modules }}
        formats={{ ...formats, ...props.formats }}
        value={value}
        theme="snow"
      />
    );
  }),
  () => true
);

export default Index;
