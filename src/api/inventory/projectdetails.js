import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/inventory/projectdetails/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getCheckList = (current, size, params) => {
  return request({
    url: '/api/inventory/check/list',
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
    url: '/api/inventory/projectdetails/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/inventory/projectdetails/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/inventory/projectdetails/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/inventory/projectdetails/submit',
    method: 'post',
    data: row
  })
}

//获取商品库的列表数据
export const getDetailsList = (current, size, params) => {
  return request({
    url: '/api/inventory/projectdetails/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

//获取商品库的列表系统数量
export const getStockNum= (projectPresetId,productId) => {
  return request({
    url: '/api/inventory/projectdetails/stockNum',
    method: 'get',
    params: {
      projectPresetId,
      productId
    }
  })
}

//获取商品库的列表商品名称
export const getAllocationList= (projectPresetId) => {
  return request({
    url: '/api/inventory/projectdetails/allocationList',
    method: 'get',
    params: {
      projectPresetId
    }
  })
}
