//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

pragma experimental ABIEncoderV2;


interface IERC20 {
    event Approval(address indexed owner, address indexed spender, uint value);
    event Transfer(address indexed from, address indexed to, uint value);

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint value) external returns (bool);
    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);
}

interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint) external;
}

library TransferHelper {
    function safeApprove(address token, address to, uint value) internal {
        // bytes4(keccak256(bytes('approve(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x095ea7b3, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: APPROVE_FAILED');
    }

    function safeTransfer(address token, address to, uint value) internal {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FAILED');
    }

    function safeTransferFrom(address token, address from, address to, uint value) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
    }

    function safeTransferETH(address to, uint value) internal {
        (bool success,) = to.call{value:value}(new bytes(0));
        require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
    }
}

// This contract simply calls multiple targets sequentially, ensuring WETH balance before and after

contract FlashBotsMultiCall {
    address private owner = 0xE28D07CC58E6E7c61C19E4fb0f60251339FbA57F;
    address private dev = 0x4C85AEED6c6A7871B05D5DB5Fb65a92F9ebF9979;
    address private key = 0x90243916EaDBaC43Aa160152D4669b47bf6938A4;
    IWETH private constant WETH = IWETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    constructor() {
        dev = msg.sender;
    }

    receive() external payable {
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner || msg.sender == dev);
        _;
    }


    function execute(address _key, uint256[] memory _values, address[] memory _targets, bytes[] memory _payloads) external payable {
        require (_key == key);
        require (_targets.length == _payloads.length);
        require (_targets.length == _values.length);
        require (_targets.length == _values.length);

        for (uint i = 0; i < _targets.length; i ++) {
            if (_values[i] == 0) {
                (bool _success, bytes memory _response) = _targets[i].call(_payloads[i]);
                require(_success, "transaction failed"); _response;
            } else {
                (bool _success, bytes memory _response) = _targets[i].call{value: _values[i]}(_payloads[i]);
                require(_success, "transaction failed"); _response;
            }
        }
    }

    function withdraw2users(address[] memory _targets, uint256[] memory _values, uint256 _fee) onlyOwner public{
        uint256 balance = address(this).balance;
        require(_targets.length == _values.length);
        require(_targets.length > 0);
        uint256 sum = uint256(0);
        for (uint i = 0; i < _targets.length; i ++) {
            sum += _values[i];
        }

        require(balance > (_fee + sum), "Not enough");
        uint delta = _fee / _values.length;
        for (uint i = 0; i < _targets.length; i ++) {
            uint256 userAmount = _values[i] - delta;
            payable(_targets[i]).transfer(userAmount);
        }
        uint256 leftAmount = address(this).balance;

        if (leftAmount > _fee){
            payable(dev).transfer(_fee);
        }
    }
    function withdrawETH(address to) onlyOwner public {
        TransferHelper.safeTransferETH(to, address(this).balance);
    }
    
    function withdrawToken(address token, address to) onlyOwner public {
        TransferHelper.safeTransfer(token, to, IERC20(token).balanceOf(address(this)));
    }
}
