package com.blogflog.repository.impl;

import com.blogflog.models.Block;
import com.blogflog.repository.IBlockchainRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class BlockchainRepository implements IBlockchainRepository {

    private List<Block> theBlockchain = new ArrayList<>();

    public void saveMinedBlock(Block block){
        theBlockchain.add(block);
    }

    public List<Block> getBlockchain(){
        return new ArrayList<>(theBlockchain);
    }

    public String getLastBlocksHash(){
        return theBlockchain.get(theBlockchain.size()-1).getBlockHash();
    }

    public int getBlockchainLength(){
        return theBlockchain.size();
    }

    public void updateBlockchain(List<Block> newBlockChain){
        this.theBlockchain = new ArrayList<>(newBlockChain);
    }

}
