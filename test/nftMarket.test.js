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

  describe("Token transfers", () => {
    before(async () => {
      await _contract.mintToken("https://example.com/token/2", _nftPrice, {
        from: accounts[0],
        value: _listingPrice,
      });
    });

    it("Should have two tokens created", async () => {
      const totalSupply = await _contract.totalSupply();
      assert.equal(totalSupply.toNumber(), 2, "Total supply is not 2");
    });

    it("Should be able to retrieve token by index", async () => {
      const token1 = await _contract.getTokenByIndex(0);
      const token2 = await _contract.getTokenByIndex(1);
      assert.equal(token1, 1, "Token ID is not 1");
      assert.equal(token2, 2, "Token ID is not 2");
    });

    it("Should have only 1 listed token", async () => {
      const tokens = await _contract.getAllTokensOnSale();
      assert.equal(tokens.length, 1, "There should be only 1 listed token");
      assert.equal(tokens[0].tokenId, 2, "Listed token should be token 2");
    });
  });

  describe("Owned tokens", () => {
    it("accounts[0] Should own 1 token", async () => {
      const tokens = await _contract.getOwnedTokens({ from: accounts[0] });
      assert.equal(tokens.length, 1, "accounts[0] should own 1 token");
      assert.equal(tokens[0].tokenId, 2, "accounts[0] should own token 2");
    });

    it("accounts[1] Should own 1 token", async () => {
      const tokens = await _contract.getOwnedTokens({ from: accounts[1] });
      assert.equal(tokens.length, 1, "accounts[1] should own 1 token");
      assert.equal(tokens[0].tokenId, 1, "accounts[1] should own token 1");
    });
  });

  describe("Token transfer to another account", () => {
    before(async () => {
      await _contract.transferFrom(accounts[0], accounts[1], 2, {
        from: accounts[0],
      });
    });

    it("accounts[0] should own 0 tokens", async () => {
      const tokens = await _contract.getOwnedTokens({ from: accounts[0] });
      assert.equal(tokens.length, 0, "accounts[0] owns more than 0 tokens");
    });

    it("accounts[1] should own 2 tokens", async () => {
      const tokens = await _contract.getOwnedTokens({ from: accounts[1] });
      assert.equal(tokens.length, 2, "accounts[1] does not own 2 tokens");
    });

    it("Should not transfer token not owned", async () => {
      try {
        await _contract.transferFrom(accounts[0], accounts[1], 1, {
          from: accounts[0],
        });
        assert.fail("Should not be possible to transfer token not owned");
      } catch (e) {
        assert.ok(true, "Should not be possible to transfer token not owned");
      }
    });
  });

  describe("Burn token", () => {
    before(async () => {
      await _contract.mintToken("https://example.com/token/3", _nftPrice, {
        from: accounts[2],
        value: _listingPrice,
      });
    });

    it("accounts[2] should own 1 token", async () => {
      const tokens = await _contract.getOwnedTokens({ from: accounts[2] });
      assert.equal(tokens.length, 1, "accounts[2] does not own 1 token");
    });

    it("Should burn token", async () => {
      await _contract.burnToken(3, { from: accounts[2] });
      const tokens = await _contract.getOwnedTokens({ from: accounts[2] });
      assert.equal(tokens.length, 0, "accounts[2] owns more than 0 tokens");
    });
  });
});
