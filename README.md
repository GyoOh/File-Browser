# File-Browser

## Table of contents

- [General info](#general-info)
- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)

## General info

Welcome to the File Browser! This web application allows you to manage and browse through your files and folders seamlessly. It is developed using the React.js framework.

## Features

- **Initial Access:**  
  - First-time users encounter a root folder that's non-deletable and non-movable, but renameable.
  
- **File/Folder Operations:**  
  - Create, delete, rename, and transfer (copy, cut, paste) capabilities are provided.
  - New text-based files (txt, js, ts, json) come with predefined content.
  
- **Persistence:**  
  - User modifications persist across visits.
  
- **Search:**  
  - Find files and folders quickly with the search bar.
  
- **File Browsing:**  
  - Supports viewing of txt, js, ts, and json files directly in the browser. Other file types aren't displayed.

## Technologies
- React.js version: 18.2.15 
- Redux, Redux-React, Redux Toolkit 
- Emotion CSS, Mui

## Setup
To initialize, follow these steps:
```bash
$ cd file-browser
$ npm install
$ npm run dev or npm start

