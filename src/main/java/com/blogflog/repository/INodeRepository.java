package com.blogflog.repository;

import java.util.List;

public interface INodeRepository {
    void addNewNodes(List<String> newNodes);
    List<String> getAllNodes();
}
