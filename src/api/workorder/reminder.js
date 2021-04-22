import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/workorder/reminder/list',
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
    url: '/api/workorder/reminder/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/workorder/reminder/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/workorder/reminder/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/workorder/reminder/submit',
    method: 'post',
    data: row
  })
}

export const urgingSub = (id, reminderContent, reminderWay) => {
  return request({
    url: '/api/workorder/reminder/submit1',
    method: 'post',
    params: {
      id,
      reminderContent,
      reminderWay
    }
  })
}
