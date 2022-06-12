// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NftMarket is ERC721URIStorage {
    using Counters for Counters.Counter;

    struct Item {
        uint256 tokenId;
        uint256 price;
        address owner;
        bool isListed;
    }

    uint public listingPrice = 0.025 ether;

    Counters.Counter private _listedItems;
    Counters.Counter private _tokenIds;

    mapping(string => bool) private _usedTokenURIs;
    mapping(uint256 => Item) private _idToItem;

    event ItemCreated(
        uint256 tokenId,
        uint256 price,
        address owner,
        bool isListed
    );

    constructor() ERC721("CreaturesNFT", "CNFT") {}

    function getItem(uint256 tokenId) public view returns (Item memory) {
        return _idToItem[tokenId];
    }

    function listedItemsCount() public view returns (uint256) {
        return _listedItems.current();
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
        require(msg.value == listingPrice, "Price does not match listing price");

        _tokenIds.increment();
        _listedItems.increment();

        uint256 tokenId = _tokenIds.current();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        _usedTokenURIs[tokenURI] = true;

        _createItem(tokenId, price);

        return tokenId;
    }

    function _createItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be greater than 0");

        _idToItem[tokenId] = Item(tokenId, price, msg.sender, true);

        emit ItemCreated(tokenId, price, msg.sender, true);
    }
}
