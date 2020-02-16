/*
 * @Author: your name
 * @Date: 2020-02-16 14:07:47
 * @LastEditTime: 2020-02-16 14:08:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \ant-design\src\models\editor.js
 */
import { queryCurrent, query as queryUsers } from '@/services/user';
import { querySubTypeList, queryCommonList } from '@/services/editor';

const EditorModel = {
  namespace: 'editor',
  state: {
    view: 'resource',  // resource/editor
    panel: {
      visible: true,
      height: document.body.clientHeight - 200
    },
    subTypeList: [],
    commonList: [],
    window: {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    }
  },
  effects: {
    *fetch (_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *fetchTypeList (_, { call, put }) {
      const response = yield call(querySubTypeList);
      yield put({
        type: 'saveSubTypeList',
        payload: response
      });
    },

    *fetchCommonList ({ payload }, { call, put }) {
      const response = yield call(queryCommonList, payload);
      yield put({
        type: 'saveCommonList',
        payload: response
      });
    },

    *fetchCurrent (_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
  },
  reducers: {
    changePanelVisible (state, { payload: value }) {
      return {
        ...state,
        panel: {
          ...state.panel,
          visible: value
        }
      };
    },
    saveSubTypeList (state, action) {
      return { ...state, subTypeList: action.payload || [] };
    },

    changeWindowResize (state, action) {
      return {
        ...state,
        window: { ...state.window, ...action.payload },
        panel: { ...state.panel, height: action.payload.height - 200 }
      };
    },

    saveCommonList (state, action) {
      return { ...state, commonList: action.payload || [] };
    },

    saveCurrentUser (state, action) {
      return { ...state, currentUser: action.payload || {} };
    },

    changeNotifyCount (
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
export default EditorModel;
