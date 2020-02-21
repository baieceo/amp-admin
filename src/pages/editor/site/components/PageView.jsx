import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Button, Popover, Modal } from 'antd';
import { CloseOutlined, SettingOutlined, HomeOutlined, DeleteOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import styles from './PageView.less';

const PageView = props => {
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
        type: 'editor/savePageId',
        payload: value,
      });
    }
  }

  function stopPropagation(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }

  function handleUpdateHomePage(e, action, pid) {
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
        zIndex: 9999,
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
  }

  // 初始化
  useEffect(() => {
    fetchPageList(0);
  }, []);

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
        {pageList.length > 0 &&
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
          ))}
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
