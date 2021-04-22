import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectattach/pageOne',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/blade-resource/attach/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/blade-resource/attach/remove',
    method: 'post',
    params: {
      ids
    }
  })
}

export const add = (row) => {
  return request({
    url: '/blade-resource/attach/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/blade-resource/attach/submit',
    method: 'post',
    data: row
  })
}

export const getNameList = () => {
  return request({
    url: '/api/project-manager/project/common/userNameList',
    method: 'get',
  })
}

