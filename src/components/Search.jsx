import React from "react";
import { Paper, IconButton, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import styled from "@emotion/styled";

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
  margin-bottom: 1rem;
`;

const Search = ({ searchQuery, onChange, onKeyDown }) => (
  <SearchWrapper>
    <Paper
      component="form"
      onSubmit={(e) => e.preventDefault()}
      sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: 300 }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search here"
        value={searchQuery}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <IconButton
        onClick={onKeyDown}
        type="button"
        sx={{ p: "10px" }}
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  </SearchWrapper>
);

export default Search;