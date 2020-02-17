import React, { useState, useEffect, Fragment } from 'react';
import { connect } from 'dva';
import { Input, InputNumber, Button, Switch, Breadcrumb, Collapse, Upload } from 'antd';
import { CloseOutlined, FileImageOutlined } from '@ant-design/icons';
import styles from './SchemaView.less';

const { Panel } = Collapse;
const { TextArea } = Input;

const SechmaItem = ({ name, value, properties }) => {
  let component = null;

  if (name === 'key') {
    return null;
  }

  if (properties.type === 'string') {
    component = <Input key="input" value={value} />;
  }

  if (properties.type === 'text') {
    component = <TextArea
      value={value}
      onChange={() => { }}
      autoSize={{ minRows: 3, maxRows: 5 }
      }
    />;
  }

  if (properties.type === 'richtext') {
    component = <TextArea
      value={value}
      onChange={() => { }}
      autoSize={{ minRows: 3, maxRows: 5 }
      }
    />;
  }

  if (properties.type === 'url') {
    component = <Input key="url" addonBefore="http://" value={value} />;
  }

  if (properties.type === 'boolean') {
    component = <Switch defaultChecked onChange={() => { }} />;
  }

  if (properties.type === 'number') {
    component = <InputNumber defaultValue={value} onChange={() => { }} />;
  }

  /* if (properties.type === 'array') {
    console.log(222222222222, value)
    component = <SechmaList model={value} />;
  } */

  if (properties.type === 'image') {
    let fileList = [
      {
        uid: value,
        name: value,
        status: 'done',
        url: value,
        thumbUrl: value,
      },
    ];

    const props = {
      action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
      listType: 'picture-card',
      accept: 'image/png, image/jpeg, image/gif',
      showUploadList: false,
      fileList,
      onChange: file => {
        fileList = [file];
      }
    };

    component = (
      <Upload {...props}>
        {value ? <img src={value} alt="avatar" style={{ width: '100%' }} /> : <Button icon={<FileImageOutlined />} />}
      </Upload>
    );
  }

  return (
    <div className={styles.sechmaPropItem}>
      <div className={styles.sechmaPropTitle}>
        {properties.description}
        {
          properties.meta &&
          properties.meta.description &&
          <span className={styles.sechmaPropMeta}>{properties.meta.description}</span>
        }
      </div>
      {component}
    </div>
  );
};

const SechmaList = ({ model }) => (
  <div className={styles.sechmaItemContainer}>
    <h4 className={styles.sechmaItemTitle}>{model.json.description}</h4>
    <Collapse
      accordion
      expandIcon={({ isActive }) => <span className={styles.sechmaCollapseIcon} rotate={isActive ? 90 : 0} />}
    >
      {
        model.data.map(dataItem => (
          <Panel header={<p>{dataItem.title || dataItem.text}</p>} key={dataItem.key}>
            {
              Object.entries(dataItem).map(([propIndex, propItem]) =>
                propIndex !== 'key' && <SechmaItem key={propIndex} name={propIndex} value={propItem} properties={model.json.properties[propIndex]} />
              )
            }
          </Panel>
        ))
      }
    </Collapse>
  </div>
);

const SechmaDetail = ({ model }) => {
  const components = [];

  if (model.papilioPackage) {
    Object.entries(model.papilioPackage.schemas).forEach(([key, sechma]) => {
      if (sechma.json.type === 'array') {
        components.push(
          <SechmaList model={sechma} key={sechma.key} />
        );
      }

      if (sechma.json.type === 'object') {
        components.push(
          <div className={styles.sechmaItemContainer} key={sechma.key}>
            <h4 className={styles.sechmaItemTitle}>{sechma.json.description}</h4>
            {
              Object.entries(sechma.data).map(([propIndex, propItem]) =>
                propIndex !== 'key' && <SechmaItem key={propIndex} name={propIndex} value={propItem} properties={sechma.json.properties[propIndex]} />
              )
            }
          </div>
        );
      }
    });
  }

  return components;
};

const SchemaView = ({ dispatch, packageId, packageDetail }) => {
  function handlePanelVisible (value) {
    if (dispatch) {
      dispatch({
        type: 'editor/changePanelVisible',
        payload: value,
      })
    }
  }

  // 初始化
  useEffect(() => {
    if (dispatch && packageId) {
      dispatch({
        type: 'editor/fetchPackageDetail',
        payload: packageId
      });
    }
  }, []);

  return (
    <div className={styles.sechmaEditor}>
      <div className={styles.sechmaEditorMain}>
        <div className={styles.schemaNavbar}>
          <Breadcrumb>
            <Breadcrumb.Item>{packageDetail.title}</Breadcrumb.Item>
          </Breadcrumb>
          <CloseOutlined
            key="Icon"
            style={{
              cursor: 'pointer',
            }}
            onClick={() => handlePanelVisible(false)} />
        </div>
        <div className={styles.schemaEditorScroll}>
          <div className={styles.schemaEditorContainer}>
            {packageDetail.papilioPackage !== undefined && <SechmaDetail model={packageDetail} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(({ editor }) => ({
  ...editor,
}))(SchemaView);
