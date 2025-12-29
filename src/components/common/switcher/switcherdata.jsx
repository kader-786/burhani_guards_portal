import { useState } from 'react';
import store from '../../../redux/store';
import {DirectionTheme, updateBackgroundColor, updateBgImage, updateDefaultHeaderStyle, updateHeaderPosition, updateHeaderStyle, updateLayout, updateMenuPosition, updateMenuStyle, updateNavStyle, updatePageStyle, updatePrimaryColor, updateTheme, updateWidthStyle} from './switcher-reusable';

export const Light = (actionfunction) => updateTheme("light", actionfunction);

export const Dark = (actionfunction) => updateTheme("dark", actionfunction);

export const Ltr = (actionfunction) => DirectionTheme("ltr", actionfunction);

export const Rtl = (actionfunction) => DirectionTheme("rtl", actionfunction);

export const HorizontalClick = (actionfunction) => updateLayout("horizontal", actionfunction);

export const Vertical = (actionfunction) => updateLayout("vertical", actionfunction); 

export const Menuclick = (actionfunction) => updateNavStyle("menu-click", "menu-click-closed", actionfunction);

export const MenuHover = (actionfunction) => updateNavStyle("menu-hover", "menu-hover-closed", actionfunction);

export const IconClick = (actionfunction) => updateNavStyle("icon-click", "icon-click-closed", actionfunction);

export const IconHover = (actionfunction) => updateNavStyle("icon-hover", "icon-hover-closed", actionfunction);

export const Fullwidth = (actionfunction) => updateWidthStyle("fullwidth", actionfunction);

export const Boxed = (actionfunction) => updateWidthStyle("boxed", actionfunction);

export const FixedMenu = (actionfunction) => updateMenuPosition("fixed", actionfunction);

export const scrollMenu = (actionfunction) => updateMenuPosition("scrollable", actionfunction);

export const Headerpostionfixed = (actionfunction) => updateHeaderPosition("fixed", actionfunction);

export const Headerpostionscroll = (actionfunction) => updateHeaderPosition("scrollable", actionfunction);

export const Regular = (actionfunction) => updatePageStyle("regular", actionfunction);

export const Classic = (actionfunction) =>  updatePageStyle("classic", actionfunction);

export const Modern = (actionfunction) =>  updatePageStyle("modern", actionfunction);

export const bgImage1 = (actionfunction) => updateBgImage("bgimage1", actionfunction);

export const bgImage2 = (actionfunction) => updateBgImage("bgimage2", actionfunction);

export const bgImage3 = (actionfunction) => updateBgImage("bgimage3", actionfunction);

export const bgImage4 = (actionfunction) =>  updateBgImage("bgimage4", actionfunction);

export const bgImage5 = (actionfunction) => updateBgImage("bgimage5", actionfunction);

export const lightMenu = (actionfunction) =>  updateMenuStyle("light", actionfunction);

export const darkMenu = (actionfunction) => updateMenuStyle("dark", actionfunction);

export const darkHeader = (actionfunction) =>  updateHeaderStyle("dark", actionfunction);

export const colorHeader = (actionfunction) => updateHeaderStyle("color", actionfunction);

export const gradientHeader = (actionfunction) => updateHeaderStyle("gradient", actionfunction);

export const transparentHeader = (actionfunction) => updateHeaderStyle("transparent", actionfunction);

export const defaultlightHeader = (actionfunction) => updateDefaultHeaderStyle("light", actionfunction);

export const defaultdarkHeader = (actionfunction) => updateDefaultHeaderStyle("dark", actionfunction);

export const defaultcolorHeader = (actionfunction) => updateDefaultHeaderStyle("color", actionfunction);

export const defaultgradientHeader = (actionfunction) => updateDefaultHeaderStyle("gradient", actionfunction);

export const defaulttransparentHeader = (actionfunction) => updateDefaultHeaderStyle("transparent", actionfunction);

