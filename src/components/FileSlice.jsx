import { createSlice } from "@reduxjs/toolkit";

const initialFileSystem = [
  {
    id: "root",
    name: "root-folder",
    type: "folder",
    children: [
      {
        id: 2,
        name: "child-folder",
        type: "folder",
        children: [
          { id: 3, name: "test.txt", type: "file", content: "test" },
          { id: 4, name: "test1.txt", type: "file", content: "test1" },
        ],
      },
      {
        id: 5,
        name: "child-folder1",
        type: "folder",
        children: [{ id: 6, name: "some.bin", type: "file", content: "" }],
      },
    ],
  },
];
const initialClipboard = {
  operation: null,
  item: null,
};
const initialState = {
  fileSystem: initialFileSystem,
  clipboard: initialClipboard,
  searchResults: [],
};

const findItemById = (folder, id) => {
  if (folder.id === id) return folder;

  if (folder.children && Array.isArray(folder.children)) {
    for (let child of folder.children) {
      const found = findItemById(child, id);
      if (found) return found;
    }
  }

  return null;
};
let lastId = Math.max(...initialFileSystem.map((item) => item.id));

const generateUniqueId = () => {
  lastId += 1;
  return lastId;
};
const assignNewIds = (item) => {
  item.id = generateUniqueId();
  if (item.children) {
    item.children.forEach((child) => assignNewIds(child));
  }
  return item;
};

const deepCopy = (item) => JSON.parse(JSON.stringify(item));

const removeItemById = (children, id) => {
  return children
    .filter((child) => child.id !== id)
    .map((child) => {
      if (child.children) {
        child.children = removeItemById(child.children, id);
      }
      return child;
    });
};

export const fileSystemSlice = createSlice({
  name: "fileSystem",
  initialState,
  reducers: {
    createFileOrFolder: (state, action) => {
      const parentId = action.payload.parentId || "root";
      const newItem = action.payload.newItem;
      const parentFolder = findItemById(state.fileSystem[0], parentId);
      if (parentFolder && parentFolder.children) {
        parentFolder.children.push(newItem);
      }
    },
    updateFileContent: (state, action) => {
      const { id, newContent } = action.payload;
      const item = findItemById(state.fileSystem[0], id);
      item.content = newContent;
    },

    deleteFileOrFolder: (state, action) => {
      const itemId = action.payload.id;
      if (itemId === "root") return;
      const deleteFromChildren = (children) => {
        let updatedChildren = children.filter((child) => child.id !== itemId);
        updatedChildren.forEach((child) => {
          if (child.children) {
            child.children = deleteFromChildren(child.children);
          }
        });

        return updatedChildren;
      };

      state.fileSystem[0].children = deleteFromChildren(
        state.fileSystem[0].children
      );
    },

    copyFileOrFolder: (state, action) => {
      const itemId = action.payload.id;
      if (itemId === "root") return;
      const item = findItemById(state.fileSystem[0], itemId);
      state.clipboard = {
        operation: "copy",
        item: item,
      };
    },
    cutFileOrFolder: (state, action) => {
      const itemId = action.payload.id;
      if (itemId === "root") return;
      const item = findItemById(state.fileSystem[0], itemId);
      state.clipboard = {
        operation: "cut",
        item: item,
      };
    },

    pasteFileOrFolder: (state, action) => {
      const copiedFileSystem = deepCopy(state.fileSystem);
      const parentFolder = findItemById(
        copiedFileSystem[0],
        action.payload.targetId
      );

      if (parentFolder && state.clipboard.item) {
        if (state.clipboard.operation === "copy") {
          const itemToPaste = assignNewIds(deepCopy(state.clipboard.item));
          parentFolder.children.push(itemToPaste);
        } else if (state.clipboard.operation === "cut") {
          copiedFileSystem[0].children = removeItemById(
            copiedFileSystem[0].children,
            state.clipboard.item.id
          );
          parentFolder.children.push(state.clipboard.item);
          state.clipboard = initialClipboard;
        }
        state.fileSystem = copiedFileSystem;
      }
    },
    renameFileOrFolder: (state, action) => {
      const item = findItemById(state.fileSystem[0], action.payload.id);
      if (item && action.payload.newName) {
        item.name = action.payload.newName;
      }
    },
  },
});

export default fileSystemSlice.reducer;
export const {
  createFileOrFolder,
  updateFileContent,
  copyFileOrFolder,
  cutFileOrFolder,
  pasteFileOrFolder,
  renameFileOrFolder,
  deleteFileOrFolder,
} = fileSystemSlice.actions;
