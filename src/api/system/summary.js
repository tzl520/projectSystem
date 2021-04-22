import request from '@/router/axios';

export const getListDataScope = (current, size, params) => {
  return request({
    url: '/api/blade-system/data-scope/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
