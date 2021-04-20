package com.blogflog.service;

import java.util.List;

public interface INodeManagementService {
    void registerNodes(List<String> newNodes);
    List<String> getRegisteredNodes();
}
