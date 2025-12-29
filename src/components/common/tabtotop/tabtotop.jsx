import { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";

const TabToTop = () => {
  const [BacktoTop, setBacktopTop] = useState("");

  useEffect(() => {
    const handleScroll = () => {
        if (window.scrollY > 100) {
            setBacktopTop("d-flex");
        } else {
            setBacktopTop("");
        }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
        window.removeEventListener("scroll", handleScroll);
    };
}, []); 

  const screenup = () => {
    window.scrollTo({
      top: 10,
      behavior: "auto",
    });
  };
  return (
    <Fragment>
      <div id="back-to-top" onClick={screenup} className={`scrollToTop ${BacktoTop}`} >
        <Link to="#" className="arrow">
          <i className="las la-angle-double-up fs-20 text-fixed-white"></i>
        </Link>
      </div>
    </Fragment>
  );
};


export default TabToTop;
