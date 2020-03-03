import React, { useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Spin, Empty, Input, Button, Popover, Modal } from 'antd';
import {
  CloseOutlined,
  EditOutlined,
  LinkOutlined,
  SettingOutlined,
  HomeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import styles from './PageView.less';

const PageView = props => {
  const zIndex = 9999;
  const inputRef = useRef(null);
  const { dispatch, siteId, siteData, pageId } = props;
  const { page: pageList } = siteData;

  // 获取站点数据
  async function fetchSiteData() {
    return dispatch({
      type: 'editor/fetchSiteData',
      payload: siteId,
    });
  }

  // 改变页面 ID
  function changePageId(value) {
    if (dispatch) {
      dispatch({
        type: 'editor/changePageId',
        payload: value,
      });
    }
  }

  // 改变面板是否可见
  function changePanelVisible(value) {
    if (dispatch) {
      dispatch({
        type: 'editor/savePanelVisible',
        payload: value,
      });
    }
  }

  // 渲染页面列表
  function renderPageList() {
    if (!pageList) {
      return (
        <div className={styles.pageSpin}>
          <Spin />
        </div>
      );
    }

    return (
      <>
        <div className={styles.pageList}>
          {pageList.length === 0 ? (
            <Empty />
          ) : (
            pageList.map(item => (
              <div
                className={classNames(styles.pageItem, item.id === pageId && styles.pageItemActive)}
                key={item.id}
                onClick={() => changePageId(item.id)}
              >
                <div className={styles.pageItemDrag} />
                <div className={styles.pageItemTitle}>
                  <h4>
                    <span>{item.title}</span>
                    {item.isHomePage && <em>首页</em>}
                  </h4>
                  <span>{item.name}</span>
                </div>
                <Popover
                  placement="rightTop"
                  trigger="hover"
                  content={
                    <ul className={styles.pageItemSettingPopover}>
                      <li
                        onClick={e => {
                          updateHomePage(e, 'changePageTitle', item.id, item.title);
                        }}
                      >
                        <EditOutlined />
                        重命名
                      </li>
                      <li
                        onClick={e => {
                          updateHomePage(e, 'changePageName', item.id, item.name);
                        }}
                      >
                        <LinkOutlined />
                        修改路径
                      </li>
                      <li
                        className={classNames(
                          (pageList.length <= 1 || item.isHomePage) &&
                            styles.pageItemSettingDisabled,
                        )}
                        onClick={async e => {
                          if (pageList.length > 1 && !item.isHomePage) {
                            updateHomePage(e, 'changeHomePage', item.id);
                          }
                        }}
                      >
                        <HomeOutlined />
                        设为首页
                      </li>
                      <li
                        className={classNames(
                          (item.isHomePage || pageList.length <= 1) &&
                            styles.pageItemSettingDisabled,
                        )}
                        onClick={async e => {
                          if (pageList.length > 1 && !item.isHomePage) {
                            updateHomePage(e, 'removePage', item.id);
                          }
                        }}
                      >
                        <DeleteOutlined />
                        删除
                      </li>
                    </ul>
                  }
                >
                  <span className={styles.pageItemSetting} onClick={e => stopPropagation(e)}>
                    <SettingOutlined />
                  </span>
                </Popover>
              </div>
            ))
          )}
        </div>
        <div className={styles.pageAdd}>
          <Button block size="large" onClick={e => updateHomePage(e, 'addPage')}>
            + 添加页面
          </Button>
        </div>
      </>
    );
  }

  function stopPropagation(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }

  // 更新页面
  function updateHomePage(e, action, pid, value) {
    stopPropagation(e);

    // 修改首页
    if (dispatch && action === 'changeHomePage') {
      dispatch({
        type: 'editor/changeHomePage',
        payload: pid,
      });
    }

    // 重命名页面
    if (dispatch && action === 'changePageTitle') {
      Modal.confirm({
        zIndex,
        title: '重命名页面',
        content: (
          <>
            <h4>页面名称</h4>
            <Input placeholder="输入页面标题" defaultValue={value} ref={inputRef} />
          </>
        ),
        okText: '修改',
        onOk() {
          const title = inputRef.current.state.value;

          if (title) {
            dispatch({
              type: 'editor/changePageTitle',
              payload: {
                pageId: pid,
                title,
              },
            });
          }

          return Promise.resolve();
        },
      });
    }

    // 修改页面路径
    if (dispatch && action === 'changePageName') {
      Modal.confirm({
        zIndex,
        title: '修改页面路径',
        content: (
          <>
            <h4>页面路径</h4>
            <Input
              placeholder="输入页面路径"
              defaultValue={value.replace(/\.html$/, '')}
              ref={inputRef}
              addonAfter=".html"
            />
          </>
        ),
        okText: '修改',
        onOk() {
          const v = inputRef.current.state.value;

          if (v) {
            dispatch({
              type: 'editor/changePageName',
              payload: {
                pageId: pid,
                name: `${v}.html`,
              },
            });
          }
        },
      });
    }

    // 删除页面
    if (dispatch && action === 'removePage') {
      Modal.confirm({
        title: '删除页面',
        content: '是否确认删除该页面？',
        zIndex,
        onOk: async () => {
          dispatch({
            type: 'editor/removePage',
            payload: pid,
          });

          return Promise.resolve();
        },
      });
    }

    // 新增页面
    if (dispatch && action === 'addPage') {
      dispatch({
        type: 'editor/addPage',
      });
    }
  }

  // 初始化
  useEffect(() => {
    async function fetchData() {
      const { page = [] } = await fetchSiteData();

      if (page.length && pageId === Infinity) {
        dispatch({
          type: 'editor/changePageId',
          payload: page[0].id,
        });
      }
    }

    fetchData();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <h3>
        页面列表
        <CloseOutlined
          style={{
            cursor: 'pointer',
          }}
          onClick={() => changePanelVisible(false)}
        />
      </h3>

      {renderPageList()}
    </div>
  );
};

export default connect(({ editor }) => ({
  ...editor,
}))(PageView);
