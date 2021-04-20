package com.blogflog.service.imp;

import com.blogflog.models.Block;
import com.blogflog.repository.IBlockchainRepository;
import com.blogflog.repository.INodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ConsensusScheduler {

    @Autowired
    private INodeRepository nodeRepository;

    @Autowired
    private IBlockchainRepository blockchainRepository;

    @Scheduled(fixedDelayString = "${consensus.scheduling}")
    public void bringConsensus(){
        System.out.println("starting scheduled...");
        List<String> nodes = nodeRepository.getAllNodes();
        RestTemplate restTemplate = new RestTemplate();
        //assuming chain in my node is largest
        int maxLengthOfBlockchainInNetwork = blockchainRepository.getBlockchainLength();
        List<Block> newBlockchain = new ArrayList<>();
        for (String node:nodes){
            Block[] response = restTemplate.getForObject("http://"+node+"/get_blockchain", Block[].class);
            if (response!=null){
                int chainLength = response.length ;
                if(maxLengthOfBlockchainInNetwork < chainLength){
                    maxLengthOfBlockchainInNetwork = chainLength;
                    newBlockchain.clear();
                    Collections.addAll(newBlockchain, response);
                }
            }
        }
        if (!newBlockchain.isEmpty()){
            System.out.println("replacing chain...");
            blockchainRepository.updateBlockchain(newBlockchain);
        }
    }

}