export const primaryColor1 = (actionfunction) => updatePrimaryColor("58, 88, 146", actionfunction);

export const primaryColor2 = (actionfunction) => updatePrimaryColor("92, 144, 163", actionfunction);

export const primaryColor3 = (actionfunction) => updatePrimaryColor("161, 90, 223", actionfunction);

export const primaryColor4 = (actionfunction) => updatePrimaryColor("78, 172, 76", actionfunction);

export const primaryColor5 = (actionfunction) => updatePrimaryColor("223, 90, 90", actionfunction);

export const backgroundColor1 = (actionfunction) => updateBackgroundColor("20, 30, 96", "25, 38, 101", "25, 38, 101", actionfunction);

export const backgroundColor2 = (actionfunction) => updateBackgroundColor("8, 78, 115", "13, 86, 120", "13, 86, 120", actionfunction);

export const backgroundColor3 = (actionfunction) => updateBackgroundColor("90, 37, 135", "95, 45, 140", "95, 45, 140", actionfunction);

export const backgroundColor4 = (actionfunction) => updateBackgroundColor("24, 101, 51", "29, 109, 56", "29, 109, 56", actionfunction);

export const backgroundColor5 = (actionfunction) => updateBackgroundColor("120, 66, 20", "125, 74, 25", "125, 74, 25", actionfunction);

const addClickListenerToClass = (className, callback) => {
    const elements = document.getElementsByClassName(className);
    for (let element of elements) {
        element.addEventListener("click", callback);
    }
};

export const Defaultmenu = (actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "dataVerticalStyle": "overlay",
        "dataNavLayout": "vertical",
        'toggled': ''
    });
    localStorage.removeItem("aziranavstyles");
    localStorage.setItem("aziraverticalstyles", "default");

};
export const Closedmenu = (actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "dataNavLayout": "vertical",
        "dataVerticalStyle": "closed",
        "toggled": "close-menu-close"
    });
    localStorage.setItem("aziraverticalstyles", "closed");
    localStorage.removeItem("aziranavstyles");

};

let html = document.documentElement;

function icontextOpenFn() {
    if (html.getAttribute("data-toggled") === "icon-text-close") {
        html.setAttribute("data-icon-text", "open");
    }
}
function icontextCloseFn() {
    if (html.getAttribute("data-toggled") === "icon-text-close") {
        html.removeAttribute("data-icon-text");
    }
}
export const iconText = (actionfunction) => {
	const theme = store.getState();
	actionfunction({
		...theme,
		"dataNavLayout": "vertical",
		"dataVerticalStyle": "icontext",
		"toggled": "icon-text-close",
		"dataNavStyle": "",
	});
	localStorage.setItem("aziraverticalstyles", "icontext");
	localStorage.removeItem("aziranavstyles");

addClickListenerToClass("app-sidebar", icontextOpenFn);
addClickListenerToClass("main-content", icontextCloseFn);

};

