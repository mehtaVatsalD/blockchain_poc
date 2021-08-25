//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library ConversionUtils {

    function getSecondsFromMinutes(uint value, uint unit) public pure returns (uint) {
        return value * unit * 1 minutes;
    }

    function getWiesFromEthers(uint value, uint unit) public pure returns (uint) {
        return value * unit * 1 ether;
    }
    
}