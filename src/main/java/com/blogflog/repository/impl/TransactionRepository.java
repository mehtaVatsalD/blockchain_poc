package com.blogflog.repository.impl;

import com.blogflog.models.Transaction;
import com.blogflog.repository.ITransactionRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class TransactionRepository implements ITransactionRepository {

    private List<Transaction> unconfirmedTransactions = new ArrayList<>();

    public void saveTransaction(Transaction transaction) {
        unconfirmedTransactions.add(transaction);
    }

    public List<Transaction> getUnconfirmedTransactions(){
        return new ArrayList<>(unconfirmedTransactions);
    }

    public void clearUnconfirmedTransactions(){
        unconfirmedTransactions.clear();
    }

}