export const iconOverayFn = (actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "dataNavLayout": "vertical",
        "dataVerticalStyle": "overlay",
        "toggled": "icon-overlay-close",
    });
    localStorage.setItem("aziraverticalstyles", "overlay");
    localStorage.removeItem("aziranavstyles");

    addClickListenerToClass("app-sidebar", DetachedOpenFn);
    addClickListenerToClass("main-content", DetachedCloseFn);

};
function DetachedOpenFn() {
    if (window.innerWidth > 992) {
        if (html.getAttribute('data-toggled') === 'detached-close' || html.getAttribute('data-toggled') === 'icon-overlay-close') {
            html.setAttribute('data-icon-overlay', "open");
        }
    }
}
function DetachedCloseFn() {
    if (window.innerWidth > 992) {
        if (html.getAttribute('data-toggled') === 'detached-close' || html.getAttribute('data-toggled') === 'icon-overlay-close') {
            html.removeAttribute('data-icon-overlay');
        }
    }
}
export const DetachedFn = (actionfunction) => {
    const theme = store.getState()
    actionfunction({
        ...theme,
        "dataNavLayout": "vertical",
        "dataVerticalStyle": "detached",
        "toggled": "detached-close",
        "dataNavStyle": "",

    })
    localStorage.setItem("aziraverticalstyles", "detached");
    localStorage.removeItem("aziranavstyles");

    addClickListenerToClass("app-sidebar", DetachedOpenFn);
    addClickListenerToClass("main-content", DetachedCloseFn);
};
export const DoubletFn = (actionfunction) => {
    const theme = store.getState();
    actionfunction({
        ...theme,
        "dataNavLayout": "vertical",
        "dataVerticalStyle": "doublemenu",
        "toggled": "double-menu-open",
    });
    localStorage.setItem("aziraverticalstyles", "doublemenu");
    localStorage.removeItem("aziranavstyles");

    setTimeout(() => {
        if (!document.querySelector(".main-menu .slide.active ul")) {
            const theme = store.getState();
            actionfunction(
                {
                    ...theme,
                    "data-toggled": "double-menu-close",


                }
            );
        }
    }, 100);
};
const ColorPicker = (props) => {
    return (
        <div className="color-picker-input">
            <input type="color" {...props} />
        </div>
    );
};
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
const Themeprimarycolor = ({ actionfunction }) => {
    const theme = store.getState();
    const [state, updateState] = useState("#FFFFFF");

    const handleInput = (e) => {
        const rgb = hexToRgb(e.target.value);

        if (rgb !== null) {
            const { r, g, b } = rgb;
            updateState(e.target.value);
            actionfunction({
                ...theme,
                "colorPrimaryRgb": `${r} , ${g} , ${b}`,
            });
            localStorage.setItem("dynamiccolor", `${r}, ${g}, ${b}`);
        }
    };

    return (
        <div className="Themeprimarycolor theme-container-primary pickr-container-primary">
            <ColorPicker onChange={handleInput} value={state} />
        </div>
    );
};
export default Themeprimarycolor;

export const Themebackgroundcolor = ({ actionfunction }) => {
    const theme = store.getState();
    const [state, updateState] = useState("#FFFFFF");
    const handleInput = (e) => {
        const { r, g, b } = hexToRgb(e.target.value);
        updateState(e.target.value);
        actionfunction({
            ...theme,
            "bodyBg1": `${r}, ${g}, ${b}`,
            "bodyBg2": `${r + 19}, ${g + 19}, ${b + 19}`,
            "darkBg": `${r + 19}, ${g + 19}, ${b + 19}`,
            "inputBorder": "255, 255, 255, 0.1",
            "dataThemeMode": "dark",
            "dataHeaderStyles": "gradient",
            "dataMenuStyles": "dark"
        });
        localStorage.setItem("darkBgRGB1", `${r}, ${g}, ${b}`);
        localStorage.setItem("darkBgRGB2", `${r + 19}, ${g + 19}, ${b + 19}`);
        localStorage.setItem("darkBgRGB3", `${r + 19}, ${g + 19}, ${b + 19}`);
        localStorage.setItem("darkBgRGB3", `${r + 19}, ${g + 19}, ${b + 19}`);
        localStorage.setItem("aziraHeader", "gradient");
        localStorage.removeItem("aziraMenu");
        //localStorage.removeItem("aziraHeader");

    };
    return (
        <div className="Themebackgroundcolor">
            <ColorPicker onChange={handleInput} value={state} />
        </div>
    );
};

