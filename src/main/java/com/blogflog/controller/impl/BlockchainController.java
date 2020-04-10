package com.blogflog.controller.impl;

import com.blogflog.controller.IBlockchainController;
import com.blogflog.exception.InvalidTransactionException;
import com.blogflog.exception.NoTransactionsToMineException;
import com.blogflog.models.Block;
import com.blogflog.models.Transaction;
import com.blogflog.service.IBlockchainService;
import com.blogflog.service.ITransactionManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.util.List;

@RestController
public class BlockchainController implements IBlockchainController {

    @Autowired
    private ITransactionManagementService transactionManagementService;

    @Autowired
    private IBlockchainService blockchainService;

    @RequestMapping(value = "/add_transaction", method = RequestMethod.POST)
    public Transaction addTransaction(@RequestBody Transaction transaction) throws InvalidTransactionException {
        transactionManagementService.addTransactionToPool(transaction);
        return transaction;
    }

    @RequestMapping(value = "/get_unconfirmed_transactions")
    public List<Transaction> getUnconfirmedTransactions(){
        return transactionManagementService.getUnconfirmedTransactions();
    }

    @RequestMapping(value = "/get_blockchain")
    public List<Block> getBlockchain(){
        return blockchainService.getBlockchain();
    }

    @RequestMapping(value = "/mine_block")
    public Block mineBlock() throws UnsupportedEncodingException, NoTransactionsToMineException {
        return blockchainService.mineBlock();
    }

    @RequestMapping(value = "/validate_blockchain")
    public boolean validateBlockchain(){
        return blockchainService.isBlockchainValid();
    }

}
