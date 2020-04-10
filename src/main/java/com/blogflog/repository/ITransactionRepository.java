package com.blogflog.repository;

import com.blogflog.models.Transaction;

import java.util.List;

public interface ITransactionRepository {
    void saveTransaction(Transaction transaction);
    List<Transaction> getUnconfirmedTransactions();
    void clearUnconfirmedTransactions();
}
