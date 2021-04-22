import request from '@/router/axios';

export const getAllUserList = () => {
  return request({
    url: '/api/project-manager/project/common/getUserList',
    method: 'get'
  })
}
export const getAllUserNameList = () => {
  return request({
    url: '/api/project-manager/project/common/userNameList',
    method: 'get'
  })
}
