package com.blogflog.service.imp;

import com.blogflog.repository.INodeRepository;
import com.blogflog.service.INodeManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NodeManagementService implements INodeManagementService {

    @Autowired
    private INodeRepository nodeRepository;

    public void registerNodes(List<String> newNodes){
        nodeRepository.addNewNodes(newNodes);
    }

    public List<String> getRegisteredNodes(){
        return nodeRepository.getAllNodes();
    }

}
