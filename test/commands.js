const { ethers } = require("ethers");

const instance = await NftMarket.deployed();

const listingPrice = await instance.listingPrice();

let _firstPrice = ethers.utils.parseEther("0.5");
instance.mintToken("https://gateway.pinata.cloud/ipfs/Qmb4aom5xNRE5CBRHZsxCsYSdcmX8zfHXgM7ovZxLp3CqL", _firstPrice, {value: listingPrice,from: accounts[0]})

let _secondPrice = ethers.utils.parseEther("0.35");
instance.mintToken("https://gateway.pinata.cloud/ipfs/QmdAxw23ssPMsgZ4smNNqEM95FEtvw9vUQTbRd67jkBj1J", _secondPrice, {value: listingPrice,from: accounts[0]})