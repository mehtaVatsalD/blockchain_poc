package com.blogflog.repository;

import com.blogflog.models.Block;

import java.util.List;

public interface IBlockchainRepository {
    void saveMinedBlock(Block block);
    List<Block> getBlockchain();
    String getLastBlocksHash();
}
