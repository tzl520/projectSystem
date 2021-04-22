import request from '@/router/axios';

export const getProductInventory = (productRecordsId) => {
  return request({
    url: '/api/inventory/productlist/page',
    method: 'get',
    params: {
      productRecordsId
    }
  })
}

export const getList = (current, size, params) => {
  return request({
    url: '/api/inventory/productlist/list',
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
    url: '/api/inventory/productlist/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const getProductListUpdate = (row) => {
  return request({
    url: '/api/inventory/productlist/update',
    method: 'post',
    data: row,
  })
}

export const getProductListRemove = (ids) => {
  return request({
    url: '/api/inventory/productlist/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

//新增
export const getProductListSave = (row) => {
  return request({
    url: '/api/inventory/productlist/save',
    method: 'post',
    data: row
  })
}
