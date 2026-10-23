import { FileButton, Button } from "@mantine/core";
import { useState } from "react";

/*
 *Mock the upload huge file process
 */
export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const handleFileChange = (file: File | null) => {
    setFile(file);
  };

  return (
    <div>
      <FileButton onChange={handleFileChange}>
        {(props) => <Button {...props}>Upload</Button>}
      </FileButton>

      {file && <div>{file.name}</div>}
    </div>
  );
}
