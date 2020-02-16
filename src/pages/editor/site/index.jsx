import { Button, Card, Steps, Result, Descriptions } from 'antd';
import React from 'react';
import { connect } from 'dva';
import { GridContent } from '@ant-design/pro-layout';
import styles from './index.less';
import ResourceView from './components/ResourceView';

const Panel = props => {
  const { visible } = props;

  if (visible) {
    return (
      <ResourceView />
    );
  }

  return <div>111</div>;
};

const EditorView = props => {
  const { editor, dispatch } = props;

  return (
    <GridContent>
      <div className={styles.layout}>
        <div className={styles.body}>
          <div className={styles.panel}>
            <Panel visible={editor.panel.visible} />
          </div>
          <div className={styles.preview}>右侧</div>
        </div>
      </div>
    </GridContent>
  );
};

export default connect(({ editor }) => ({
  editor,
}))(EditorView);