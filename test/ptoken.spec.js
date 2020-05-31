const PTokenArtifact = require("../artifacts/PToken.json");
const { expect } = require("chai");

describe("PToken", function() {
  let user;
  let PToken;

  const oneEth = ethers.utils.parseEther("1");
  const twoEth = ethers.utils.parseEther("2");

  beforeEach(async () => {
    const provider = waffle.provider;
    [owner, user] = await provider.getWallets();

    const PTokenFactoryFactory = await ethers.getContractFactory("PTokenFactory");
    const PTokenFactory = await PTokenFactoryFactory.deploy();
    await PTokenFactory.deployed();

    const tx = await PTokenFactory.createPToken("My Token", "MYTOKE", oneEth, oneEth);
    const receipt = await tx.wait();

    PToken = await new ethers.Contract(
      receipt.events.pop().args.token,
      PTokenArtifact.abi,
      provider
    );

    // Check that PToken was deployed as expected
    expect(PToken.address).to.properAddress;
    expect(await PToken.owner()).to.eq(owner.address);
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneEth);
  });

  it("should allow users to purchase and redeem tokens", async function() {
    // Purchase 1 PToken for 1 ETH as user (not owner)
    await PToken.connect(user).purchase(oneEth, {
      value: oneEth
    });

    // Pool balance should drop by 1 and user balance should increase by 1
    expect(await PToken.balanceOf(PToken.address)).to.eq(0);
    expect(await PToken.balanceOf(user.address)).to.eq(oneEth);

    // Redeem 1 PToken as user (not owner)
    await PToken.connect(user).redeem(oneEth);

    // Pool balance should increase by 1 and user balance should decrease by 1
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneEth);
    expect(await PToken.balanceOf(user.address)).to.eq(0);
  });

  it("should allow only the owner to update cost", async function() {
    expect(await PToken.cost()).to.eq(oneEth);

    // Try to update cost of token as user (not owner), cost should remain same
    expect(PToken.connect(user).updateCost(twoEth)).to.be.revertedWith('Ownable: caller is not the owner');
    expect(await PToken.cost()).to.eq(oneEth);

    // Update cost as owner, cost should update to 2
    await PToken.connect(owner).updateCost(twoEth);
    expect(await PToken.cost()).to.eq(twoEth);
  });

  it("should allow only the owner to mint tokens to the pool", async function() {
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneEth);
    
    // Try to mint pool tokens as user (not owner), balance should remain same
    expect(PToken.connect(user).mint(oneEth)).to.be.revertedWith('Ownable: caller is not the owner');
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneEth);

    // Mint tokens as owner, balance should decrease by 1
    await PToken.connect(owner).mint(oneEth);
    expect(await PToken.balanceOf(PToken.address)).to.eq(twoEth);
  });

  it("should allow only the owner to burn tokens from the pool", async function() {
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneEth);
    
    // Try to burn pool tokens as user (not owner), balance should remain same
    expect(PToken.connect(user).burn(oneEth)).to.be.revertedWith('Ownable: caller is not the owner');
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneEth);

    // Burn tokens as owner, balance should decrease by 1
    await PToken.connect(owner).burn(oneEth);
    expect(await PToken.balanceOf(PToken.address)).to.eq(0);
  });
});
