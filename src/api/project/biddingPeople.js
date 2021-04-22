import request from '@/router/axios';

export const getPeoplePage = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectfinancialbiddingpeople/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getPeopleList = (current, size, params) => {
  return request({
    url: '/api/project-manager/projectfinancialbiddingpeople/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const addPeople = (row) => {
  return request({
    url: '/api/project-manager/projectfinancialbiddingpeople/save',
    method: 'post',
    data: row
  })
}

export const updatePeople = (row) => {
  return request({
    url: '/api/project-manager/projectfinancialbiddingpeople/update',
    method: 'post',
    data: row
  })
}

export const removePeople = (ids) => {
  return request({
    url: '/api/project-manager/projectfinancialbiddingpeople/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}
