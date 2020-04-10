package com.blogflog.service;

import com.blogflog.exception.NoTransactionsToMineException;
import com.blogflog.models.Block;

import java.io.UnsupportedEncodingException;
import java.util.List;

public interface IBlockchainService {
    List<Block> getBlockchain();
    Block mineBlock() throws UnsupportedEncodingException, NoTransactionsToMineException;
    boolean isBlockchainValid();
}
