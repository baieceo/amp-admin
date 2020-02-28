/*
 * @Author: your name
 * @Date: 2020-02-16 14:07:47
 * @LastEditTime: 2020-02-28 07:29:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \ant-design\src\models\editor.js
 */
import {
  querySubTypeList,
  queryCommonList,
  queryPackageDetail,
  queryPageList,
  updateSitePage,
  updatePageComponent,
  fetchRenderHtml,
} from '@/services/editor';
import maxBy from 'lodash/maxBy';

const EditorModel = {
  namespace: 'editor',
  state: {
    // view: 'schema',  // resource/schema/page
    // packageId: 'PK154028370486768500440581916343',
    // view: 'resource',
    view: 'page',
    packageId: '',
    packageDetail: {},
    renderHost: 'http://render.baie.net.cn',
    html: '',
    panel: {
      visible: true,
      height: document.body.clientHeight - 200,
    },
    sitePage: {},
    subTypeList: [],
    commonList: [],
    componentList: [],
    siteId: -1,
    pageId: -1,
    pageName: '',
    pageUrl: '',
    pageList: [],
    pageData: {},
    window: {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    },
  },
  effects: {
    *fetchTypeList(_, { call, put }) {
      const response = yield call(querySubTypeList);
      yield put({
        type: 'saveSubTypeList',
        payload: response,
      });
    },

    *fetchCommonList({ payload }, { call, put }) {
      const response = yield call(queryCommonList, payload);
      yield put({
        type: 'saveCommonList',
        payload: response,
      });
    },

    *fetchPackageDetail({ payload }, { call, put }) {
      const response = yield call(queryPackageDetail, payload);

      if (response && response.papilioPackage && response.papilioPackage.schemas) {
        const { schemas } = response.papilioPackage;

        Object.entries(schemas).forEach(([key, item]) => {
          schemas[key].key = item.name + Math.random();

          if (schemas[key].json.type === 'array') {
            schemas[key].data.forEach((i, n) => {
              schemas[key].data[n].key = n;
            });
          }
        });
      }

      yield put({
        type: 'savePackageDetail',
        payload: response,
      });
    },

    *fetchPageList({ payload }, { call, put }) {
      const response = yield call(queryPageList, payload.siteId);
      yield put({
        type: 'savePageList',
        payload: response,
      });

      if (
        payload.selectedIndex !== undefined &&
        response.page &&
        response.page[payload.selectedIndex]
      ) {
        const pageData = response.page[payload.selectedIndex];
        const pageId = pageData.id;

        yield put({
          type: 'savePageId',
          payload: pageId,
        });

        yield put({
          type: 'savePageData',
          payload: pageData,
        });
      }
    },

    *changeHomePage({ payload }, { put, call, select }) {
      const pageData = yield select(state => ({
        siteId: state.editor.siteId,
        data: {
          page: state.editor.pageList.map(item => {
            const page = { ...item };

            if (page.id === payload) {
              page.isHomePage = true;
            } else {
              page.isHomePage = false;
            }

            return page;
          }),
        },
      }));

      const response = yield call(updateSitePage, pageData);

      yield put({
        type: 'savePageList',
        payload: response,
      });
    },

    *removeSitePage({ payload }, { put, call, select }) {
      const pageData = yield select(state => ({
        siteId: state.editor.siteId,
        data: {
          page: state.editor.pageList.map(item => {
            const page = { ...item };

            if (page.id === payload) {
              page.isDeleted = true;
            }

            return page;
          }),
        },
      }));

      const response = yield call(updateSitePage, pageData);

      yield put({
        type: 'savePageList',
        payload: response,
      });
    },

    *updatePageTitle({ payload }, { put, call, select }) {
      const pageData = yield select(state => ({
        siteId: state.editor.siteId,
        data: {
          page: state.editor.pageList.map(item => {
            const page = { ...item };

            if (page.id === payload.pageId) {
              page.title = payload.title;
            }

            return page;
          }),
        },
      }));

      const response = yield call(updateSitePage, pageData);

      yield put({
        type: 'savePageList',
        payload: response,
      });
    },

    *updatePageName({ payload }, { put, call, select }) {
      const pageData = yield select(state => ({
        siteId: state.editor.siteId,
        data: {
          page: state.editor.pageList.map(item => {
            const page = { ...item };

            if (page.id === payload.pageId) {
              page.name = payload.name;
              page.url = `${state.editor.renderHost}/${state.editor.siteId}/${payload.name}`;
            }

            return page;
          }),
        },
      }));

      const response = yield call(updateSitePage, pageData);

      yield put({
        type: 'savePageList',
        payload: response,
      });
    },

    *addSitePage(_, { put, call, select }) {
      const pageData = yield select(state => {
        const model = {
          siteId: state.editor.siteId,
          data: {
            page: state.editor.pageList,
          },
        };

        const target = maxBy(state.editor.pageList, o => o.pageOrder);
        const pageOrder = target ? target.pageOrder : 0;
        const name = `${+new Date()}.html`;

        model.data.page.push({
          componentList: [],
          isHomePage: false,
          meta: {},
          name,
          pageOrder: pageOrder + 1,
          schemaData: [],
          siteId: state.editor.siteId,
          snapshot: '',
          templatePath: 'pages/detail/index.html',
          url: `${state.editor.renderHost}/${state.editor.siteId}/${name}`,
          title: '新建页面',
        });

        return model;
      });

      const response = yield call(updateSitePage, pageData);

      yield put({
        type: 'savePageList',
        payload: response,
      });
    },

    *changeNoticePageId({ payload }, { put, select }) {
      yield put({
        type: 'savePageId',
        payload,
      });

      const pageData = yield select(state =>
        state.editor.pageList.find(item => item.id === payload),
      );

      yield put({
        type: 'savePageData',
        payload: pageData,
      });
    },

    *changeNoticeSiteId({ payload }, { put }) {
      yield put({
        type: 'saveSiteId',
        payload,
      });
    },

    *fetchRenderHtml(_, { call, put, select }) {
      const params = yield select(state => ({
        siteId: state.editor.siteId,
        pageId: state.editor.pageId,
        componentList: state.editor.componentList,
        data: [],
      }));

      console.log('fetchRenderHtml: ', params);

      const resource = yield call(fetchRenderHtml, params);

      yield put({
        type: 'saveHtml',
        payload: resource.html,
      });
    },

    *addComment({ payload }, { call, put, select }) {
      const componentList = yield select(state => state.editor.componentList);
      const { pageId, siteId } = yield select(state => state.editor);

      componentList.push(payload);

      yield put({
        type: 'saveComponentList',
        payload: componentList,
      });

      const params = {
        pageId,
        siteId,
        componentList,
        data: [],
      };

      yield call(updatePageComponent, params);
    },
  },
  reducers: {
    changePanelVisible(state, { payload: value }) {
      return {
        ...state,
        panel: {
          ...state.panel,
          visible: value,
        },
      };
    },

    saveSubTypeList(state, action) {
      return { ...state, subTypeList: action.payload || [] };
    },

    changeWindowResize(state, action) {
      return {
        ...state,
        window: { ...state.window, ...action.payload },
        panel: { ...state.panel, height: action.payload.height - 200 },
      };
    },

    saveCommonList(state, action) {
      return { ...state, commonList: action.payload || [] };
    },

    changeSchemaView(state, action) {
      return { ...state, ...action.payload };
    },

    savePackageDetail(state, action) {
      return { ...state, packageDetail: action.payload || {} };
    },

    savePageList(state, action) {
      return { ...state, sitePage: action.payload || {}, pageList: action.payload.page || [] };
    },

    savePageId(state, action) {
      return { ...state, pageId: action.payload };
    },

    saveSiteId(state, action) {
      return { ...state, siteId: action.payload };
    },

    savePageData(state, action) {
      return { ...state, pageData: action.payload };
    },

    saveComponentList(state, action) {
      return { ...state, componentList: action.payload || [] };
    },

    saveHtml(state, action) {
      return { ...state, html: action.payload || '' };
    },

    saveCurrentUser(state, action) {
      return { ...state, currentUser: action.payload || {} };
    },

    changeNotifyCount(
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
