import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/inventory/checknomber/page',
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
    url: '/api/inventory/checknomber/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/inventory/checknomber/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/inventory/checknomber/save',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/inventory/checknomber/update',
    method: 'post',
    data: row
  })
}

export const checkCount = (id, projectPresetId, checkDate) => {
  return request({
    url: '/api/inventory/checknomber/checkCount',
    method: 'post',
    params: {
      id,
      projectPresetId,
      checkDate
    }
  })
}

export const submit = (id) => {
  return request({
    url: '/api/inventory/checknomber/submit',
    method: 'post',
    params: {
      id
    }
  })
}

