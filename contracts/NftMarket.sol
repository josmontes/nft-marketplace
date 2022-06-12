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
}
