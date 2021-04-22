import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/inventory/productcategory/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getProductCategoryList = (current, size, params) => {
  return request({
    url: '/api/inventory/productcategory/list',
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
    url: '/api/inventory/productcategory/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/inventory/productcategory/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/inventory/productcategory/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/inventory/productcategory/submit',
    method: 'post',
    data: row
  })
}

