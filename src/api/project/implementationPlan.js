import request from '@/router/axios';

export const getImplementationPlanList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectimplementdevice/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectimplementdevice/save',
    method: 'post',
    data: row
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/project-manager/projectimplementdevice/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectimplementdevice/update',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/project-manager/projectimplementdevice/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}



