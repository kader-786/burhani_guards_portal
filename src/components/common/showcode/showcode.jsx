import { useState } from 'react';
import {  Card } from 'react-bootstrap';
import DOMPurify from "dompurify";

const ShowCode = ({ title, reactCode, dataCode, customCardClass = '', customCardHeaderClass = '', customCardBodyClass = '', customCardFooterClass = '', children}) => {
  
  const sanitizedTitle = DOMPurify.sanitize(title);

  const [showCode, setShowCode] = useState(false);
  const [activeTab, setActiveTab] = useState('react');

  const toggleCode = () => {
    setShowCode(!showCode);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <Card className={`custom-card ${customCardClass}`}>
      <Card.Header className={`d-flex justify-content-between ${customCardHeaderClass}`}>
       <Card.Title dangerouslySetInnerHTML={{ __html: sanitizedTitle }} />
        <div className="prism-toggle">
          <button className="btn btn-sm btn-primary-light" onClick={toggleCode}>
            {showCode ? 'Hide Code' : 'Show Code'}
            <i className={`${showCode ? 'ri-code-s-slash-line' : 'ri-code-line'} ms-2 align-middle inline-block mx-1`} />
          </button>
        </div>
      </Card.Header>
      {showCode ? (
        <Card.Footer className={`border-top-0 ${customCardFooterClass}`}>
          <div className="tabs">
            <button
              className={`tab-button text-default ${activeTab === 'react' ? 'active' : ''}`}
              onClick={() => handleTabChange('react')}
            >
              React
            </button>
            {dataCode && (
              <button
                className={`tab-button text-default ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => handleTabChange('data')}
              >
                Data
              </button>
            )}
          </div>
          <pre className="language-html">
            <code className="language-html">
              {activeTab === 'react' ? reactCode : dataCode}
            </code>
          </pre>
        </Card.Footer>
      ) : (
        <Card.Body className={` ${customCardBodyClass}`}>
          {children}
        </Card.Body>
      )}
    </Card>
  );
};

export default ShowCode;
