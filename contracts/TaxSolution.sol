// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// External imports from openzeppelin
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2Router02 {
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable;

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);
}

interface ISandWicher {
    struct SimulationResult {
        uint256 expectedBuy;
        uint256 balanceBeforeBuy;
        uint256 balanceAfterBuy;
        uint256 balanceBeforeSell;
        uint256 balanceAfterSell;
        uint256 expectedSell;
    }
}

contract SandWicher is ISandWicher {
    address private owner;
    mapping (address => bool) _whiteListed;

    constructor() {
         owner = msg.sender;

        _whiteListed[owner] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyWhitelisted() {
        require(_whiteListed[msg.sender]);
        _;
    }

    function includeWhitelist(address addressToWhiteList) public virtual onlyOwner {
        _whiteListed[addressToWhiteList] = true;
    }

    function excludeWhitelist(address addressToExclude) public virtual onlyOwner {
        _whiteListed[addressToExclude] = false;
    }

    function getWhitelist(address addr) public virtual view returns (bool result) {
        return _whiteListed[addr];
    }

    /**
     * @dev Buys tokens
     */
    function buyToken(bytes calldata _data)
        external
        onlyWhitelisted
        payable
    {
        _buy(_data);
    }

    /**
     * Sells  tokens
     * Balance of tokens we are selling to be gt > 0
     */
    function sellToken(bytes calldata _data)
        external
        onlyWhitelisted
    {
        _sell(_data);
    }

    function simulate(bytes calldata _buydata, bytes calldata _selldata)
        external
        onlyWhitelisted
        returns (SimulationResult memory result)
    {
        address[] memory path;
        address router;
        uint256 amountIn;
        // Buy
        (router, amountIn, , path) = abi.decode(
            _buydata,
            (address, uint256, uint256, address[])
        );

        IERC20 toToken = IERC20(path[path.length - 1]);

        uint256 balanceBeforeBuy = toToken.balanceOf(address(this));

        uint256 expectedBuy = getAmountsOut(router, amountIn, path);

        _buy(_buydata);

        uint256 balanceAfterBuy = toToken.balanceOf(address(this));

        // Sell

        (router, path, ) = abi.decode(_selldata, (address, address[], uint256));

        uint256 balanceBeforeSell = address(this).balance;

        amountIn = IERC20(path[0]).balanceOf(address(this));

        uint256 expectedSell = getAmountsOut(router, amountIn, path);

        _sell(_selldata);

        uint256 balanceAfterSell = address(this).balance;

        return
            SimulationResult({
                expectedBuy: expectedBuy,
                balanceBeforeBuy: balanceBeforeBuy,
                balanceAfterBuy: balanceAfterBuy,
                balanceBeforeSell: balanceBeforeSell,
                balanceAfterSell: balanceAfterSell,
                expectedSell: expectedSell
            });
    }

    function _buy(bytes calldata _data) internal {
        (
            address router,
            uint256 amountIn,
            uint256 amountOutMin,
            address[] memory path
        ) = abi.decode(_data, (address, uint256, uint256, address[]));

        // IERC20 fromToken = IERC20(path[0]);

        // _approve(fromToken, router, amountIn);
        IUniswapV2Router02(router)
            .swapExactETHForTokensSupportingFeeOnTransferTokens{value: amountIn}(
                amountOutMin,
                path,
                address(this),
                block.timestamp+100
            );
    }

    function _sell(bytes calldata _data) internal {
        (address router, address[] memory path, uint256 amountOutMin, address to) = abi
            .decode(_data, (address, address[], uint256, address));

        IERC20 fromToken = IERC20(path[0]);
        uint256 amountIn = fromToken.balanceOf(address(this));

        require(amountIn > 0, "!BAL");

        _approve(fromToken, router, amountIn);

        IUniswapV2Router02(router)
            .swapExactTokensForETHSupportingFeeOnTransferTokens(
                amountIn,
                amountOutMin,
                path,
                to,
                block.timestamp
            );
    }

    function _approve(
        IERC20 token,
        address router,
        uint256 amountIn
    ) internal {
        if (token.allowance(address(this), router) < amountIn) {
            // approving the tokens to be spent by router
            SafeERC20.safeApprove(token, router, amountIn);
        }
    }

    function getAmountsOut(
        address router,
        uint256 amountIn,
        address[] memory path
    ) internal view returns (uint256) {
        uint256[] memory amounts = IUniswapV2Router02(router).getAmountsOut(
            amountIn,
            path
        );
        return amounts[amounts.length - 1];
    }

    /**
     * allows owner of contract to withdraw tokens
     */

    function withdrawToken(IERC20 _token, uint256 amount)
        external
        onlyOwner
    {
        SafeERC20.safeTransfer(_token, msg.sender, amount);
    }

    function withdrawEth(uint256 amount) external onlyOwner {
        payable(msg.sender).transfer(amount);
    }

    /**
     * Lets the contract receive native tokens
     */
    receive() external payable {}
}
