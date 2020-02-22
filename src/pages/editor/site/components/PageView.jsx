import React, { useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Empty, Input, Button, Popover, Modal } from 'antd';
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
  const { onPageChange } = props;
  const zIndex = 9999;
  const inputRef = useRef(null);
  const { dispatch, pageList, siteId, pageId } = props;

  function fetchPageList(selectedIndex) {
    if (dispatch) {
      dispatch({
        type: 'editor/fetchPageList',
        payload: {
          siteId,
          selectedIndex,
        },
      });
    }
  }

  function handlePanelVisible(value) {
    if (dispatch) {
      dispatch({
        type: 'editor/changePanelVisible',
        payload: value,
      });
    }
  }

  function handleChangePageId(value) {
    if (dispatch) {
      dispatch({
        type: 'editor/changeNoticePageId',
        payload: value,
      });
    }
  }

  function stopPropagation(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }

  function handleUpdateHomePage(e, action, pid, value) {
    stopPropagation(e);

    if (dispatch && action === 'changeHomePage') {
      dispatch({
        type: 'editor/changeHomePage',
        payload: pid,
      });
    }

    if (dispatch && action === 'removeSitePage') {
      Modal.confirm({
        title: '删除页面',
        content: '是否确认删除该页面？',
        zIndex,
        onOk: async () => {
          dispatch({
            type: 'editor/removeSitePage',
            payload: pid,
          });

          return Promise.resolve();
        },
      });
    }

    if (dispatch && action === 'addSitePage') {
      dispatch({
        type: 'editor/addSitePage',
      });
    }

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
              type: 'editor/updatePageTitle',
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
              type: 'editor/updatePageName',
              payload: {
                pageId: pid,
                name: `${v}.html`,
              },
            });
          }
        },
      });
    }
  }

  // 初始化
  useEffect(() => {
    fetchPageList(0);
  }, []);

  useEffect(() => {
    if (pageId !== -1) {
      onPageChange();
    }
  }, [pageId]);

  return (
    <div className={styles.pageContainer}>
      <h3>
        页面列表
        <CloseOutlined
          key="Icon"
          style={{
            cursor: 'pointer',
          }}
          onClick={() => handlePanelVisible(false)}
        />
      </h3>
      <div className={styles.pageList}>
        {pageList.length === 0 ? (
          <Empty />
        ) : (
          pageList.map(item => (
            <div
              className={classNames(styles.pageItem, item.id === pageId && styles.pageItemActive)}
              key={item.id}
              onClick={() => handleChangePageId(item.id)}
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
                        handleUpdateHomePage(e, 'changePageTitle', item.id, item.title);
                      }}
                    >
                      <EditOutlined />
                      重命名
                    </li>
                    <li
                      onClick={e => {
                        handleUpdateHomePage(e, 'changePageName', item.id, item.name);
                      }}
                    >
                      <LinkOutlined />
                      修改路径
                    </li>
                    <li
                      className={classNames(
                        (pageList.length <= 1 || item.isHomePage) && styles.pageItemSettingDisabled,
                      )}
                      onClick={async e => {
                        if (pageList.length > 1) {
                          handleUpdateHomePage(e, 'changeHomePage', item.id);
                        }
                      }}
                    >
                      <HomeOutlined />
                      设为首页
                    </li>
                    <li
                      className={classNames(
                        (item.isHomePage || pageList.length <= 1) && styles.pageItemSettingDisabled,
                      )}
                      onClick={async e => {
                        if (pageList.length > 1) {
                          handleUpdateHomePage(e, 'removeSitePage', item.id);
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
        <Button block size="large" onClick={e => handleUpdateHomePage(e, 'addSitePage')}>
          + 添加页面
        </Button>
      </div>
    </div>
  );
};

export default connect(({ editor }) => ({
  ...editor,
}))(PageView);
