import React, { useState, useRef, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { useDispatch, useSelector } from "react-redux";
import { createFileOrFolder, renameFileOrFolder, deleteFileOrFolder, cutFileOrFolder, copyFileOrFolder, pasteFileOrFolder } from "./FileSlice";
import { ExpandMore as ExpandMoreIcon, NavigateNext as NavigateNextIcon } from "@mui/icons-material";


const FileLayout = styled.div`
  width: 100%;
  margin: 0.1rem 0;
  padding: 0;
`;
const CustomForm = styled.form`
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const EachFile = styled.div`
  display: flex;
  cursor: pointer;
  width: 100%;
  position: relative;
  &:hover {
    background-color: #e1e1e1;
  }
`;

const ContentWrapper = styled.div`
  margin-left: ${(props) => props.depth * 20}px;
`;

const ContextMenu = styled.div`
  position: absolute;
  z-index: 1000;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: white;
  width: 150px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  color: black;
`;
const ContextMenuItem = styled.div`
  padding: 5px;
  &:hover {
    background-color: #e1e1e1;
    cursor: pointer;
  }
`;
const FileNameSpan = styled.span`
  margin-left: 0.5rem;
  ${(props) => props.match && props.searchText && "background-color: #e1e1e1;"}
`;

const FileItem = (props) => {
  const {
    file,
    onFileClick,
    depth = 1,
    anyContextMenuVisible,
    setAnyContextMenuVisible,
    searchText,
  } = props;
  
  const dispatch = useDispatch();
  const clipboard = useSelector((state) => state.fileSystem.clipboard);
  const fileSystem = useSelector((state) => state.fileSystem.fileSystem);
  const [isOpen, setIsOpen] = useState(false);
  const [clickedFileId, setClickedFileId] = useState(null);
  const [createInput, setCreateInput] = useState({
    visible: false,
    type: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const node = useRef();

  useEffect(() => {
    document.addEventListener("mousedown", handleCloseMenu);
    return () => {
      document.removeEventListener("mousedown", handleCloseMenu);
    };
  }, []);

  const toggleOpen = () => {
    if (file.type === "folder") {
      setIsOpen(!isOpen);
    }
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setClickedFileId(file.id);
    setContextMenu({
      targetFile: file.id,
      visible: true,
      x: event.clientX,
      y: event.clientY,
    });
    setAnyContextMenuVisible(true);
  };

  const handleCloseMenu = (e) => {
    if (node.current && node.current.contains(e.target)) {
      return;
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
    setAnyContextMenuVisible(false);
    setCreateInput({ visible: false, type: null });
  };
  const handleNewItem = (e) => {
    e.preventDefault();
    let initialContent = "";
    if (newName) {
      if (createInput.type === "file") {
        const extension = newName.split(".").pop().toLowerCase();
        switch (extension) {
          case "txt":
            initialContent = "test";
            break;
          case "js":
            initialContent = "Hello, World!";
            break;
          case "ts":
            initialContent = "Hello, TypeScript!";
            break;
          case "json":
            initialContent = "{}";
            break;
          default:
            initialContent = "";
        }
      }
    }
    const newItem = {
      id: Date.now().toString(),
      name: newName,
      type: createInput.type,
      parentId: file.id,
      content: initialContent,
      children: createInput.type === "folder" ? [] : undefined,
    };
    dispatch(createFileOrFolder({ parentId: file.id, newItem }));
    setCreateInput({ visible: false, type: null });
    setNewName("");
  };

  const handleCreate = (type) => {
    setCreateInput({ visible: true, type: type });
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleRename = () => {
    setIsEditing(!isEditing);
    setNewName(file.name);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };
  const handleStartRename = () => {
    setIsEditing(true);
    setNewName(file.name);
  };

  const handleSaveRename = (e) => {
    e.preventDefault();
    dispatch(renameFileOrFolder({ id: file.id, newName }));
    setIsEditing(false);
  };

  const handleDelete = () => {
    dispatch(
      deleteFileOrFolder({
        id: clickedFileId,
        parentId: file.parentId || "root",
      })
    );
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleCut = () => {
    dispatch(cutFileOrFolder(file));
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleCopy = () => {
    dispatch(copyFileOrFolder(file));
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handlePaste = () => {
    if (clipboard?.operation) {
      if (clipboard.operation === "cut") {
        dispatch(
          pasteFileOrFolder({ sourceId: clipboard.item.id, targetId: file.id })
        );
      } else if (clipboard.operation === "copy") {
        const cloneItem = (item) => {
          return {
            ...item,
            id: generateUniqueId(),
            children: item.children
              ? item.children.map((child) => cloneItem(child))
              : undefined,
            parentId: file.id,
          };
        };
        const newItem = cloneItem(clipboard.item);
        dispatch(createFileOrFolder({ parentId: file.id, newItem }));
      }
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  };
  const matches = useMemo(() => {
    const result = [];
    const searchMatch = (node, searchQuery) => {
      if (node.name.includes(searchQuery)) {
        result.push(node);
      }
      if (node.children) {
        for (let child of node.children) {
          searchMatch(child, searchQuery);
        }
      }
    };
    fileSystem.forEach((node) => searchMatch(node, searchText));
    return result;
  }, [fileSystem, searchText]);


  const fileContent = (
    <EachFile
      contextVisible={anyContextMenuVisible}
      onClick={() => onFileClick(file)}
      fileName={file.name}
    >
      {file.type === "folder" && (
        <EachFile onClick={toggleOpen}>
          <span>{isOpen ? <ExpandMoreIcon /> : <NavigateNextIcon />}</span>
          {isEditing ? (
            <form onSubmit={handleSaveRename}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleSaveRename}
                autoFocus
              />
            </form>
          ) : (
            <form onSubmit={handleSaveRename}>
              <FileNameSpan
                match={matches.includes(file)}
                searchText={searchText}
                onDoubleClick={handleStartRename}
              >
                {file.name}
              </FileNameSpan>
            </form>
          )}
        </EachFile>
      )}
      {file.type === "file" && (
        <div>
          {isEditing ? (
            <form onSubmit={handleSaveRename}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleSaveRename}
                autoFocus
              />
            </form>
          ) : (
            <form onSubmit={handleSaveRename}>
              <FileNameSpan
                match={matches.includes(file)}
                searchText={searchText}
                onDoubleClick={handleStartRename}
              >
                {file.name}
              </FileNameSpan>
            </form>
          )}
        </div>
      )}
    </EachFile>
  );
  return (
    <FileLayout key={file.id} onContextMenu={handleContextMenu}>
      {contextMenu.visible && contextMenu.targetFile === file.id && (
        <ContextMenu
          ref={node}
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
        >
          {file.type === "folder" && (
            <>
              <ContextMenuItem onClick={() => handleCreate("file")}>
                Create File
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleCreate("folder")}>
                Create Folder
              </ContextMenuItem>
            </>
          )}
          <ContextMenuItem onClick={handleCut}>Cut</ContextMenuItem>
          <ContextMenuItem onClick={handleCopy}>Copy</ContextMenuItem>
          {file.type === "folder" && clipboard?.item && (
            <ContextMenuItem onClick={handlePaste}>Paste</ContextMenuItem>
          )}
          <ContextMenuItem onClick={handleRename}>Rename</ContextMenuItem>
          <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
        </ContextMenu>
      )}

      {depth > 1 ? (
        <ContentWrapper depth={depth}>{fileContent}</ContentWrapper>
      ) : (
        fileContent
      )}
      {createInput.visible && (
        <div>
          <CustomForm onSubmit={handleNewItem}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`Enter ${createInput.type} name`}
              autoFocus
            />
            <button type="submit">Save</button>
          </CustomForm>
        </div>
      )}
      {isOpen &&
        file.children &&
        file.children.map((child) => (
          <FileItem
            key={child.id}
            file={child}
            onFileClick={onFileClick}
            depth={depth + 1}
            anyContextMenuVisible={anyContextMenuVisible}
            setAnyContextMenuVisible={setAnyContextMenuVisible}
            searchText={searchText}
          />
        ))}
    </FileLayout>
  );
};

export default FileItem;
