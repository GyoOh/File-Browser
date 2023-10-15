import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import styled from "@emotion/styled";
import { updateFileContent } from "./FileSlice";
import { Stack, Button } from "@mui/material";

const EditableContent = styled.div`
  padding: 0.5rem;
  width: 90%;
  aspect-ratio: calc(20 / 9);
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const ContentItem = ({
  selectedFile,
  matches,
  searchQuery,
  currentMatchIndex,
}) => {
  const [content, setContent] = useState(selectedFile?.content || "");
  const dispatch = useDispatch();

  useEffect(() => {
    setContent(selectedFile?.content || "");
  }, [selectedFile]);

  const handleContentChange = (e) => {
    setContent(e.currentTarget.innerHTML);
  };

  const handleSubmit = () => {
    dispatch(updateFileContent({ id: selectedFile.id, newContent: content }));
  };

  const displayContent = searchQuery !== "" && matches.length > 0;

  return (
    <>
      <h3>
        {displayContent
          ? matches[currentMatchIndex]?.name
          : selectedFile
          ? selectedFile.name
          : "Select a file"}
      </h3>
      <EditableContent
        contentEditable={true}
        onBlur={handleContentChange}
        dangerouslySetInnerHTML={{
          __html: displayContent
            ? matches[currentMatchIndex].content
            : content,
        }}
      />
      <Stack direction="row" spacing={2}>
        <Button onClick={handleSubmit} variant="outlined">
          Save
        </Button>
      </Stack>
    </>
  );
};

export default ContentItem;