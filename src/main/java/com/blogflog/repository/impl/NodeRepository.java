package com.blogflog.repository.impl;

import com.blogflog.repository.INodeRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class NodeRepository implements INodeRepository {

    private List<String> nodesConnected = new ArrayList<>();

    public void addNewNodes(List<String> newNodes){
        nodesConnected.addAll(newNodes);
    }

    public List<String> getAllNodes(){
        return new ArrayList<>(nodesConnected);
    }

}
