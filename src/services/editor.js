/*
 * @Author: your name
 * @Date: 2020-02-16 16:01:29
 * @LastEditTime: 2020-02-16 16:01:56
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \ant-design\src\services\editor.js
 */
import request from '@/utils/request';

export async function querySubTypeList () {
  return request('http://localhost:3000/api/site/package/type/list');
}

export async function queryCommonList (subType) {
  return request(`http://localhost:3000/api/site/package/common?subType=${subType}`);
}

export async function queryPackageDetail (packageId) {
  return request(`http://localhost:3000/api/site/package/common/detail?pkgId=${packageId}`);
}
