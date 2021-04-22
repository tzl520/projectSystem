import request from '@/router/axios';

export const getNodeList = ( current,size,params,projectId,) => {
  return request({
    url: '/api/project-manager/projectplanningnode/page',
    method: 'get',
    params: {
      current,
      size,
      ...params,
      projectId,
    }
  })
}

export const getNodeSearch = (projectId, nodePersonLiable, nodeStatus, startTime, endTime) => {
  return request({
    url: '/api/project-manager/projectplanningnode/list',
    method: 'get',
    params: {
      projectId,
      nodePersonLiable,
      nodeStatus,
      startTime,
      endTime
    }
  })
}

export const getNodeGanttList = (projectId) => {
  return request({
    url: '/api/project-manager/projectplanningnode/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const getNodeDetail = (id) => {
  return request({
    url: '/api/project-manager/projectplanningnode/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectplanningnode/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectplanningnode/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectplanningnode/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}
