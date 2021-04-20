package com.blogflog.service;

import com.blogflog.exception.InvalidTransactionException;
import com.blogflog.models.Transaction;

import java.util.List;

public interface ITransactionManagementService {
    void addTransactionToPool(Transaction transaction) throws InvalidTransactionException;
    List<Transaction> getUnconfirmedTransactions();
}
