import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/workorder/hangup/page',
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
    url: '/api/workorder/hangup/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/workorder/hangup/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/workorder/hangup/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/workorder/hangup/submit',
    method: 'post',
    data: row
  })
}

export const hangSub = (id,hangUpReson,hangUpEndTime) => {
  return request({
    url: '/api/workorder/hangup/submitUp',
    method: 'post',
    params: {
      id,
      hangUpReson,
      hangUpEndTime
    }
  })
}
//催办的查看接口
export const urgingLook = (userId) => {
  return request({
    url: '/api/workorder/reminder/list',
    method: 'get',
    params: {
      userId
    }
  })
}
export const hangRecovery = (id,giveId) => {
  return request({
    url: '/api/workorder/hangup/recovery',
    method: 'post',
    params: {
      id,
      giveId
    }
  })
}
