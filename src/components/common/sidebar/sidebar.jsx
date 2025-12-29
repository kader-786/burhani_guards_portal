import { Fragment, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { ThemeChanger } from "../../../redux/action";
import store from "../../../redux/store";
import SimpleBar from "simplebar-react";
import { MenuItems } from "./sidemenu/sidemenu";
import Menuloop from "./menuloop";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const Sidebar = ({ local_varaiable, ThemeChanger }) => {

	const [menuitems, setMenuitems] = useState(MenuItems);

	function closeMenuFn() {
		const closeMenuRecursively = (items) => {
			items?.forEach((item) => {
				item.active = false;
				closeMenuRecursively(item.children);
			});
		};
		closeMenuRecursively(MenuItems);
		setMenuitems((arr) => [...arr]);
	}

	const slidesArrow = (selector) => document.querySelector(selector);

	useEffect(() => {
		const resizeEventListeners = [
			{ event: 'resize', handler: menuResizeFn },
			{ event: 'resize', handler: checkHoriMenu }
		];
		resizeEventListeners.forEach(({ event, handler }) => {
			window.addEventListener(event, handler);
		});
		const mainContent = slidesArrow(".main-content");
		if (window.innerWidth <= 992) {
			if (mainContent) {
				const theme = store.getState();
				ThemeChanger({ ...theme, toggled: "close" });
			} else if (document.documentElement.getAttribute('data-nav-layout') == 'horizontal') {
				closeMenuFn();
			}
		}
		if (mainContent) {
			mainContent.addEventListener('click', menuClose);
		}
		window.addEventListener("scroll", handleScroll);
		return () => {
			resizeEventListeners.forEach(({ event, handler }) => {
				window.removeEventListener(event, handler);
			});
			if (mainContent) {
				mainContent.removeEventListener('click', menuClose);
			}
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);
	

	const location = useLocation()

	function Onhover() {
		const theme = store.getState();
		if ((theme.toggled == "icon-overlay-close" || theme.toggled == "detached-close") && theme.iconOverlay != "open") {
			ThemeChanger({ ...theme, "iconOverlay": "open" });
		}
	}
	function Outhover() {
		const theme = store.getState();
		if ((theme.toggled == "icon-overlay-close" || theme.toggled == "detached-close") && theme.iconOverlay == "open") {
			ThemeChanger({ ...theme, "iconOverlay": "" });
		}
	}

	const overlayRef = useRef(null);

	function menuClose() {

		const theme = store.getState();

		if (window.innerWidth <= 992) {
			ThemeChanger({ ...theme, toggled: "close" });
		}
		if (overlayRef.current) {
			overlayRef.current.classList.remove("active");
		}
		if (theme.dataNavLayout === "horizontal" || theme.dataNavStyle === "menu-click" || theme.dataNavStyle === "icon-click") {
			closeMenuFn();
		}
	}

	const WindowPreSize = typeof window !== 'undefined' ? [window.innerWidth] : [];
	function menuResizeFn() {
		if (typeof window === 'undefined') {
			return;
		}
		WindowPreSize.push(window.innerWidth);
		if (WindowPreSize.length > 2) { WindowPreSize.shift() }

		const theme = store.getState();
		const currentWidth = WindowPreSize[WindowPreSize.length - 1];
		const prevWidth = WindowPreSize[WindowPreSize.length - 2];

		if (WindowPreSize.length > 1) {
			if (currentWidth < 992 && prevWidth >= 992) {
				ThemeChanger({ ...theme, toggled: "close" });
			}

			if (currentWidth >= 992 && prevWidth < 992) {
				ThemeChanger({ ...theme, toggled: theme.dataVerticalStyle === "doublemenu" ? "double-menu-open" : "" });
			}
		}
	}

	const menuNavRef = useRef(null);
	const mainContainerRef = useRef(null);

	function checkHoriMenu() {
		const menuNav = menuNavRef.current;
		const mainContainer1 = mainContainerRef.current;

		if (menuNav && mainContainer1) {
			const computedStyle = window.getComputedStyle(menuNav);
			const marginLeftValue = Math.ceil(
				Number(computedStyle.marginLeft.split("px")[0])
			);
			const marginRightValue = Math.ceil(
				Number(computedStyle.marginRight.split("px")[0])
			);
			const check = menuNav.scrollWidth - mainContainer1.offsetWidth;

			if (menuNav.scrollWidth > mainContainer1.offsetWidth) {
			} else {
				menuNav.style.marginLeft = "0px";
				menuNav.style.marginRight = "0px";
				menuNav.style.marginInlineStart = "0px";
			}

			const isRtl = document.documentElement.getAttribute("dir") === "rtl";

			if (!isRtl) {
				if (menuNav.scrollWidth > mainContainer1.offsetWidth) {
					if (Math.abs(check) < Math.abs(marginLeftValue)) {
						menuNav.style.marginLeft = -check + "px";
					}
				}
			} else {
				if (menuNav.scrollWidth > mainContainer1.offsetWidth) {
					if (Math.abs(check) < Math.abs(marginRightValue)) {
						menuNav.style.marginRight = -check + "px";
					}
				}
			}
		}
	}

	const sidebarRef = useRef(null);
	const [isSticky, setIsSticky] = useState(false);

	const handleScroll = () => {
		if (window.scrollY > 30) {
			setIsSticky(true);
		} else {
			setIsSticky(false);
		}
	};

	const level = 0;

	function setSubmenu(event, targetObject, MENUITEMS = menuitems) {
		if (!event?.ctrlKey) {
			for (const item of MENUITEMS) {
				if (item === targetObject) {
					item.active = true;
					item.selected = true;
					setMenuAncestorsActive(item);
				} else if (!item.active && !item.selected) {
					item.active = false;
					item.selected = false;
				} else {
					removeActiveOtherMenus(item);
				}
				if (item.children && item.children.length > 0) {
					setSubmenu(event, targetObject, item.children);
				}
			}

		}

		setMenuitems((arr) => [...arr]);
	}

	function toggleSidemenu(event, targetObject, MENUITEMS = menuitems) {
		const theme = store.getState();
		let element = event.target;
		if ((theme.dataNavStyle != "icon-hover" && theme.dataNavStyle != "menu-hover") || (window.innerWidth < 992) || (theme.dataNavLayout != "horizontal") && (theme.toggled != "icon-hover-closed" || theme.toggled != "menu-hover-closed")) {
			for (const item of MENUITEMS) {
				if (item === targetObject) {
					if (theme.dataVerticalStyle == "doublemenu" && item.active) { return; }
					item.active = !item.active;

					if (item.active) {
						closeOtherMenus(MENUITEMS, item);
					} 
					else {
						if (theme.dataVerticalStyle == "doublemenu") {
							ThemeChanger({ ...theme, toggled: "double-menu-close" });
						}
					}
					setAncestorsActive(MENUITEMS, item);

				}
				else if (!item.active) {
					if (theme.dataVerticalStyle != "doublemenu") {
						item.active = false;
					}
				}
				if (item.children && item.children.length > 0) {
					toggleSidemenu(event, targetObject, item.children);
				}
			}
			if (targetObject?.children && targetObject.active) {
				if (theme.dataVerticalStyle == "doublemenu" && theme.toggled != "double-menu-open") {
					ThemeChanger({ ...theme, toggled: "double-menu-open" });
				}
			}
			if (element && theme.dataNavLayout == "horizontal" && (theme.dataNavStyle == "menu-click" || theme.dataNavStyle == "icon-click")) {
				const listItem = element.closest("li");
				if (listItem) {
					const siblingUL = listItem.querySelector("ul");
					let outterUlWidth = 0;
					let listItemUL = listItem.closest("ul:not(.main-menu)");
					while (listItemUL) {
						listItemUL = listItemUL.parentElement.closest("ul:not(.main-menu)");
						if (listItemUL) {
							outterUlWidth += listItemUL.clientWidth;
						}
					}
					if (siblingUL) {
						let siblingULRect = listItem.getBoundingClientRect();
						if (theme.dir == "rtl") {
							if ((siblingULRect.left - siblingULRect.width - outterUlWidth + 150 < 0 && outterUlWidth < window.innerWidth) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
								targetObject.dirchange = true;
							} else {
								targetObject.dirchange = false;
							}
						} else {
							if ((outterUlWidth + siblingULRect.right + siblingULRect.width + 50 > window.innerWidth && siblingULRect.right >= 0) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
								targetObject.dirchange = true;
							} else {
								targetObject.dirchange = false;
							}
						}
					}
					setTimeout(() => {
						let computedValue = siblingUL.getBoundingClientRect();
						if ((computedValue.bottom) > window.innerHeight) {
							siblingUL.style.height = (window.innerHeight - computedValue.top - 8) + "px";
							// siblingUL.style.overflow = "auto";
						}
					}, 100);
				}
			}
			setMenuitems((arr) => [...arr]);
		}
	}

	function HoverToggleInnerMenuFn(event, item) {
		const theme = store.getState();
		let element = event.target;
		if (element && theme.dataNavLayout == "horizontal" && (theme.dataNavStyle == "menu-hover" || theme.dataNavStyle == "icon-hover")) {
			const listItem = element.closest("li");
			if (listItem) {
				const siblingUL = listItem.querySelector("ul");
				let outterUlWidth = 0;
				let listItemUL = listItem.closest("ul:not(.main-menu)");
				while (listItemUL) {
					listItemUL = listItemUL.parentElement.closest("ul:not(.main-menu)");
					if (listItemUL) {
						outterUlWidth += listItemUL.clientWidth;
					}
				}
				if (siblingUL) {
					// You've found the sibling <ul> element
					let siblingULRect = listItem.getBoundingClientRect();
					if (theme.dir == "rtl") {
						if ((siblingULRect.left - siblingULRect.width - outterUlWidth + 150 < 0 && outterUlWidth < window.innerWidth) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
							item.dirchange = true;
						} else {
							item.dirchange = false;
						}
					} else {
						if ((outterUlWidth + siblingULRect.right + siblingULRect.width + 50 > window.innerWidth && siblingULRect.right >= 0) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
							item.dirchange = true;
						} else {
							item.dirchange = false;
						}
					}
				}
			}
		}
	}

	const [previousUrl, setPreviousUrl] = useState("/");

	function setAncestorsActive(MenuItems, targetObject) {
		const theme = store.getState();
		const parent = findParent(MenuItems, targetObject);
		if (parent) {
			parent.active = true;
			if (parent.active) {
				ThemeChanger({ ...theme, toggled: "double-menu-open" });
			}

			setAncestorsActive(MenuItems, parent);
		} 
		else {
			if (theme.dataVerticalStyle == "doublemenu") {
				ThemeChanger({ ...theme, toggled: "double-menu-close" });
			}

		}
	}
  
	const setMenuUsingUrl = (currentPath) => {
	  let hasParent = false;
	  const setSubmenuRecursively = (items) => {
		items?.forEach((item) => {
		  if (item.path === currentPath) {
			setSubmenu(null, item);
		  }
		  if (item.children) setSubmenuRecursively(item.children);
		});
	  };
	  setSubmenuRecursively(MenuItems);
	};
  
	useEffect(() => {
	  const currentPath = location.pathname.endsWith("/") ? location.pathname.slice(0, -1) : location.pathname;
  
	  if (currentPath !== previousUrl) {
		setMenuUsingUrl(currentPath);
		setPreviousUrl(currentPath);
	  }
	}, [location.pathname]);
  
  
	const findParent = (items, targetObject) => {
	  for (const item of items) {
		if (item.children && item.children.includes(targetObject)) {
		  return item;
		}
		if (item.children) {
		  const parent = findParent(item.children, targetObject);
		  if (parent) return parent;
		}
	  }
	  return null;
	};
  
	const closeOtherMenus = (items, targetObject) => {
	  items.forEach(item => {
		if (item !== targetObject) {
		  item.active = false;
		  if (item.children) closeOtherMenus(item.children, targetObject);
		}
	  });
	};
  
	let hasParent = false;
	let hasParentLevel = 0;

	const setMenuAncestorsActive = (targetObject) => {
	  const parent = findParent(MenuItems, targetObject);
	  const theme = store.getState();
	  if (parent) {
		if (hasParentLevel > 2) {
			hasParent = true;
		}
		parent.active = true;
		parent.selected = true;
		setMenuAncestorsActive(parent);
	  } 
	//   else if (!hasParent) {
	// 	if (theme.dataVerticalStyle == "doublemenu") {
	// 		ThemeChanger({ ...theme, toggled: "double-menu-close" });
	// 	}
	// }
	};
  
	const removeActiveOtherMenus = (item) => {
	  if (Array.isArray(item)) {
		item.forEach(val => {
		  val.active = false;
		  val.selected = false;
		});
	  } else {
		item.active = false;
		item.selected = false;
		if (item.children) removeActiveOtherMenus(item.children);
	  }
	};

	
	function switcherArrowFn() {
		
		// Used to remove is-expanded class and remove class on clicking arrow buttons
		function slideClick() {
			const slide = document.querySelectorAll(".slide");
			const slideMenu = document.querySelectorAll(".slide-menu");
			
			slide.forEach((element) => {
				if (element.classList.contains("is-expanded")) {
					element.classList.remove("is-expanded");
				}
			});
			
			slideMenu.forEach((element) => {
				if (element.classList.contains("open")) {
					element.classList.remove("open");
					element.style.display = "none";
				}
			});
		}
		
		slideClick();
	}
	
	const menuNav = slidesArrow(".main-menu");
	const mainContainer1 = slidesArrow(".main-sidebar");
	const slideRightButton = slidesArrow("#slide-right");
	const slideLeftButton = slidesArrow("#slide-left");
	const element = slidesArrow(".main-menu > .slide.open");
	const element1 = slidesArrow(".main-menu > .slide.open > ul");

	function slideRight() {
		if (menuNav && mainContainer1) {
			const computedStyle = window.getComputedStyle(menuNav);
			const marginLeftValue = Math.ceil(
				Number(computedStyle.marginInlineStart.split("px")[0])
			);
			const marginRightValue = Math.ceil(
				Number(computedStyle.marginInlineEnd.split("px")[0])
			);
			const check = menuNav.scrollWidth - mainContainer1.offsetWidth;
			let mainContainer1Width = mainContainer1.offsetWidth;

			if (menuNav.scrollWidth > mainContainer1.offsetWidth) {
				if (!(local_varaiable.dataVerticalStyle.dir === "rtl")) {
					if (Math.abs(check) > Math.abs(marginLeftValue)) {
						menuNav.style.marginInlineEnd = "0";

						if (!(Math.abs(check) > Math.abs(marginLeftValue) + mainContainer1Width)) {
							mainContainer1Width = Math.abs(check) - Math.abs(marginLeftValue);
							if (slideRightButton) {
								slideRightButton.classList.add("hidden");
							}
						}

						menuNav.style.marginInlineStart =
							(Number(menuNav.style.marginInlineStart.split("px")[0]) -
								Math.abs(mainContainer1Width)) +
							"px";
						if (slideRightButton) {
							slideRightButton.classList.remove("hidden");
						}
					}
				} else {
					if (Math.abs(check) > Math.abs(marginRightValue)) {
						menuNav.style.marginInlineEnd = "0";

						if (!(Math.abs(check) > Math.abs(marginRightValue) + mainContainer1Width)) {
							mainContainer1Width = Math.abs(check) - Math.abs(marginRightValue);
							if (slideRightButton) {
								slideRightButton.classList.add("hidden");
							}
						}

						menuNav.style.marginInlineStart =
							(Number(menuNav.style.marginInlineStart.split("px")[0]) -
								Math.abs(mainContainer1Width)) +
							"px";
						if (slideLeftButton) {
							slideLeftButton.classList.remove("hidden");
						}
					}
				}
			}

			if (element) {
				element.classList.remove("active");
			}
			if (element1) {
				element1.style.display = "none";
			}
		}

		switcherArrowFn();
	}

	function slideLeft() {
		if (menuNav && mainContainer1) {
			const computedStyle = window.getComputedStyle(menuNav);
			const marginLeftValue = Math.ceil(
				Number(computedStyle.marginInlineStart.split("px")[0])
			);
			const marginRightValue = Math.ceil(
				Number(computedStyle.marginInlineEnd.split("px")[0])
			);
			const check = menuNav.scrollWidth - mainContainer1.offsetWidth;
			let mainContainer1Width = mainContainer1.offsetWidth;

			if (menuNav.scrollWidth > mainContainer1.offsetWidth) {
				if (!(local_varaiable.dataVerticalStyle.dir === "rtl")) {
					if (Math.abs(check) <= Math.abs(marginLeftValue)) {
						menuNav.style.marginInlineStart = "0px";
					}
				} else {
					if (Math.abs(check) > Math.abs(marginRightValue)) {
						menuNav.style.marginInlineStart = "0";

						if (!(Math.abs(check) > Math.abs(marginRightValue) + mainContainer1Width)) {
							mainContainer1Width = Math.abs(check) - Math.abs(marginRightValue);
							if (slideRightButton) {
								slideRightButton.classList.add("hidden");
							}
						}

						menuNav.style.marginInlineStart =
							(Number(menuNav.style.marginInlineStart.split("px")[0]) -
								Math.abs(mainContainer1Width)) +
							"px";
						if (slideLeftButton) {
							slideLeftButton.classList.remove("hidden");
						}
					}
				}
			}

			if (element) {
				element.classList.remove("active");
			}
			if (element1) {
				element1.style.display = "none";
			}
		}

		switcherArrowFn();
	}

	return (
		<Fragment>
			<div id="responsive-overlay" ref={overlayRef} onClick={() => { menuClose(); }}></div>
			<aside ref={sidebarRef} className={`app-sidebar ${isSticky ? "sticky-pin" : ""}`} id="sidebar" onMouseOver={() => Onhover()} onMouseLeave={() => Outhover()}>
				
				<SimpleBar ref={mainContainerRef} className="main-sidebar" id="sidebar-scroll" style={{ height: "100%" }}>
					<nav className="main-menu-container nav nav-pills flex-column sub-open">
						
						
						<div className="slide-left" id="slide-left" onClick={() => slideLeft()}><svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24"
						height="24" viewBox="0 0 24 24"><path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path></svg>
						</div>
						<ul className="main-menu" ref={menuNavRef} >
							{MenuItems.map((levelone) => (
								<Fragment key={levelone.id || levelone.title}>
									<li className={`${levelone.menutitle ? "slide__category" : ""}  
									                ${levelone.type === "link" ? "slide" : ""}
                                                    ${levelone.type === "sub" ? "slide has-sub" : ""} 
													${levelone?.active ? "open" : ""} 
													${levelone?.selected ? "active" : ""}`}>{levelone.menutitle ? <span className='category-name'>{levelone.menutitle}</span> : ""}
										{levelone.type === "link" ?
											<Link to={levelone.path + "/"} className={`side-menu__item ${levelone.selected ? "active" : ""}`}>
												{localStorage.aziralayout === "horizontal" ? (
													<span className='side-menu__icon'>{levelone.icon}</span>
												) : (
													localStorage.aziraverticalstyles === "doublemenu" ? (
														<div className="" >
															<OverlayTrigger placement={localStorage.azirartl ? "left" : "right"} overlay={<Tooltip>{levelone.title}</Tooltip>}>
																<span className='side-menu__icon'>{levelone.icon}</span>
															</OverlayTrigger>
														</div>
													) : (
														<span className='side-menu__icon'>{levelone.icon}</span>
													)
												)}
												<span className="side-menu__label">{levelone.title}</span> </Link>
											: ""}
										{levelone.type === "empty" ?
											<Link to="#" className='side-menu__item'>{levelone.icon}<span className="">{levelone.title}</span></Link>
											: ""}
										{levelone.type === "sub" ? <Menuloop MENUITEMS={levelone} level={level + 1} toggleSidemenu={toggleSidemenu} HoverToggleInnerMenuFn={HoverToggleInnerMenuFn} /> : ""}
									</li>
								</Fragment>
							))}
						</ul>
						<div className="slide-right" id="slide-right"onClick={() => slideRight()}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24" height="24" viewBox="0 0 24 24"><path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"></path></svg>
						</div>
					</nav>
				</SimpleBar>
			</aside>
		</Fragment>
	);
};

const mapStateToProps = (state) => ({
	local_varaiable: state
});

export default connect(mapStateToProps, { ThemeChanger })(Sidebar);

