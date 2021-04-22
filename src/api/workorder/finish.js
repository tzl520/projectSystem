import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/workorder/backe/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getDetailFinish = (giveId) => {
  return request({
    url: '/api/workorder/finish/view',
    method: 'get',
    params: {
      giveId
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/workorder/finish/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/workorder/finish/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/workorder/finish/submit',
    method: 'post',
    data: row
  })
}

export const finishSub= (row) => {
  return request({
    url: '/api/workorder/finish/finisubmit',
    method: 'post',
    data: row
  })
}
