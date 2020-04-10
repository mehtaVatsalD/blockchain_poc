package com.blogflog.service.imp;

import com.blogflog.exception.NoTransactionsToMineException;
import com.blogflog.models.Block;
import com.blogflog.models.Transaction;
import com.blogflog.repository.IBlockchainRepository;
import com.blogflog.repository.ITransactionRepository;
import com.blogflog.service.IBlockchainService;
import org.apache.commons.codec.binary.StringUtils;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.Collections;
import java.util.List;

@Service
public class BlockchainService implements IBlockchainService {

    @Autowired
    private ITransactionRepository transactionRepository;

    @Autowired
    private IBlockchainRepository blockchainRepository;

    @Value("${pow.hash.match.prefix}")
    private String leadingZerosPrefix;

    public Block mineBlock() throws UnsupportedEncodingException, NoTransactionsToMineException {
        List<Transaction> unconfirmedTransactions = transactionRepository.getUnconfirmedTransactions();
        if (!unconfirmedTransactions.isEmpty()){
            String previousHash = blockchainRepository.getLastBlocksHash();
            Block minedBlock = applyProofOfWork(unconfirmedTransactions, previousHash);
            blockchainRepository.saveMinedBlock(minedBlock);
            transactionRepository.clearUnconfirmedTransactions();
            return minedBlock;
        }
        else {
            throw new NoTransactionsToMineException("No transactions to include in block");
        }
    }

    public List<Block> getBlockchain(){
        return blockchainRepository.getBlockchain();
    }

    public boolean isBlockchainValid(){
        List<Block> blockchain = getBlockchain();
        String previousHash = blockchain.get(0).getBlockHash();
        for (Block block:blockchain.subList(1, blockchain.size())){
            String blockHash = block.getBlockHash();
            if (!previousHash.equals(blockHash)){
                return false;
            }
            previousHash = blockHash;
        }
        return true;
    }

    private Block applyProofOfWork(List<Transaction> unconfirmedTransactions, String previousHash) throws UnsupportedEncodingException {
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());
        String blockHash = "1111";
        String matchHash = "1111";
        Long nonce = 0L;
        int leadingZeros = leadingZerosPrefix.length();
        while (!leadingZerosPrefix.equals(matchHash)){
            timestamp = new Timestamp(System.currentTimeMillis());
            blockHash = new BigInteger(DigestUtils.sha256Hex(String.valueOf(nonce)+unconfirmedTransactions+previousHash+timestamp), 16).toString(2);
            nonce++;
            matchHash = blockHash.substring(1, leadingZeros + 1);
        }
        return new Block(previousHash, nonce, blockHash, unconfirmedTransactions, timestamp);
    }

    @PostConstruct
    public void minGenesisBlock() throws UnsupportedEncodingException {
        Transaction transaction = new Transaction("gogo", "gogo", 8L);
        Block genesisBlock = applyProofOfWork(Collections.singletonList(transaction), "");
        blockchainRepository.saveMinedBlock(genesisBlock);
    }

}
