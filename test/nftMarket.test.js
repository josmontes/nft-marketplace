const NftMarket = artifacts.require("NftMarket");
const { ethers } = require("ethers");

contract("NftMarket", (accounts) => {
  let _contract = null;
  let _nftPrice = ethers.utils.parseEther("0.1");
  let _listingPrice = ethers.utils.parseEther("0.025");

  before(async () => {
    _contract = await NftMarket.deployed();
  });

  describe("Mint token", () => {
    const tokenURI = "https://example.com/token/1";

    before(async () => {
      await _contract.mintToken(tokenURI, _nftPrice, {
        from: accounts[0],
        value: _listingPrice,
      });
    });

    it("Owner of first token should be address[0]", async () => {
      const owner = await _contract.ownerOf(1);
      assert.equal(
        owner,
        accounts[0],
        "Owner of first token is not address[0]"
      );
    });

    it("URI of first token should be tokenURI", async () => {
      const uri = await _contract.tokenURI(1);
      assert.equal(uri, tokenURI, "URI of first token is not tokenURI");
    });

    it("Should not be possible to mint token with same URI", async () => {
      try {
        await _contract.mintToken(tokenURI, _nftPrice, { from: accounts[0] });
        assert.fail("Mint token with same URI should not be possible");
      } catch (e) {
        assert.ok(true, "Mint token with same URI should not be possible");
      }
    });

    it("Should have one listed item", async () => {
      const listedItemsCount = await _contract.listedItemsCount();
      assert.equal(
        listedItemsCount.toNumber(),
        1,
        "Count of listed items is not 1"
      );
    });

    it("Item should be created", async () => {
      const item = await _contract.getItem(1);
      assert.equal(item.tokenId, 1, "Token ID is not 1");
      assert.equal(item.price, _nftPrice, "Price is not _nftPrice");
      assert.equal(item.owner, accounts[0], "Owner is not accounts[0]");
      assert.equal(item.isListed, true, "Item is not listed");
    });
  });
});
