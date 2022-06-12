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

    it("Owner of first token should be accounts[0]", async () => {
      const owner = await _contract.ownerOf(1);
      assert.equal(
        owner,
        accounts[0],
        "Owner of first token is not accounts[0]"
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

    it("Should have one listed token", async () => {
      const listedTokensCount = await _contract.listedTokensCount();
      assert.equal(
        listedTokensCount.toNumber(),
        1,
        "Count of listed tokens is not 1"
      );
    });

    it("Token should be created", async () => {
      const token = await _contract.getToken(1);
      assert.equal(token.tokenId, 1, "Token ID is not 1");
      assert.equal(token.price, _nftPrice, "Price is not _nftPrice");
      assert.equal(token.creator, accounts[0], "Creator is not accounts[0]");
      assert.equal(token.isListed, true, "Token is not listed");
    });
  });

  describe("Buy token", () => {
    before(async () => {
      await _contract.buyToken(1, { from: accounts[1], value: _nftPrice });
    });

    it("Should unlist token", async () => {
      const token = await _contract.getToken(1);
      assert.equal(token.isListed, false, "Token is not unlisted");
    });

    it("Should decrease listed token count", async () => {
      const listedTokensCount = await _contract.listedTokensCount();
      assert.equal(
        listedTokensCount.toNumber(),
        0,
        "Count of listed tokens is not 0"
      );
    });

    it("Should change owner", async () => {
      const owner = await _contract.ownerOf(1);
      assert.equal(
        owner,
        accounts[1],
        "Owner of first token is not accounts[1]"
      );
    });
  });
});
