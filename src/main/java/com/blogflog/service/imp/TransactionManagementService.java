package com.blogflog.service.imp;

import com.blogflog.exception.InvalidTransactionException;
import com.blogflog.models.Transaction;
import com.blogflog.repository.ITransactionRepository;
import com.blogflog.service.ITransactionManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionManagementService implements ITransactionManagementService {

    @Autowired
    private ITransactionRepository transactionRepository;

    public void addTransactionToPool(Transaction transaction) throws InvalidTransactionException {
        if (transaction.getAmount() == null || transaction.getAmount() == 0L || transaction.getReceiver() == null || "".equals(transaction.getReceiver()) || transaction.getSender() == null || "".equals(transaction.getSender())){
            throw new InvalidTransactionException("Transaction is not valid. Make sure sender, receiver and amount ar neither null nor empty");
        }
        transactionRepository.saveTransaction(transaction);
    }

    public List<Transaction> getUnconfirmedTransactions(){
        return transactionRepository.getUnconfirmedTransactions();
    }

}
