import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectattach/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getProjectAttachList = (params) => {
  return request({
    url: '/api/project-manager/projectattach/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/project-manager/projectattach/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (attachId) => {
  return request({
    url: '/api/project-manager/projectattach/remove',
    method: 'post',
    params: {
      attachId
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/project-manager/projectattach/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/project-manager/projectattach/submit',
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

export const authorize = (id,permissionsPerson,accessPermissions) => {
  return request({
    url: '/api/project-manager/projectattach/authorize',
    method: 'post',
    params: {
      id,
      permissionsPerson,
      accessPermissions
    }
  })
}

export const down = (id) => {
  return request({
    url: '/api/project-manager/projectattach/download',
    method: 'get',
    params: {
      id,
    }
  })
}

export const attachScope = () => {
  return request({
    url: '/api/blade-system/dict-biz/dictionary?code=attach_scope',
    method: 'get',
  })
}
