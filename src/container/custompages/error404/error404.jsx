import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

const Error404 = () => {
  return (
    <Fragment>
      {/* <div className="page"> */}
        {/* <!-- Main-error-wrapper --> */}
        <div className="main-error-wrapper  page page-h ">
          <h1 className="">404<span className="fs-20">error</span></h1>
          <h2>Oopps. The page you were looking for doesn't exist.</h2>
          <h6>You may have mistyped the address or the page may have moved.</h6>
          <Link className="btn btn-outline-primary" to={`${import.meta.env.BASE_URL}dashboard`}>Back to Home</Link>
        </div>
        {/* <!-- /Main-error-wrapper --> */}
      {/* </div> */}
    </Fragment>
  );
};

export default Error404;
