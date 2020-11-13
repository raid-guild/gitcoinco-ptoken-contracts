const { expect } = require('chai');
const PTokenArtifact = require('../artifacts/contracts/PToken.sol/PToken.json');

describe('PToken', function () {
  const oneDai = ethers.utils.parseEther('1');
  const twoDai = ethers.utils.parseEther('2');

  beforeEach(async () => {
    const provider = waffle.provider;
    [owner, user, user2] = await provider.getWallets();

    const MockDAIFactory = await ethers.getContractFactory('MockDAI');
    MockDAI = await MockDAIFactory.deploy();
    await MockDAI.deployed();

    // Faucet the user (not owner) one DAI
    await MockDAI.connect(user).faucet();

    // Deploy our factory contract, which also deploys the logic contract
    const PTokenFactoryFactory = await ethers.getContractFactory('PTokenFactory');
    const PTokenFactory = await PTokenFactoryFactory.deploy();
    await PTokenFactory.deployed();

    // Make sure the PToken logic contract was deployed
    const ptokenLogicAddress = await PTokenFactory.ptokenLogic();
    expect(ptokenLogicAddress.startsWith('0x')).to.be.true;
    expect(ptokenLogicAddress.length).to.equal(42);

    const tx = await PTokenFactory.createPToken(
      'My Token',
      'MYTOKE',
      oneDai,
      oneDai,
      MockDAI.address
    );
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

  it('does not allow the initialize function to be called twice', async () => {
    // It was called once in the constructor
    await expect(
      PToken.connect(user).initializePtoken('My Token', 'MYTOKE', oneDai, oneDai, MockDAI.address)
    ).to.be.revertedWith('Contract instance has already been initialized');
  });

  it('does not let user purchase more tokens than the available amount', async () => {
    // Purchase 1 PToken for 1 DAI as user (not owner)
    const supply = await PToken.totalSupply();
    const amount = supply.add('1');
    await MockDAI.connect(user).approve(PToken.address, amount);
    await expect(PToken.connect(user).purchase(amount)).to.be.revertedWith(
      'SafeERC20: low-level call failed'
    );
  });

  it('informs user if they have insufficient allowance when purchasing', async () => {
    // Purchase 1 PToken for 1 DAI as user (not owner)
    await MockDAI.connect(user).approve(PToken.address, oneDai);
    await expect(PToken.connect(user).purchase(twoDai)).to.be.revertedWith(
      'PToken: Not enough token allowance'
    );
  });

  it("blocks redemptions if you don't own enough tokens", async () => {
    // Redemption for any amount should fail
    await expect(PToken.connect(user).redeem('1')).to.be.revertedWith(
      'ERC20: transfer amount exceeds balance'
    );

    // Purchase 1 PToken for 1 DAI as user (not owner)
    await MockDAI.connect(user).approve(PToken.address, oneDai);
    await PToken.connect(user).purchase(oneDai);

    // Redemption for 2 DAI should fail
    await expect(PToken.connect(user).redeem(twoDai)).to.be.revertedWith(
      'ERC20: transfer amount exceeds balance'
    );
  });

  it('should allow users to purchase and redeem tokens', async () => {
    // Purchase 1 PToken for 1 DAI as user (not owner)
    await MockDAI.connect(user).approve(PToken.address, oneDai);
    await expect(PToken.connect(user).purchase(oneDai))
      .to.emit(PToken, 'Purchased')
      .withArgs(user.address, oneDai, oneDai);

    // Pool PToken balance should drop by 1 and user balance should increase by 1
    expect(await PToken.balanceOf(PToken.address)).to.eq(0);
    expect(await PToken.balanceOf(user.address)).to.eq(oneDai);

    // User DAI balance should drop by 1 and owner balance should increase by 1
    expect(await MockDAI.balanceOf(user.address)).to.eq(0);
    expect(await MockDAI.balanceOf(owner.address)).to.eq(oneDai);

    // Redeem 1 PToken as user (not owner)
    await expect(PToken.connect(user).redeem(oneDai))
      .to.emit(PToken, 'Redeemed')
      .withArgs(user.address, oneDai);

    // Pool balance should increase by 1 and user balance should decrease by 1
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneDai);
    expect(await PToken.balanceOf(user.address)).to.eq(0);
  });

  it('should allow only the owner to update price', async () => {
    expect(await PToken.price()).to.eq(oneDai);

    // Try to update cost of token as user (not owner), cost should remain same
    await expect(PToken.connect(user).updatePrice(twoDai)).to.be.revertedWith(
      'Ownable: caller is not the owner'
    );
    expect(await PToken.price()).to.eq(oneDai);

    // Update cost as owner, cost should update to 2
    await expect(PToken.connect(owner).updatePrice(twoDai))
      .to.emit(PToken, 'PriceUpdated')
      .withArgs(owner.address, twoDai);
    expect(await PToken.price()).to.eq(twoDai);
  });

  it('should allow only the owner to mint tokens to the pool', async () => {
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneDai);

    // Try to mint pool tokens as user (not owner), balance should remain same
    await expect(PToken.connect(user).mint(oneDai)).to.be.revertedWith(
      'Ownable: caller is not the owner'
    );
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneDai);

    // Mint tokens as owner, balance should decrease by 1
    await PToken.connect(owner).mint(oneDai);
    expect(await PToken.balanceOf(PToken.address)).to.eq(twoDai);
  });

  it('should allow only the owner to burn tokens from the pool', async () => {
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneDai);

    // Try to burn pool tokens as user (not owner), balance should remain same
    await expect(PToken.connect(user).burn(oneDai)).to.be.revertedWith(
      'Ownable: caller is not the owner'
    );
    expect(await PToken.balanceOf(PToken.address)).to.eq(oneDai);

    // Burn tokens as owner, balance should decrease by 1
    await PToken.connect(owner).burn(oneDai);
    expect(await PToken.balanceOf(PToken.address)).to.eq(0);
  });

  it('does not allow users to transfer tokens', async () => {
    // User purchase 1 PToken for 1 DAI
    await MockDAI.connect(user).approve(PToken.address, oneDai);
    await PToken.connect(user).purchase(oneDai);

    // User should not be able to transfer the PToken using transfer or transferFrom
    await expect(PToken.connect(user).transfer(user2.address, oneDai)).to.be.revertedWith(
      'PToken: Invalid recipient'
    );
    await expect(
      PToken.connect(user).transferFrom(user.address, user2.address, oneDai)
    ).to.be.revertedWith('PToken: Invalid recipient');
  });
});
