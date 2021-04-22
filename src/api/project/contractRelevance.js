import request from '@/router/axios';

export const getContractRelevancePage = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectcontractrelevance/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getContractRelevanceList = (projectId) => {
  return request({
    url: '/api/project-manager/projectcontractrelevance/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const getContractRelevanceDetail = (id) => {
  return request({
    url: '/api/project-manager/projectcontractrelevance/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const contractRelevanceAdd = (row) => {
  return request({
    url: '/api/project-manager/projectcontractrelevance/save',
    method: 'post',
    data: row
  })
}

export const contractRelevanceUpdate = (row) => {
  return request({
    url: '/api/project-manager/projectcontractrelevance/update',
    method: 'post',
    data: row
  })
}

export const contractRelevanceRemove = (ids) => {
  return request({
    url: '/api/project-manager/projectcontractrelevance/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}
