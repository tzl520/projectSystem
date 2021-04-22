import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectfinancialbidding/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getBinddingList = (projectId) => {
  return request({
    url: '/api/project-manager/projectfinancialbidding/list',
    method: 'get',
    params: {
      projectId
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/project-manager/projectfinancialbidding/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectfinancialbidding/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectfinancialbidding/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectfinancialbidding/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}
