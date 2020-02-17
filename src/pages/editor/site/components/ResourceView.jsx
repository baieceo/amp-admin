import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Tabs, Card } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import styles from './ResourceView.less';

const { TabPane } = Tabs;

const ResourceView = ({ dispatch, panel, subTypeList, commonList }) => {
  const [subType, setSubType] = useState();

  function handlePanelVisible (value) {
    if (dispatch) {
      dispatch({
        type: 'editor/changePanelVisible',
        payload: value,
      })
    }
  }

  function handleChangeSchemaView (common) {
    if (dispatch) {
      dispatch({
        type: 'editor/changeSchemaView',
        payload: {
          packageId: common.packageId,
          view: 'schema'
        }
      });
    }
  }

  // 初始化
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'editor/fetchTypeList',
      });
    }
  }, []);

  // 设置默认 subType
  useEffect(() => {
    if (subTypeList.length) {
      setSubType(subTypeList[0].subType);
    }
  }, [subTypeList]);

  // 获取组件列表
  useEffect(() => {
    if (subType && dispatch) {
      dispatch({
        type: 'editor/fetchCommonList',
        payload: subType
      });
    }
  }, [subType]);

  return (
    <div className={styles.resource}>
      <h3>
        添加组件
        <CloseOutlined
          key="Icon"
          style={{
            cursor: 'pointer',
          }}
          onClick={() => handlePanelVisible(false)} />
      </h3>
      <div className={styles.resourceList}>
        <div className={styles.resourceTabs}>
          <Tabs
            size="small"
            tabPosition="left"
            style={{ height: panel.height }}
            onChange={name => setSubType(name)}
          >
            {
              subTypeList.length && subTypeList.map(typeItem => (
                <TabPane tab={<div style={{ textAlign: 'center' }}>{typeItem.title}</div>} key={typeItem.subType}>
                  <div style={{ height: panel.height }} className={styles.resourceItem}>
                    {
                      commonList.length > 0 && commonList.map(commonItem => (
                        <Card
                          hoverable
                          size="small"
                          className={styles.resourceCard}
                          title={commonItem.title}
                          key={commonItem.id}
                          onClick={() => handleChangeSchemaView(commonItem)}
                        >
                          <img alt={commonItem.title} src={commonItem.snapshot} />
                        </Card>
                      ))
                    }
                  </div>
                </TabPane>
              ))
            }
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default connect(({ editor }) => ({
  ...editor,
}))(ResourceView);
