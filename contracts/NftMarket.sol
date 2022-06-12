// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NftMarket is ERC721URIStorage {
    using Counters for Counters.Counter;

    struct Token {
        uint256 tokenId;
        uint256 price;
        address creator;
        bool isListed;
    }

    uint256 public listingPrice = 0.025 ether;

    Counters.Counter private _listedTokens;
    Counters.Counter private _tokenIds;

    mapping(string => bool) private _usedTokenURIs;
    mapping(uint256 => Token) private _idToToken;

    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;
    mapping(uint256 => uint256) private _idToOwnedIndex;

    uint256[] private _allTokens;
    mapping(uint256 => uint256) private _idToTokenIndex;

    event TokenCreated(
        uint256 tokenId,
        uint256 price,
        address creator,
        bool isListed
    );

    constructor() ERC721("CreaturesNFT", "CNFT") {}

    function getToken(uint256 tokenId) public view returns (Token memory) {
        return _idToToken[tokenId];
    }

    function listedTokensCount() public view returns (uint256) {
        return _listedTokens.current();
    }

    function tokenURIExists(string memory tokenURI) public view returns (bool) {
        return _usedTokenURIs[tokenURI];
    }

    function totalSupply() public view returns (uint256) {
        return _allTokens.length;
    }

    function getTokenByIndex(uint256 index) public view returns (uint256) {
        require(index < totalSupply(), "Index out of bounds");
        return _allTokens[index];
    }

    function getTokenByOwnerIndex(address owner, uint256 index)
        public
        view
        returns (uint256)
    {
        require(index < ERC721.balanceOf(owner), "Index out of bounds");
        return _ownedTokens[owner][index];
    }

    function getAllTokensOnSale() public view returns (Token[] memory) {
        uint256 allTokensCount = totalSupply();
        uint256 currentIndex = 0;
        Token[] memory tokens = new Token[](_listedTokens.current());

        for (uint256 i = 0; i < allTokensCount; i++) {
            uint256 tokenId = getTokenByIndex(i);
            Token storage token = _idToToken[tokenId];

            if (token.isListed) {
                tokens[currentIndex] = token;
                currentIndex++;
            }
        }

        return tokens;
    }

    function getOwnedTokens() public view returns (Token[] memory) {
        uint256 ownedTokensCount = ERC721.balanceOf(msg.sender);
        Token[] memory tokens = new Token[](ownedTokensCount);

        for (uint256 i = 0; i < ownedTokensCount; i++) {
            uint256 tokenId = getTokenByOwnerIndex(msg.sender, i);
            Token storage token = _idToToken[tokenId];

            tokens[i] = token;
        }

        return tokens;
    }

    function burnToken (uint256 tokenId) public {
        require(ERC721.ownerOf(tokenId) == msg.sender, "You are not the owner of this token");
        _burn(tokenId);
    }

    function mintToken(string memory tokenURI, uint256 price)
        public
        payable
        returns (uint256)
    {
        require(!tokenURIExists(tokenURI), "Token URI already exists");
        require(
            msg.value == listingPrice,
            "Price does not match listing price"
        );

        _tokenIds.increment();
        _listedTokens.increment();

        uint256 tokenId = _tokenIds.current();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        _usedTokenURIs[tokenURI] = true;

        _createToken(tokenId, price);

        return tokenId;
    }

    function buyToken(uint256 tokenId) public payable {
        uint256 price = _idToToken[tokenId].price;
        address owner = ERC721.ownerOf(tokenId);

        require(owner != msg.sender, "You cannot buy your own token");
        require(msg.value == price, "Price does not match");

        _idToToken[tokenId].isListed = false;
        _listedTokens.decrement();

        _transfer(owner, msg.sender, tokenId);
        payable(owner).transfer(msg.value);
    }

    function _createToken(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be greater than 0");

        _idToToken[tokenId] = Token(tokenId, price, msg.sender, true);

        emit TokenCreated(tokenId, price, msg.sender, true);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (from == address(0)) {
            _addTokenToAllTokens(tokenId);
        } else if (from != to) {
            _removeTokenFromOwner(from, tokenId);
        }

        if (to == address(0)) {
            _removeTokenFromAllTokens(tokenId);
        } else if (to != from) {
            _addTokenToOwner(to, tokenId);
        }
    }

    function _addTokenToAllTokens(uint256 tokenId) private {
        _idToTokenIndex[tokenId] = _allTokens.length;
        _allTokens.push(tokenId);
    }

    function _addTokenToOwner(address to, uint256 tokenId) private {
        uint256 length = ERC721.balanceOf(to);
        _ownedTokens[to][length] = tokenId;
        _idToOwnedIndex[tokenId] = length;
    }

    function _removeTokenFromOwner(address from, uint256 tokenId) private {
        uint256 lastIndex = ERC721.balanceOf(from) - 1;
        uint tokenIndex = _idToOwnedIndex[tokenId];

        if (tokenIndex != lastIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastIndex];

            _ownedTokens[from][tokenIndex] = lastTokenId;
            _idToOwnedIndex[lastTokenId] = tokenIndex;
        }

        delete _idToOwnedIndex[tokenId];
        delete _ownedTokens[from][lastIndex];
    }

    function _removeTokenFromAllTokens(uint256 tokenId) private {
        uint256 lastIndex = _allTokens.length - 1;
        uint256 tokenIndex = _idToTokenIndex[tokenId];
        uint256 lastTokenId = _allTokens[lastIndex];

        _allTokens[tokenIndex] = lastTokenId;
        _idToTokenIndex[lastTokenId] = tokenIndex;

        delete _idToTokenIndex[tokenId];
        _allTokens.pop();
    }
}
