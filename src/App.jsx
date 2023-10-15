import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import styled from "@emotion/styled";
import FileItem from "./components/FileItem";
import ContentItem from "./components/ContentItem";
import Search from "./components/Search";

const Wrapper = styled.div`
  display: flex;
  background-color: grey;
  min-height: 100vh;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  color: white;
`;
const Sidebar = styled.aside`
  background-color: grey;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 20rem;
  height: 100vh;
  padding: 1rem;
`;
const Main = styled.main`
  background-color: #222222;
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: calc(100% - 20rem);
  height: 100vh;
  border-left: 1px solid #e1e1e1;
`;

function App() {
  const fileSystem = useSelector((state) => state.fileSystem.fileSystem);
  const [selectedFile, setSelectedFile] = useState(null);
  const [anyContextMenuVisible, setAnyContextMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const handleFileClick = (file) => {
    if (file.type === "file") {
      setSelectedFile(file);
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const matches = useMemo(() => {
    const result = [];
    const searchMatch = (node, searchText) => {
      if (node.name.includes(searchText)) {
        result.push(node);
      }
      if (node.children) {
        for (let child of node.children) {
          searchMatch(child, searchText);
        }
      }
    };
    fileSystem.forEach((node) => searchMatch(node, searchQuery));
    return result;
  }, [fileSystem, searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setCurrentMatchIndex((currentMatchIndex + 1) % matches.length);
    }
    if (e.type === "click") {
      setCurrentMatchIndex((currentMatchIndex + 1) % matches.length);
    }
  };

  return (
    <Wrapper>
      <Sidebar>
        <h2>FILE-BROWSER</h2>
        <Search
          searchQuery={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        {fileSystem.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onFileClick={handleFileClick}
            anyContextMenuVisible={anyContextMenuVisible}
            setAnyContextMenuVisible={setAnyContextMenuVisible}
            searchText={searchQuery}
            currentMatchIndex={currentMatchIndex}
            matches={matches}
          />
        ))}
      </Sidebar>
      <Main>
        <ContentItem
          selectedFile={selectedFile}
          matches={matches}
          searchQuery={searchQuery}
          currentMatchIndex={currentMatchIndex}
        />
      </Main>
    </Wrapper>
  );
}

export default App;
