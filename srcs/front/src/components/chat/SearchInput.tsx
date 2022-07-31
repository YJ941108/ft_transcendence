import React from 'react';
import styled from 'styled-components';

const SearchBarStyleC = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`;

const SearchInputStyleC = styled.input`
	width: 100%;
	/* border: 1px solid #bbb; */
	padding: 10px;
	font-size: 1rem;
`;

const SearchButtonStyleC = styled.button`
	width: 12%;
	float: right;
`;

function SearchInput() {
	return (
		<SearchBarStyleC>
			<SearchInputStyleC type="text" placeholder="Search.." />
			<SearchButtonStyleC type="submit" />
		</SearchBarStyleC>
	);
}

export default SearchInput;
