package com.blogflog.models;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

public class Block {

    private String previousBlockHash;
    private Long goldenNonce;
    private String blockHash;
    private List<Transaction> transactions;
    private Timestamp timestamp;

    public Block() {
        super();
    }

    public Block(String previousBlockHash, Long goldenNonce, String blockHash, List<Transaction> transactions, Timestamp timestamp) {
        this.previousBlockHash = previousBlockHash;
        this.goldenNonce = goldenNonce;
        this.blockHash = blockHash;
        this.transactions = new ArrayList<>(transactions);
        this.timestamp = timestamp;
    }

    public String getPreviousBlockHash() {
        return previousBlockHash;
    }

    public Long getGoldenNonce() {
        return goldenNonce;
    }

    public String getBlockHash() {
        return blockHash;
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }
}
