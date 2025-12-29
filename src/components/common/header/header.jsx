import { Fragment, useEffect, useRef, useState } from 'react';
import { Badge, Dropdown, Form, ListGroup, Modal, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { MenuItems } from '../sidebar/sidemenu/sidemenu';
import { connect } from "react-redux";
import { ThemeChanger } from "../../../redux/action";
import {clearSession} from "../../../firebase/authGuard";
import personLogo from "../../../assets/images/avatar1.png"
import bgmi from "../../../assets/images/burhaniguards_logo.png"




import logo1 from '../../../assets/images/brand-logos/desktop-logo.png';
import logo2 from '../../../assets/images/brand-logos/toggle-logo.png'
import logo3 from '../../../assets/images/brand-logos/desktop-dark.png'
import logo4 from '../../../assets/images/brand-logos/toggle-dark.png'
import product1 from "../../../assets/images/ecommerce/cart/1.png";
import product3 from "../../../assets/images/ecommerce/cart/2.png";
import product5 from "../../../assets/images/ecommerce/cart/3.png";
import product4 from "../../../assets/images/ecommerce/cart/4.png";
import product6 from "../../../assets/images/ecommerce/cart/5.png";
import face6 from "../../../../src/assets/images/faces/6.jpg";
import store from '../../../redux/store';

const Header = ({ local_varaiable, ThemeChanger }) => {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [its_id, setits_id] = useState("");

   useEffect(() => {
    const name = sessionStorage.getItem("full_name");
    const its_id = sessionStorage.getItem("its_id")
     if (name) {
      setFullName(name);
      setits_id(its_id)
     }
    }, []);

    const handleLogout = () => {
         clearSession();          
         window.location.href = `${import.meta.env.BASE_URL}firebase/login`;
    };

    // ///****fullscreeen */
    // const [fullScreen, setFullScreen] = useState(false);

    // const toggleFullScreen = () => {
    //     const elem = document.documentElement;

    //     if (!document.fullscreenElement) {
    //         elem.requestFullscreen().then(() => setFullScreen(true));
    //     } else {
    //         document.exitFullscreen().then(() => setFullScreen(false));
    //     }
    // };




    //Search functionality
    const [show1, setShow1] = useState(false);
    const [showa, setShowa] = useState(false);
    const [InputValue, setInputValue] = useState("");
    const [show2, setShow2] = useState(false);
    const [searchcolor, setsearchcolor] = useState("text-dark");
    const [searchval, setsearchval] = useState("Type something");
    const [NavData, setNavData] = useState([]);

    const searchResultRef = useRef(null);

    const myfunction = (inputValue) => {
        if (searchResultRef.current) {
            searchResultRef.current.classList.remove("d-none");
        }

        const i = [];
        const allElement2 = [];
        MenuItems.forEach((mainLevel) => {
            if (mainLevel.children) {
                setShowa(true);
                mainLevel.children.forEach((subLevel) => {
                    i.push(subLevel);
                    if (subLevel.children) {
                        subLevel.children.forEach((subLevel1) => {
                            i.push(subLevel1);
                            if (subLevel1.children) {
                                subLevel1.children.forEach((subLevel2) => {
                                    i.push(subLevel2);
                                });
                            }
                        });
                    }
                });
            }
        });

        for (const allElement of i) {
            if (allElement.title.toLowerCase().includes(inputValue.toLowerCase())) {
                if (allElement.title.toLowerCase().startsWith(inputValue.toLowerCase())) {
                    setShow2(true);

                    // Check if the element has a path and doesn't already exist in allElement2 before pushing
                    if (allElement.path && !allElement2.some((el) => el.title === allElement.title)) {
                        allElement2.push(allElement);
                    }
                }
            }
        }

        if (!allElement2.length || inputValue === "") {
            if (inputValue === "") {
                setShow2(false);
                setsearchval("Type something");
                setsearchcolor("text-dark");
            }
            if (!allElement2.length) {
                setShow2(false);
                setsearchcolor("text-danger");
                setsearchval("There is no component with this name");
            }
        }

        setNavData(allElement2);
    };



	const SwithcerClass = (selector) => document.getElementsByClassName(selector);

    const Switchericon = () => {
        const offcanvasEnd = SwithcerClass("offcanvas-end")[0];
        const switcherBackdrop = SwithcerClass("switcher-backdrop")[0];

        offcanvasEnd?.classList.toggle("show");
        offcanvasEnd.style.insetInlineEnd = "0px";

        if (switcherBackdrop?.classList.contains('d-none')) {
            switcherBackdrop.classList.add("d-block");
            switcherBackdrop.classList.remove("d-none");
        }
    };

    //Dark Model
    const ToggleDark = () => {

        ThemeChanger({
            ...local_varaiable,
            "dataThemeMode": local_varaiable.dataThemeMode == 'dark' ? 'light' : 'dark',
            "dataHeaderStyles": local_varaiable.dataThemeMode == 'gradient' ? 'dark' : 'gradient',
            "dataMenuStyles": local_varaiable.dataThemeMode == 'dark' ? 'light' : 'dark',

        });
        const theme = store.getState();

        if (theme.dataThemeMode != 'dark') {

            ThemeChanger({
                ...theme,
                "bodyBg1": '',
                "bodyBg2": '',
                "darkBg": '',
                "inputBorder": '',
            });
            localStorage.removeItem("aziradarktheme");
            localStorage.removeItem("darkBgRGB1");
            localStorage.removeItem("darkBgRGB2");
            localStorage.removeItem("darkBgRGB3");
            localStorage.removeItem("darkBgRGB4");
            localStorage.removeItem("aziraMenu");
            localStorage.removeItem("aziraHeader");
        }
        else {
            localStorage.setItem("aziradarktheme", "dark");
            localStorage.removeItem("aziralighttheme");
            localStorage.removeItem("aziraHeader");
            localStorage.removeItem("aziraMenu");

        }

    };

    function menuClose() {
        const theme = store.getState();
        ThemeChanger({ ...theme, "toggled": "close" });
    }

    const overlayRef = useRef(null);

    const toggleSidebar = () => {
        const theme = store.getState();
        const sidemenuType = theme.dataNavLayout;
        if (window.innerWidth >= 992) {
            if (sidemenuType === 'vertical') {
                const verticalStyle = theme.dataVerticalStyle;
                const navStyle = theme.dataNavStyle;
                switch (verticalStyle) {
                    // closed
                    case "closed":
                        ThemeChanger({ ...theme, "dataNavStyle": "" });
                        if (theme.toggled === "close-menu-close") {
                            ThemeChanger({ ...theme, "toggled": "" });
                        } else {
                            ThemeChanger({ ...theme, "toggled": "close-menu-close" });
                        }
                        break;
                    // icon-overlay
                    case "overlay":
                        ThemeChanger({ ...theme, "dataNavStyle": "" });
                        if (theme.toggled === "icon-overlay-close") {
                            ThemeChanger({ ...theme, "toggled": "" });
                        } else {
                            if (window.innerWidth >= 992) {
                                ThemeChanger({ ...theme, "toggled": "icon-overlay-close" });
                            }
                        }
                        break;
                    // icon-text
                    case "icontext":
                        ThemeChanger({ ...theme, "dataNavStyle": "" });
                        if (theme.toggled === "icon-text-close") {
                            ThemeChanger({ ...theme, "toggled": "" });
                        } else {
                            ThemeChanger({ ...theme, "toggled": "icon-text-close" });
                        }
                        break;
                    // doublemenu
                    case "doublemenu":
                        ThemeChanger({ ...theme, "dataNavStyle": "" });
                        if (theme.toggled === "double-menu-open") {
                            ThemeChanger({ ...theme, "toggled": "double-menu-close" });
                        } else {
                            if (theme.activeMenuItem) {
                                const activeIndex = theme.menuItems.findIndex(item => item.id === theme.activeMenuItem);

                                if (activeIndex !== -1 && theme.menuItems[activeIndex].next) {
                                    ThemeChanger({
                                        ...theme,
                                        "toggled": "double-menu-open",
                                        activeMenuItem: theme.menuItems[activeIndex].next.id,
                                    });
                                }
                                else {
                                    ThemeChanger({ ...theme, "toggled": "double-menu-close" });
                                }
                            }
                        }

                        break;
                    // detached
                    case "detached":
                        if (theme.toggled === "detached-close") {
                            ThemeChanger({ ...theme, "toggled": "" });
                        } else {
                            ThemeChanger({ ...theme, "toggled": "detached-close" });
                        }
                        break;
                    // default
                    case "default":
                        ThemeChanger({ ...theme, "toggled": "" });

                }
                switch (navStyle) {
                    case "menu-click":
                        if (theme.toggled === "menu-click-closed") {
                            ThemeChanger({ ...theme, "toggled": "" });
                        }
                        else {
                            ThemeChanger({ ...theme, "toggled": "menu-click-closed" });
                        }
                        break;
                    // icon-overlay
                    case "menu-hover":
                        if (theme.toggled === "menu-hover-closed") {
                            ThemeChanger({ ...theme, "toggled": "" });
                        } else {
                            ThemeChanger({ ...theme, "toggled": "menu-hover-closed" });

                        }
                        break;
                    case "icon-click":
                        if (theme.toggled === "icon-click-closed") {
                            ThemeChanger({ ...theme, "toggled": "" });
                        } else {
                            ThemeChanger({ ...theme, "toggled": "icon-click-closed" });

                        }
                        break;
                    case "icon-hover":
                        if (theme.toggled === "icon-hover-closed") {
                            ThemeChanger({ ...theme, "toggled": "" });
                        } else {
                            ThemeChanger({ ...theme, "toggled": "icon-hover-closed" });

                        }
                        break;
                }
            }
        }
        else {
            if (theme.toggled === "close") {
                ThemeChanger({ ...theme, "toggled": "open" });

                setTimeout(() => {
                    if (theme.toggled == "open") {
                        if (overlayRef.current) {
                            overlayRef.current.classList.remove("active");
                        }

                        if (overlayRef) {
                            overlayRef.classList.add("active");
                            overlayRef.addEventListener("click", () => {
                                if (overlayRef.current) {
                                    overlayRef.current.classList.remove("active");
                                    menuClose();
                                }
                            });
                        }
                    }

                    window.addEventListener("resize", () => {
                        if (window.screen.width >= 992) {
                            if (overlayRef.current) {
                                overlayRef.current.classList.remove("active");
                            }
                        }
                    });
                }, 100);
            } else {
                ThemeChanger({ ...theme, "toggled": "close" });
            }
        }
    };
    const cartProduct = [
        {
            id: 1,
            src: product1,
            name: 'Glass Decor Item',
            price: '$1,229',
        },
        {
            id: 2,
            src: product3,
            name: 'Modern Chair',
            price: '$219',
        },
        {
            id: 3,
            src: product5,
            name: 'Branded Black Headset',
            price: '$39.99',
        },
        {
            id: 4,
            src: product4,
            name: 'Sun Glasses',
            price: '$439.8',
        },
        {
            id: 5,
            src: product6,
            name: 'Coffe Cup',
            price: '$225.2',
        },
    ];

    const [cartItems, setCartItems] = useState(cartProduct);
    const [cartItemCount, setCartItemCount] = useState(cartProduct.length);

    const handleRemove = (itemId) => {
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedCart);
        setCartItemCount(updatedCart.length);
    };

    const initialNotifications = [
        { id: 1, icon: 'la la-shopping-basket', color: 'success', text: 'New Order Received', time: '1 hour ago', },
        { id: 2, icon: 'la la-user-check', color: 'danger', text: '22 Verified registrations', time: '2 hours ago' },
        { id: 3, icon: 'la la-check-circle', color: 'primary', text: 'Project has been approved', time: '4 hours ago' },
        { id: 4, icon: 'la la-file-alt', color: 'pink', text: 'New files available', time: '10 hours ago' },
        { id: 5, icon: 'la la-envelope-open', color: 'warning', text: 'New review received', time: '1 day ago' },
        { id: 6, icon: 'la la-gem', color: 'purple', text: 'Updates available', time: '2 days ago' }
    ];

    const [notifications, setNotifications] = useState([...initialNotifications]);

    //Time
    const [time, setTime] = useState(new Date());

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };
    //Date
    const [date, setDate] = useState(new Date());

    const getOrdinalSuffix = (day) => {
        if (day >= 11 && day <= 13) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    const formatDate = (date) => {
        const weekdayOptions = { weekday: 'long' };
        const day = date.getDate();
        const monthOptions = { month: 'long' };
        const year = date.getFullYear();

        const weekday = date.toLocaleDateString(undefined, weekdayOptions);
        const month = date.toLocaleDateString(undefined, monthOptions);
        const suffix = getOrdinalSuffix(day);

        return `${weekday}, ${month} ${day}${suffix} ${year}`;
    };

    useEffect(() => {
        const intervalId1 = setInterval(() => {
            setDate(new Date());
        }, 1000 * 60 * 60 * 24); 
    
        const intervalId = setInterval(() => {
            setTime(new Date()); 
        }, 1000);
    
        const clickHandler = (event) => {
            if (searchResultRef.current && !searchResultRef.current.contains(event.target)) {
                searchResultRef.current.classList.add("d-none");
            }
        };
    
        document.addEventListener("click", clickHandler);
		window.addEventListener("scroll", handleScroll);
    
        return () => {
            document.removeEventListener("click", clickHandler);
		   window.removeEventListener("scroll", handleScroll);
            clearInterval(intervalId);
            clearInterval(intervalId1);
        };
    }, []);

    
    //offcanvas right
    const [showr, setShowr] = useState(false);

    const handleCloser = () => setShowr(false);
    const handleShowr = () => setShowr(true);

    const [showr1, setShowr1] = useState(false);

    const handleCloser1 = () => setShowr1(false);
    const handleShowr1 = () => setShowr1(true);

    // for search modal
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const headerRef = useRef(null);
	const [isSticky, setIsSticky] = useState(false);

	const handleScroll = () => {
		if (window.scrollY > 30) {
			setIsSticky(true);
		} else {
			setIsSticky(false);
		}
	};

    return (
        <Fragment>
            <header ref={headerRef} className={`app-header ${isSticky ? "sticky-pin" : ""}`}>
                <div className="main-header-container container-fluid">
                    <div className="header-content-left">
                        <div className="header-element">
                            <div className="horizontal-logo">
                                <Link to={`${import.meta.env.BASE_URL}dashboard`} className="header-logo">
                                    <img src={bgmi} alt="logo" className="desktop-logo" />
                                    <img src={logo2} alt="logo" className="toggle-logo" />
                                    <img src={logo3} alt="logo" className="desktop-dark" />
                                    <img src={bgmi} alt="logo" className="toggle-dark " />
                                </Link>
                            </div>
                        </div>
                        <div className="header-element">
                            <Link aria-label="Hide Sidebar" onClick={() => toggleSidebar()}
                                className="sidemenu-toggle header-link animated-arrow hor-toggle horizontal-navtoggle"
                                data-bs-toggle="sidebar" to="#"><span><i className="fe fe-align-left header-link-icon border-0"></i>
                                </span>
                            </Link>
                        </div>
                    </div>
                    <div className="header-content-right">

                        {/* <div className="header-element header-fullscreen">
                            <Link onClick={toggleFullScreen} to="#" className="header-link">
                                {fullScreen ? (
                                    <i className="fe fe-minimize header-link-icon full-screen-close "></i>
                                ) : (

                                    <i className="fe fe-maximize header-link-icon  full-screen-open"></i>
                                )}
                            </Link>
                        </div> */}
                        <Dropdown className="header-element mainuserProfile">
                            {/* <!-- Start::header-link|dropdown-toggle --> */}
                            <Dropdown.Toggle as='a' className="header-link " id="mainHeaderProfile"
                                data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                                <div className="d-flex align-items-center">
                                    <div className="d-sm-flex wd-100p lh-0">
                                        <div className="avatar avatar-md"><img alt="avatar" className="rounded-circle"
                                            src={personLogo} /></div>
                                        <div className="ms-2 my-auto d-none d-xl-flex">
                                            <h6 className=" font-weight-semibold mb-0 fs-13 user-name d-sm-block d-none">{fullName}</h6>
                                        </div>
                                    </div>
                                </div>
                            </Dropdown.Toggle>
                            {/* <!-- End::header-link|dropdown-toggle --> */}
                            <Dropdown.Menu className="main-header-dropdown  pt-0 border-0 header-profile-dropdown dropdown-menu-end dropdown-menu-arrow"
                                aria-labelledby="mainHeaderProfile" align='end'>
                                <div className="p-3 menu-header-content text-fixed-white rounded-top text-center">
                                    <div className="">
                                        <div className="avatar avatar-xl rounded-circle">
                                            <img alt="" className="rounded-circle " src={personLogo} />
                                        </div>
                                        <p className="text-fixed-white fs-18 fw-semibold mb-0">{fullName}</p>
                                        {/* <span className="fs-13 text-fixed-white">Premium Member</span> */}
                                    </div>
                                </div>
                                <div>
                                    <hr className="dropdown-divider" />
                                </div>
                                <div>
                                    <Link className='dropdown-item' to="#"><i className="fa fa-user me-1"></i> ITS ID - {its_id}
                                    </Link>
                                    {/* <Link className='dropdown-item' to="#"><i className="fa fa-edit me-1"></i> Edit Profile
                                    </Link>
                                    <Link className='dropdown-item' to="#"><i className="fa fa-clock me-1"></i> Activity Logs
                                    </Link>
                                    <Link className='dropdown-item' to="#"><i className="fa fa-sliders-h me-1"></i> Account Settings
                                    </Link> */}
                                    <Link className='dropdown-item' to="#" onClick={handleLogout}>  <i className="fa fa-sign-out-alt me-1"></i> Logout
                                    </Link>
                                </div>
                            </Dropdown.Menu>
                        </Dropdown>
                
                        
                    </div>
                </div>

            </header>
            {/* <Modal className="fade" id="searchModal" tabIndex="-1" aria-labelledby="searchModal" show={show} onHide={handleClose}>
                <Modal.Body>
                    <span className="input-group">
                        <Form.Control type="search" className="px-2 " placeholder="Search..." aria-label="Username"
                            onChange={(ele => { myfunction(ele.target.value); setInputValue(ele.target.value); })} />
                        <Link to="#" className="input-group-text btn btn-primary" id="Search-Grid"><i className="fe fe-search header-link-icon fs-18"></i></Link>
                    </span>
                    {showa ?
                        <div ref={searchResultRef} className="card search-result position-relative z-index-9 search-fix  border mt-1">
                            <div className="card-header">
                                <div className="card-title me-2 text-break">Search result of {InputValue}</div>
                            </div>
                            <ListGroup className='my-2 mx-3'>
                                {show2 ?
                                    NavData.map((e) =>
                                        <ListGroup.Item key={e.id} className="">
                                            <Link to={`${e.path}/`} className='search-result-item' onClick={() => { setShow1(false), setInputValue(""); }}>{e.title}</Link>
                                        </ListGroup.Item>
                                    )
                                    : <b className={`${searchcolor} `}>{searchval}</b>}
                            </ListGroup>

                        </div>
                        : ""}
                    <div className="mt-3">
                        <div className="">
                            <p className="fw-semibold text-muted mb-2 fs-13">Recent Searches</p>
                            <div className="ps-2">
                                <Link to="#" className="search-tags me-1"><i className="fe fe-search me-2"></i>People<span></span></Link>
                                <Link to="#" className="search-tags me-1"><i className="fe fe-search me-2"></i>Pages<span></span></Link>
                                <Link to="#" className="search-tags me-1"><i className="fe fe-search me-2"></i>Articles<span></span></Link>
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="fw-semibold text-muted mb-2 fs-13">Apps and pages</p>
                            <ul className="ps-2">
                                <li className="p-1 d-flex align-items-center text-muted mb-2 search-app">
                                    <Link to="#"><span><i className='bx bx-calendar me-2 fs-14 bg-primary-transparent p-2 rounded-circle '></i>Calendar</span></Link>
                                </li>
                                <li className="p-1 d-flex align-items-center text-muted mb-2 search-app">
                                    <Link to="#"><span><i className='bx bx-envelope me-2 fs-14 bg-primary-transparent p-2 rounded-circle'></i>Mail</span></Link>
                                </li>
                                <li className="p-1 d-flex align-items-center text-muted mb-2 search-app">
                                    <Link to="#"><span><i className='bx bx-dice-1 me-2 fs-14 bg-primary-transparent p-2 rounded-circle '></i>Buttons</span></Link>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-3">
                            <p className="fw-semibold text-muted mb-2 fs-13">Links</p>
                            <ul className="ps-2 list-unstyled">
                                <li className="p-1 align-items-center  mb-1 search-app">
                                    <Link to="#" className="text-primary"><u>http://spruko/html/spruko.com</u></Link>
                                </li>
                                <li className="p-1 align-items-center mb-1 search-app">
                                    <Link to="#" className="text-primary"><u>http://spruko/demo/spruko.com</u></Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="d-block">
                    <div className="text-center">
                        <Link to="#" className="text-primary text-decoration-underline fs-15">View all results</Link>
                    </div>
                </Modal.Footer>
            </Modal> */}
        </Fragment>
    );
};

const mapStateToProps = (state) => ({
    local_varaiable: state
});
export default connect(mapStateToProps, { ThemeChanger })(Header);