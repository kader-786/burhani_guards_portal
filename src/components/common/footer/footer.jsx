import { Fragment } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <Fragment>
            <footer className="footer mt-auto py-3 bg-white text-center">
                <div className="container">
                    <span className="text-muted"> Copyright © <span id="year">{new Date().getFullYear()}&nbsp;</span> <Link
                        to="#" className="text-dark fw-semibold">SMB Solutions</Link>.
                       
                    </span>
                </div>
            </footer>
        </Fragment>
    );
};
export default Footer;
