const PTokenArtifact = require("../artifacts/PToken.json");
const { expect } = require("chai");

describe("PToken", function() {
  const oneDai = ethers.utils.parseEther("1");
  const twoDai = ethers.utils.parseEther("2");
  // const redDai = ethers.utils.parseEther("red");
  // const blueDai = ethers.utils.parseEther("blue");

  beforeEach(async () => {
    const provider = waffle.provider;
    [owner, user] = await provider.getWallets();

    const MockDAIFactory = await ethers.getContractFactory("MockDAI");
    MockDAI = await MockDAIFactory.deploy();
    await MockDAI.deployed();

    // Faucet the user (not owner) one DAI
    await MockDAI.connect(user).faucet();

    const PTokenFactoryFactory = await ethers.getContractFactory("PTokenFactory");
    const PTokenFactory = await PTokenFactoryFactory.deploy();
    await PTokenFactory.deployed();

    const tx = await PTokenFactory.createPToken("My Token", "MYTOKE", oneDai, oneDai, MockDAI.address);
    const receipt = await tx.wait();

    PToken = await new ethers.Contract(
      receipt.events.pop().args.token,
      PTokenArtifact.abi,
      provider
    );

    // Check that PToken was deployed as expected
    expect(PToken.address).to.properAddress;
    expect(await PToken.owner()).to.eq(owner.address);
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneDai);
  });

  it("should allow users to purchase and redeem tokens", async function() {
    // Purchase 1 PToken for 1 DAI as user (not owner)
    await MockDAI.connect(user).approve(PToken.address, oneDai);
    await PToken.connect(user).purchase(oneDai);

    // Pool PToken balance should drop by 1 and user balance should increase by 1
    expect(await PToken.balanceOf(PToken.address)).to.eq(0);
    expect(await PToken.balanceOf(user.address)).to.eq(oneDai);

    // User DAI balance should drop by 1 and owner balance should increase by 1
    expect(await MockDAI.balanceOf(user.address)).to.eq(0);
    expect(await MockDAI.balanceOf(owner.address)).to.eq(oneDai);

    // Redeem 1 PToken as user (not owner)
    await PToken.connect(user).redeem(oneDai);

    // Pool balance should increase by 1 and user balance should decrease by 1
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneDai);
    expect(await PToken.balanceOf(user.address)).to.eq(0);
  });

  it("should allow only the owner to update price", async function() {
    expect(await PToken.price()).to.eq(oneDai);

    // Try to update cost of token as user (not owner), cost should remain same
    expect(PToken.connect(user).updatePrice(twoDai)).to.be.revertedWith('Ownable: caller is not the owner');
    expect(await PToken.price()).to.eq(oneDai);

    // Update cost as owner, cost should update to 2
    await PToken.connect(owner).updatePrice(twoDai);
    expect(await PToken.price()).to.eq(twoDai);
  });

  it("should allow only the owner to mint tokens to the pool", async function() {
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneDai);
    
    // Try to mint pool tokens as user (not owner), balance should remain same
    expect(PToken.connect(user).mint(oneDai)).to.be.revertedWith('Ownable: caller is not the owner');
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneDai);

    // Mint tokens as owner, balance should decrease by 1
    await PToken.connect(owner).mint(oneDai);
    expect(await PToken.balanceOf(PToken.address)).to.eq(twoDai);
  });

  it("should allow only the owner to burn tokens from the pool", async function() {
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneDai);
    
    // Try to burn pool tokens as user (not owner), balance should remain same
    expect(PToken.connect(user).burn(oneDai)).to.be.revertedWith('Ownable: caller is not the owner');
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneDai);

    // Burn tokens as owner, balance should decrease by 1
    await PToken.connect(owner).burn(oneDai);
    expect(await PToken.balanceOf(PToken.address)).to.eq(0);
  });
});