export const Reset = (actionfunction) => {
    const theme = store.getState();
    Vertical(actionfunction);
    actionfunction({
        ...theme,
        lang: "en",
        dir: "ltr",
        dataThemeMode: "light",
        dataMenuStyles: "light",
        dataNavLayout: "vertical",
        defaultHeaderStyles: "",
        dataHeaderStyles: "gradient",
        dataVerticalStyle: "overlay",
        StylebodyBg: "107 64 64",
        StyleDarkBg: "93 50 50",
        toggled: "",
        dataNavStyle: "",
        horStyle: "",
        dataPageStyle: "regular",
        dataWidth: "fullwidth",
        dataMenuPosition: "fixed",
        dataHeaderPosition: "fixed",
        loader: "disable",
        iconOverlay: "",
        colorPrimaryRgb: "",
        bodyBg1: "",
        bodyBg2: "",
        darkBg: "",
        inputBorder: "",
        bgImg: "",
        iconText: "",
        body: {
            class: ""
        }
    });
    localStorage.clear();
    const icon = document.getElementById("switcher-default-menu");
	if (icon) {
		icon.checked = true;
	}
};

export const Reset1 = (actionfunction) => {
    const theme = store.getState();
    Vertical(actionfunction);
    actionfunction({
        ...theme,
        lang: "en",
        dir: "ltr",
        dataThemeMode: "light",
        dataMenuStyles: "light",
        dataNavLayout: "horizontal",
        dataHeaderStyles: "",
        dataVerticalStyle: "overlay",
        StylebodyBg: "107 64 64",
        StyleDarkBg: "93 50 50",
        toggled: "",
        dataNavStyle: "menu-click",
        dataMenuPosition: "fixed",
        iconOverlay: "",
        colorPrimaryRgb: "",
        bgImg: "",
        iconText: "",
        body: {
            class: ""
        }
    });
    localStorage.clear();
};

