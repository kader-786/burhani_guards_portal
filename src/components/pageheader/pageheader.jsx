import { Fragment,  } from 'react';
import { Breadcrumb } from "react-bootstrap";
import { Link, useLocation } from 'react-router-dom';
export default function Pageheader() {
    const { pathname } = useLocation();
    const Currentpath = pathname;
    

    const commonPath = "/azira-js/preview/";
    const trimmedPathname = pathname.startsWith(commonPath) ? pathname.slice(commonPath.length) : pathname;
    const locationArray = trimmedPathname.split("/").filter(Boolean);
    const componentNames = locationArray.map((item) => item.charAt(0).toUpperCase() + item.slice(1));
    return (
        <Fragment>
            <div className="d-sm-flex d-block align-items-center justify-content-between  ">
               
                {Currentpath.includes("/dashboard")  ? (
                 <div>
                 <h4 className="fw-medium mb-2">Hi, Welcome back!</h4>
                 <div className="ms-sm-1 ms-0">
                     <nav>
                         <Breadcrumb as='ol' className="breadcrumb mb-0">
                             <Breadcrumb.Item as='li' className="breadcrumb-item">Dashboard</Breadcrumb.Item>
                             <Breadcrumb.Item as='li' className="breadcrumb-item active fw-normal" aria-current="page">Hi, Welcome back!</Breadcrumb.Item>
                         </Breadcrumb>
                     </nav>
                 </div>
                 </div> 
                ) : (
                    <div className='single-page-header'>
                    <h4 className="fw-medium mb-2">{componentNames[componentNames.length - 1]}</h4>
                    <div className="ms-sm-1 ms-0">
                        <nav>
                            <Breadcrumb as='ol' className="breadcrumb mb-0">
                                {componentNames.map((item, index) => (
                                    <Breadcrumb.Item as='li'
                                        key={index}
                                        active={index === componentNames.length - 1}
                                        className={`${index === componentNames.length - 1 ? "" : ""}`}
                                        to="#"
                                    >
                                        {index === 0 ? item : item.toLowerCase()}
                                    </Breadcrumb.Item>
                                ))}
                            </Breadcrumb>
                        </nav>

                    </div>
                </div>
                )}
                
            </div>

        </Fragment>
    );
}

