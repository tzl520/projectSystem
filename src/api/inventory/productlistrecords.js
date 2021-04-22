import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/inventory/productlistrecords/page',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getOutDetailsList = () => {
  return request({
    url: '/api/inventory/productlistrecords/list',
    method: 'get'
  })
}

export const getDetail = (id) => {
  return request({
    url: '/api/inventory/productlistrecords/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/inventory/productlistrecords/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

//入库提交
export const add = (productListRecordsId) => {
  return request({
    url: '/api/inventory/productlistrecords/submit',
    method: 'post',
    params: {
      productListRecordsId,
    }
  })
}

//入库暂存时的提交
export const inSubmit = (row) => {
  return request({
    url: '/api/inventory/productlistrecords/inSubmit',
    method: 'post',
    data: row
  })
}

//出库提交
export const stockOutSubmit = (productListRecordsId) => {
  return request({
    url: '/api/inventory/productlistrecords/stockOutSubmit',
    method: 'post',
    params: {
      productListRecordsId,
    }
  })
}

//出库暂存时的提交
export const outSubmit = (row) => {
  return request({
    url: '/api/inventory/productlistrecords/outSubmit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/inventory/productlistrecords/update',
    method: 'post',
    data: row
  })
}

//入库暂存
export const save = (row) => {
  return request({
    url: '/api/inventory/productlistrecords/save',
    method: 'post',
    data: row
  })
}

//出库暂存
export const addStockOut = (row) => {
  return request({
    url: '/api/inventory/productlistrecords/addStockOut',
    method: 'post',
    data: row
  })
}