export const LocalStorageBackup = (actionfunction) => {

    (localStorage.aziraltr) ? Ltr(actionfunction) : "";
    (localStorage.azirartl) ? Rtl(actionfunction) : "";
    (localStorage.aziradarktheme) ? Dark(actionfunction) : "";
    (localStorage.aziralighttheme) ? Light(actionfunction) : "";
    (localStorage.aziraregular) ? Regular(actionfunction) : "";
    (localStorage.aziraclassic) ? Classic(actionfunction) : "";
    (localStorage.aziramodern) ? Modern(actionfunction) : "";
    (localStorage.azirafullwidth) ? Fullwidth(actionfunction) : "";
    (localStorage.aziraboxed) ? Boxed(actionfunction) : "";
    (localStorage.aziramenufixed) ? FixedMenu(actionfunction) : "";
    (localStorage.aziramenuscrollable) ? scrollMenu(actionfunction) : "";
    (localStorage.aziraheaderfixed) ? Headerpostionfixed(actionfunction) : "";
    (localStorage.aziraheaderscrollable) ? Headerpostionscroll(actionfunction) : "";

    (localStorage.aziraloaderenable) ? Enable(actionfunction) : "";
    (localStorage.aziraloaderdisable) ? Disable(actionfunction) : "";

    (localStorage.aziranavstyles === "menu-click") ? Menuclick(actionfunction) : '';
    (localStorage.aziranavstyles === "menu-hover") ? MenuHover(actionfunction) : '';
    (localStorage.aziranavstyles === "icon-click") ? IconClick(actionfunction) : '';
    (localStorage.aziranavstyles === "icon-hover") ? IconHover(actionfunction) : '';

    (localStorage.bgimage1) ? bgImage1(actionfunction) : '';
    (localStorage.bgimage2) ? bgImage2(actionfunction) : '';
    (localStorage.bgimage3) ? bgImage3(actionfunction) : '';
    (localStorage.bgimage4) ? bgImage4(actionfunction) : '';
    (localStorage.bgimage5) ? bgImage5(actionfunction) : '';
    (localStorage.aziralayout == 'horizontal') && HorizontalClick(actionfunction);
    (localStorage.aziralayout == 'vertical') && Vertical(actionfunction);
    //primitive 
    if (
        localStorage.getItem("aziraltr") == null ||
        localStorage.getItem("aziraltr") == "ltr"
    )

        // Theme Primary: Colors: Start
        switch (localStorage.primaryRGB) {
            case '58, 88, 146':
                primaryColor1(actionfunction);

                break;
            case '92, 144, 163':
                primaryColor2(actionfunction);

                break;
            case "161, 90, 223":
                primaryColor3(actionfunction);

                break;
            case "78, 172, 76":
                primaryColor4(actionfunction);

                break;
            case "223, 90, 90":
                primaryColor5(actionfunction);

                break;
            default:
                break;
        }
    // Theme Primary: Colors: End

    switch (localStorage.darkBgRGB1) {
        case '20, 30, 96':
            backgroundColor1(actionfunction);

            break;
        case '8, 78, 115':
            backgroundColor2(actionfunction);

            break;
        case '90, 37, 135':
            backgroundColor3(actionfunction);

            break;
        case '24, 101, 51':
            backgroundColor4(actionfunction);

            break;
        case '120, 66, 20':
            backgroundColor5(actionfunction);

            break;
        default:
            break;
    }

    //layout
    if (localStorage.aziraverticalstyles) {
        const verticalStyles = localStorage.getItem("aziraverticalstyles");

        switch (verticalStyles) {
            case "default":
                Defaultmenu(actionfunction);
                break;
            case "closed":
                Closedmenu(actionfunction);
                break;
            case "icontext":
                iconText(actionfunction);
                break;
            case "overlay":
                iconOverayFn(actionfunction);
                break;
            case "detached":
                DetachedFn(actionfunction);
                break;
            case "doublemenu":
                DoubletFn(actionfunction);
                break;
        }
    }

    //Theme Primary:
    if (localStorage.dynamiccolor) {
        const theme = store.getState();
        actionfunction({
            ...theme,
            "colorPrimaryRgb": localStorage.dynamiccolor,
            "colorPrimary": localStorage.dynamiccolor
        });
    }
    //Theme BAckground:
    //Theme BAckground:
    if (localStorage.darkBgRGB1) {
        const theme = store.getState();
        actionfunction({
            ...theme,
            "bodyBg1": localStorage.darkBgRGB1,
            "bodyBg2": localStorage.darkBgRGB2,
            "darkBg": localStorage.darkBgRGB3,
            "inputBorder": localStorage.darkBgRGB4,
            "dataThemeMode": "dark",
            "dataHeaderStyles": "dark",
            "dataMenuStyles": "dark",
        });
        // Dark(actionfunction);
    }
    switch (localStorage.aziraMenu) {
        case 'light':
            lightMenu(actionfunction);
            break;
        case 'dark':
            darkMenu(actionfunction);

            break;
        case 'color':
            colorMenu(actionfunction);

            break;
        case 'gradient':
            gradientMenu(actionfunction);

            break;
        case 'transparent':
            transparentMenu(actionfunction);

            break;
        default:
            break;
    }
    // ThemeColor Header Colors: start
    switch (localStorage.aziradefaultHeader) {
        case 'light':
            defaultlightHeader(actionfunction);

            break;
        case 'dark':
            defaultdarkHeader(actionfunction);

            break;
        case 'color':
            defaultcolorHeader(actionfunction);

            break;
        case 'gradient':
            defaultgradientHeader(actionfunction);

            break;
        case 'transparent':
            defaulttransparentHeader(actionfunction);

            break;
        default:
            break;
    }
    switch (localStorage.aziraHeader) {
        case 'light':
            lightHeader(actionfunction);

            break;
        case 'dark':
            darkHeader(actionfunction);

            break;
        case 'color':
            colorHeader(actionfunction);

            break;
        case 'gradient':
            gradientHeader(actionfunction);

            break;
        case 'transparent':
            transparentHeader(actionfunction);

            break;
        default:
                break;
    }
};
