package com.blogflog.models;

public class Transaction {

    private String sender;
    private String receiver;
    private Long amount;

    public Transaction(String sender, String receiver, Long amount) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
    }

    public String getSender() {
        return sender;
    }

    public String getReceiver() {
        return receiver;
    }

    public Long getAmount() {
        return amount;
    }

    @Override
    public String toString() {
        return "{" +
                "sender='" + sender + '\'' +
                ", receiver='" + receiver + '\'' +
                ", amount=" + amount +
                '}';
    }

}
