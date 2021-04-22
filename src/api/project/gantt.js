import request from '@/router/axios';

export const getNodePersonLiableList = (projectId) => {
  return request({
    url: '/api/project-manager/projectcoordinationgroup/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const getNodeStatus = () => {
  return request({
    url: '/api/blade-system/dict-biz/dictionary?code=planning_node',
    method: 'get'
  })
}

